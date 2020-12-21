# Run in LXC

This is a GitHub action for running scripts in LXC containers, which can be used in your workflows.

At the moment of writing this, the only available Linux runners on GitHub are Ubuntu-based. But sometimes, depending on your particular use case, you might want to test or build something on a specific Linux distribution (be it Fedora, Debian, openSUSE, or whatever is supported by LXC). This action has been created to address that.

The action can be used only on a Ubuntu-based Linux runner, e.g. `ubuntu-20.04` or `ubuntu-latest`.

## Configuration and usage

The action can be used as a step in a job of a workflow, e.g.:

```yaml
jobs:
  test-fedora-33:
    runs-on: ubuntu-20.04
    steps:
      - name: Run in LXC (Fedora 33)
        uses: wsdfhjxc/run-in-lxc-action@v1
        with:
          distr: fedora
          release: 33
          run-script: scripts/test.sh
```

Note: The `@v1` suffix is required, as the `main` branch doesn't contain `node_modules`.

### Input parameters

| Parameter    | Description           | Required | Default value | Example value   |
| ------------ | --------------------- | -------- | ------------- | --------------- |
| `distr`      | distro's name         | yes      | -             | fedora          |
| `release`    | distro's version      | yes      | -             | 33              |
| `arch`       | distro's architecture | no       | amd64         | amd64           |
| `run-script` | path to the script    | yes      | -             | scripts/test.sh |

Note: Path to the script is treated as relative to your repository's root directory.

Note: Possible values for the `distr`, `release` and `arch` parameters can be retrieved [here](https://images.linuxcontainers.org).

### Accessing post-run artifacts

All artifacts created by the script in its initial working directory are copied to the runner's current directory.

## License

Copyright (C) 2020 wsdfhjxc

[GNU General Public License v3.0](LICENSE)
