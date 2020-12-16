# Run in LXC

This is a GitHub action for running scripts in LXC containers, which can be used in your workflows.

At the moment of writing this, the only available Linux runners on GitHub are Ubuntu-based. But sometimes, depending on your particular use case, you might want to test or build something on a specific Linux distribution (be it Fedora, Debian, openSUSE, or whatever is supported by LXC). The action has been created to address that.

The action can be used only on a Ubuntu-based Linux runner, e.g. `ubuntu-latest`.

## Configuration and usage

The action can be used as a step in a job of a workflow, e.g.:

```yaml
jobs:
  test-fedora-33:
    runs-on: ubuntu-latest
    steps:
      - name: "Run in LXC (Fedora 33)"
        uses: wsdfhjxc/run-in-lxc-action@v1
        with:
          distr: fedora
          release: "33"
          run-script-path: "scripts/test.sh"
```

Note: The `@v1` suffix must be preserved, as only the corresponding `v1` branch contains `node_modules`.

### Input parameters

| Parameter         | Description            | Required | Default value | Example value   |
| ----------------- | ---------------------- | -------- | ------------- | --------------- |
| `name`            | Container's name       | yes      | container     | container       |
| `distr`           | Distro's name          | yes      | -             | fedora          |
| `release`         | Distro's version       | yes      | -             | 33              |
| `arch`            | Distro's architecture  | yes      | amd64         | amd64           |
| `run-script-path` | Path to the script     | yes      | -             | scripts/test.sh |

Note: Different names must be used if more than one LXC container will be used in a single job.

Note: Path to the script is treated as relative to your repository's root directory.

Note: Possible values for the `distr`, `release`, `arch` parameters can be retrieved [here](https://images.linuxcontainers.org).

### Accessing post-run artifacts

All artifacts created by the script (in the initial directory) are copied to the runner's current directory.
