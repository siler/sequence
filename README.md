# Welcome to Sequence

Sequence is a sequence diagramming tool similar to WebSequenceDiagrams.

# Commands

This package is the root package of an [`npm workspace`](https://docs.npmjs.com/cli/v8/using-npm/workspaces). NPM commands that interact with dependencies like `npm install` or `npm update` should be run from the root directory. Use the `-w <packageName>` option to target specific packages. For example, to install Express for the server package run `npm -w server install express`.

To create a new package, run `npm init -w <packageName>`.
All other tasks (builds, cleaning, etc.) are run with [just](https://github.com/casey/just). Run `just`, or `just <package>` for commands lists with descriptions, or look at the `justfile`s.

## Workflows

Front end work is easy with Create React App, run `just frontend/start`. If changes are made to the syntax parser, don't forget to run `just frontend/generate` before building `frontend`.

When testing the server, use `just server` to run and reload the server itself. Served packages can then be built with `just rebuild` or `just core/build` and `just frontend/build` individually. Remember, if `core` changes `frontend` needs to be built as well.

A docker image tagged `sequence` can be created with `just image`. A container can be started on port 3000 with `just container`.
