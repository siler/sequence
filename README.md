# Welcome to Sequence

Sequence is a sequence diagramming tool similar to WebSequenceDiagrams.

# Commands

This package is the root package of an [`npm workspace`](https://docs.npmjs.com/cli/v8/using-npm/workspaces). NPM commands that interact with dependencies like `npm install` or `npm update` should be run from the root directory. Use the `-w <packageName>` option to target specific packages. For example, to install Express for the server package run `npm -w server install express`.

To create a new package, run `npm init -w <packageName>`.
All other tasks (builds, cleaning, etc.) are run with [just](https://github.com/casey/just). Run `just`, or `just <package>/` for commands lists with descriptions, or look at the `justfile`s.

## Workflows

For frontend work use `just frontend`, this starts the Create React App server and rebuilds `core` when files change.

When testing the server, use `just server`. This starts the server with `nodemon` and rebuilds `core` and `frontend` on change.

A docker image tagged `sequence` can be created with `just image`. A container can be started on port 3000 with `just container`.
