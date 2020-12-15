const core = require("@actions/core");
const process = require("process");
const childProcess = require("child_process");

function raiseError(message) {
    throw new Error(message);
}

function execHostCommand(command) {
    let result = childProcess.spawnSync("bash", ["-c", command]);
    process.stdout.write(result.stdout.toString());

    if (result.status != 0) {
        process.stdout.write(result.stderr.toString());
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
        if (!execHostCommand("cat /etc/os-release").stdout.includes("Ubuntu")) {
            raiseError("This action requires an Ubuntu-based runner");
        }
    }

    // Read input parameters
    const name = core.getInput("name");
    const distr = core.getInput("distr");
    const release = core.getInput("release");
    const arch = core.getInput("arch");
    const scriptPath = core.getInput("script-path");

    // Using the following tutorial for reference:
    // https://linuxcontainers.org/lxc/getting-started

    // Install LXC stuff
    execHostCommand("sudo apt install -y lxc");

    // Enable network access
    execHostCommand(`echo "$USER veth lxcbr0 1" | \
                     sudo tee -a "/etc/lxc/lxc-usernet" > /dev/null`);

    // Copy the default LXC config
    const configFile = "$HOME/.config/lxc/default.conf";
    execHostCommand(`mkdir -p "$HOME/.config/lxc" && \
                     cp "/etc/lxc/default.conf" "${configFile}" && \
                     echo "lxc.idmap = u 0 100000 65536" >> "${configFile}" && \
                     echo "lxc.idmap = g 0 100000 65536" >> "${configFile}"`);

    // Download OS image and create the LXC container
    execHostCommand(`lxc-create -n ${name} -t download -- \
                     -d "${distr}" -r "${release}" -a "${arch}"`);

    // Prepare working ditectory inside the LXC container
    const runInDir = "/home/run-in-lxc";
    const rootfsDir = `$HOME/.local/share/lxc/${name}/rootfs`;
    const rootfsRunInDir = `${rootfsDir}${runInDir}`;
    execHostCommand(`sudo mkdir "${rootfsRunInDir}"`);
    execHostCommand(`sudo chmod 777 "${rootfsRunInDir}"`);

    // Export the RUN_IN_LXC_DIR environment variable
    core.exportVariable("RUN_IN_LXC_DIR", rootfsRunInDir);

    // Copy current dir's content into the RUN_IN_LXC_DIR
    execHostCommand(`cp -r . "${rootfsRunInDir}"`);

    // Start the LXC container
    execHostCommand(`lxc-start -n ${name}`);

    // Run the user's script
    execHostCommand(`lxc-attach -n ${name} -- bash -c "\
                     cd '${runInDir}' && './${scriptPath}'"`);

    // Stop the LXC container
    execHostCommand(`lxc-stop -n ${name}`);

} catch (error) {
    core.setFailed(error.message);
}
