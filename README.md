# Welcome to Realize

Realize is a sequence diagramming tool similar to WebSequenceDiagrams.

# Commands

This package is the root package of an `npm workspace`. NPM commands that interact with dependencies like `npm install` or `npm update` should be run from the root directory.
To create a new package, run `npm init -w <packageName>`.
All other task running (builds, cleaning, etc.) is done with [just](https://github.com/casey/just). Run `just`, or `just <package>` for more commands lists.

## Workflows

Front end work is easy with Create React App, run `just frontend/start`. If changes are made to the syntax parser, don't forget to run `just frontend/generate` before building `frontend`.

When testing the server, use `just server` to run and reload the server itself. Served packages can then be built with `just rebuild` or `just sequence/build` and `just frontend/build` individually. Remember, if `sequence` changes `frontend` needs to be built as well.

A docker image tagged `realize` can be created with `just image`. A container can be started on port 3000 with `just container`.