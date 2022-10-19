#!/bin/bash

# This script is for quick building & deploying of the svg-generator.
# It also serves as a reference for the commands used for building & deploying Solana svg-generators.
# Run this bad boy with "bash cicd.sh" or "./cicd.sh"

cargo build-bpf --manifest-path=./svg-generator/Cargo.toml
solana program deploy ./target/deploy/svg_generator.so