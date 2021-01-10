# Run in LXC

This is a GitHub action for running commands or scripts in LXC containers.

## Table of Contents

- [Introduction](#introduction)
- [Configuration and usage](#configuration-and-usage)
  - [Input parameters](#input-parameters)
  - [Output parameters](#output-parameters)
  - [Accessing post-run artifacts](#accessing-post-run-artifacts)
- [License](#license)
- [Changelog](#changelog)

## Introduction

At the moment of writing this, the only available Linux runners on GitHub are Ubuntu-based. But sometimes, depending on your particular use case, you might want to test or build something on a specific Linux distribution (be it Fedora, Debian, openSUSE, or whatever is supported by LXC). This action has been created to address that.

## Configuration and usage

The action can be used as a step in a job of a workflow, e.g.:

```yaml
jobs:
  test-fedora-33:
    runs-on: ubuntu-latest
    steps:
      - name: Run in LXC (Fedora 33)
        uses: wsdfhjxc/run-in-lxc-action@1.x
        with:
          distr: fedora
          release: 33
          run: |
            echo "Testing"
            ./scripts/test.sh
```

> _Note:_ The `@1.x` suffix is required, as the `main` branch lacks `node_modules`.

> _Note:_ The action can be used only on a Ubuntu-based Linux runner, e.g. `ubuntu-latest`.

### Input parameters

| Parameter | Description           | Required | Default value | Example value     |
| --------- | --------------------- | -------- | ------------- | ----------------- |
| `distr`   | distro's name         | yes      | -             | fedora            |
| `release` | distro's version      | yes      | -             | 33                |
| `run`     | command(s) to run     | yes      | -             | ./scripts/test.sh |
| `shell`   | command interpreter   | no       | sh            | bash              |

> _Note:_ Possible values for the `distr` and `release` parameters can be found [here](https://images.linuxcontainers.org).

> _Note:_ The initial working directory for the command is a mirror of your repository's root directory.

> _Note:_ Unlike GitHub Actions' standard behavior in regard to the `run` parameter, this action does not mark a step as failed if any of the provided commands returns a non-zero exit code, but only if it's the very last command.

### Output parameters

| Parameter    | Description         | Possible values            |
| ------------ | ------------------- | -------------------------- |
| `error-type` | action error's type | _empty_, command, internal |

> _Note:_ The value can be accessed via: `${{ steps.your-step-id.outputs.error-type }}`

> _Note:_ If the value isn't empty, "command" means that the very last provided command has returned a non-zero exit code, while "internal" means that the action itself has failed at configuring or starting the LXC container.

### Accessing post-run artifacts

All artifacts created in the initial directory are copied to the runner's current directory.

> _Note:_ If the action fails with a "command" error, any artifacts are also copied, regardless.

## License

[GNU General Public License v3.0](LICENSE)

> _Note:_ Does not apply to the `node_modules` directory in the `1.x` branch.

## Changelog

Changes are listed [here](CHANGELOG.md) and in the [releases section](https://github.com/wsdfhjxc/run-in-lxc-action/releases).
