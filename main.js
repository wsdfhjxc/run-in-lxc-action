const core = require("@actions/core");
const process = require("process");
const childProcess = require("child_process");

function raiseError(message) {
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

    if (result.status != 0) {
        if (options.printErrors) {
            process.stdout.write(result.stderr.toString());
        }
        if (options.haltOnError) {
            raiseError("Error while executing a command on host!");
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
    if (process.platform == "linux") {
        if (!execHostCommand("cat /etc/os-release", {
                printOutput: false
            }).stdout.includes("Ubuntu")) {
            raiseError("This action requires an Ubuntu-based runner");
        }
    }

    console.log("*** Reading input parameters");
    const distr = core.getInput("distr");
    const release = core.getInput("release");
    const arch = core.getInput("arch");
    const runScript = core.getInput("run-script");

    // Using the following tutorial for reference:
    // https://linuxcontainers.org/lxc/getting-started

    console.log("*** Installing LXC stuff");
    execHostCommand("sudo apt install -y lxc", {
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
    execHostCommand(`sudo lxc-start -n ${name}`);

    console.log("*** Starting the provided script");
    execHostCommand(`sudo lxc-attach -n ${name} -- bash -c "\
                     cd '${runInDir}' && './${runScript}'"`, {
        haltOnError: false
    });

    console.log("*** Stopping the LXC container");
    execHostCommand(`sudo lxc-stop -n ${name}`);

    console.log("*** Getting files from the LXC container");
    execHostCommand(`sudo cp -a "${rootfsRunInDir}/." .`);

    console.log("*** Destroying the LXC container");
    execHostCommand(`sudo lxc-destroy -n ${name}`);

} catch (error) {
    core.setFailed(error.message);
}
