const core = require("@actions/core");
const process = require("process");
const childProcess = require("child_process");

function raiseError(message) {
    throw new Error(message);
}

function execHostCommand(command, silent) {
    let result = childProcess.spawnSync("bash", ["-c", command]);

    if (!silent) {
        process.stdout.write(result.stdout.toString());
    }

    if (result.status != 0) {
        if (!silent) {
            process.stdout.write(result.stderr.toString());
        }
        raiseError("Error while executing a command on host!");
    }

    return {
        status: result.status,
        stdout: result.stdout.toString(),
        stderr: result.stderr.toString()
    };
}

try {
    // Check runner's platform
    if (process.platform == "linux") {
        if (!execHostCommand("cat /etc/os-release", true).stdout.includes("Ubuntu")) {
            raiseError("This action requires an Ubuntu-based runner");
        }
    }

    // Read input parameters
    const name = core.getInput("name");
    const distr = core.getInput("distr");
    const release = core.getInput("release");
    const arch = core.getInput("arch");
    const runScript = core.getInput("run-script");

    // Using the following tutorial for reference:
    // https://linuxcontainers.org/lxc/getting-started

    // Install LXC stuff
    execHostCommand("sudo apt install -y lxc");

    // Download OS image and create the LXC container
    execHostCommand(`sudo lxc-create -n ${name} -t download -- \
                     -d "${distr}" -r "${release}" -a "${arch}"`);

    // Prepare working ditectory inside the LXC container
    const runInDir = "/home/run-in-lxc";
    const rootfsDir = `/var/lib/lxc/${name}/rootfs`;
    const rootfsRunInDir = `${rootfsDir}${runInDir}`;
    execHostCommand(`sudo mkdir "${rootfsRunInDir}"`);

    // Copy current dir's content into the RUN_IN_LXC_DIR
    execHostCommand(`sudo cp -a . "${rootfsRunInDir}"`);

    // Start the LXC container
    execHostCommand(`sudo lxc-start -n ${name}`);

    console.log("*** The script starts here");

    // Run the user's script
    execHostCommand(`sudo lxc-attach -n ${name} -- bash -c "\
                     cd '${runInDir}' && './${runScript}'"`);

    console.log("*** The script finishes here");

    // Stop the LXC container
    execHostCommand(`sudo lxc-stop -n ${name}`);

    // Copy files from the LXC container
    execHostCommand(`sudo cp -a "${rootfsRunInDir}/." .`);

} catch (error) {
    core.setFailed(error.message);
}
