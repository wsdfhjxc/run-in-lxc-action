const core = require("@actions/core");
const process = require("process");
const childProcess = require("child_process");

function raiseError(type) {
    core.setOutput("error-type", type);
    let message = "";
    if (type == "internal") {
        message += "The action itself has failed at configuring or starting the LXC container";
    } else if (type == "command") {
        message += "The provided command has returned a non-zero exit code";
    }
    throw new Error(message);
}

function execHostCommand(command, options) {
    if (options == undefined) {
        options = {};
    }
    if (options.printOutput == undefined) {
        options.printOutput = true;
    }
    if (options.printErrors == undefined) {
        options.printErrors = true;
    }
    if (options.haltOnError == undefined) {
        options.haltOnError = true;
    }

    let result = childProcess.spawnSync("bash", ["-c", command]);

    if (options.printOutput) {
        process.stdout.write(result.stdout.toString());
    }
    if (options.printErrors) {
        process.stdout.write(result.stderr.toString());
    }

    if (result.status != 0) {
        if (options.haltOnError) {
            raiseError("internal");
        } else {
            console.log("*** There were some errors!");
        }
    }

    return {
        status: result.status,
        stdout: result.stdout.toString(),
        stderr: result.stderr.toString()
    };
}

try {
    console.log("*** Checking runner's platform");
    if (process.platform != "linux" ||
        !execHostCommand("cat /etc/os-release", {
        printOutput: false
    }).stdout.includes("Ubuntu")) {
        raiseError("internal");
    }

    console.log("*** Reading input parameters");
    const distr = core.getInput("distr");
    const release = core.getInput("release");
    const arch = core.getInput("arch");
    const command = core.getInput("command");
    const shell = core.getInput("shell");

    // Using the following tutorial for reference:
    // https://linuxcontainers.org/lxc/getting-started

    console.log("*** Installing LXC stuff");
    execHostCommand(`sudo apt-get update && \
                     sudo apt-get install -y lxc`, {
        printOutput: false
    });

    console.log("*** Creating the LXC container");
    const name = `${distr}-${release}-${arch}`;
    execHostCommand(`sudo lxc-create -n ${name} -t download -- \
                     -d "${distr}" -r "${release}" -a "${arch}"`, {
        printOutput: false
    });

    console.log(`*** Created '${execHostCommand("sudo lxc-ls", {
        printOutput: false
    }).stdout.trim()}' LXC container`);

    console.log("*** Copying files to the LXC container");
    const runInDir = "/home/run-in-lxc";
    const rootfsDir = `/var/lib/lxc/${name}/rootfs`;
    const rootfsRunInDir = `${rootfsDir}${runInDir}`;
    execHostCommand(`sudo mkdir "${rootfsRunInDir}"`);
    execHostCommand(`sudo cp -a . "${rootfsRunInDir}"`);

    console.log("*** Starting the LXC container");
    execHostCommand(`sudo lxc-start -n ${name}`, {
        printOutput: false
    });

    console.log("*** Obtaining DHCP config in the LXC container")
    execHostCommand(`sudo lxc-attach -n ${name} -- sh -c "\
                     dhclient -r && dhclient || sleep 5s"`, {
        printOutput: false,
        printErrors: false,
        haltOnError: false
    });

    console.log("*** Running the command inside the LXC container");
    let commandStatus = execHostCommand(`sudo lxc-attach -n ${name} -- sh -c "\
                                         cd '${runInDir}' || exit 1; ${command}"`, {
        haltOnError: false
    }).status;

    console.log("*** Stopping the LXC container");
    execHostCommand(`sudo lxc-stop -n ${name}`, {
        printOutput: false
    });

    console.log("*** Getting files from the LXC container");
    execHostCommand(`sudo cp -a "${rootfsRunInDir}/." .`, {
        printOutput: false
    });

    console.log("*** Destroying the LXC container");
    execHostCommand(`sudo lxc-destroy -n ${name}`, {
        printOutput: false
    });

    if (commandStatus != 0) {
        raiseError("command");
    }

} catch (error) {
    core.setFailed(error.message);
}
