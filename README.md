# Run in LXC

This is a GitHub action for running shell commands or scripts in disposable LXC containers.

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
          command: ./scripts/test.sh
```

Note: The `@v1` suffix is required, as the `main` branch doesn't contain `node_modules`.

### Input parameters

| Parameter | Description           | Required | Default value | Example value     |
| --------- | --------------------- | -------- | ------------- | ----------------- |
| `distr`   | distro's name         | yes      | -             | fedora            |
| `release` | distro's version      | yes      | -             | 33                |
| `arch`    | distro's architecture | no       | amd64         | amd64             |
| `command` | command to run        | yes      | -             | ./scripts/test.sh |

Note: Possible values for the `distr`, `release` and `arch` parameters can be retrieved [here](https://images.linuxcontainers.org).

Note: The initial working directory for the command is a mirror of your repository's root directory.

### Output parameters

| Parameter    | Description         | Possible values            |
| ------------ | ------------------- | -------------------------- |
| `error-type` | action error's type | _empty_, command, internal |

Note: The value can be accessed via `${{ steps.your-step-id.outputs.error-type }}`

Note: If the value isn't empty, "command" means that the provided command has returned a non-zero exit code, while "internal" means that the action itself has failed at configuring or starting the LXC container.

### Accessing post-run artifacts

All artifacts created in the initial working directory are copied to the runner's current directory.

Note: This also applies even if the action fails with a "command" error (artifacts are copied regardless).

## License

Copyright (C) 2020 wsdfhjxc

[GNU General Public License v3.0](LICENSE)
