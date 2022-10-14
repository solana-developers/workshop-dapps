#!/bin/bash

# This script is for quick building & deploying of the journal-program.
# It also serves as a reference for the commands used for building & deploying Solana journal-programs.
# Run this bad boy with "bash cicd.sh" or "./cicd.sh"

cargo build-bpf --manifest-path=./journal-program/Cargo.toml
solana program deploy ./target/deploy/journal.so