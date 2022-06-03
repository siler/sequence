# Welcome to Realize

Realize is a sequence diagramming tool similar to WebSequenceDiagrams.

# Commands

This package is the root package of an `npm workspace`. NPM commands that interact with dependencies like `npm install` or `npm update` should be run from the root directory.
To create a new package, run `npm init -w <packageName>`.
All other task running (builds, cleaning, etc.) is done with [just](https://github.com/casey/just). See the `justfile`s in each package for more information, or run `just`.