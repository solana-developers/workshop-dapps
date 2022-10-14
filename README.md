# Solana Workshop dApps

Your instructor may use one of the applications stored in this repository to conduct a Building on Solana workshop.
**There are a few key elements of this repository to understand:**
* :blue_book: Resources to learn about Solana development - whether you're beginner or intermediate level, can be found in the [Resources](#resources-for-learning-solana-development) section below.
* :wrench: Setup steps are detailed in the [How to Code Along](#how-to-code-along-in-workshops) section.
    * You can use a [web-based IDE](#setting-up-solana-playground-ide), which allows you to build & deploy programs without installation of any toolkits (ie. `solana`, `rust`, `cargo`).
    * You can also code along with your [local setup](#local-setup), if you've got everything installed.
* :key: You'll get the best experience from these workshops by cloning down the [redacted code](#using-the-redacted-code-to-code-along) and filling in the blank sections as you follow your instructor through the session.
    * You can choose to simply clone down the complete application & deploy that, but this may not be as insightful!
* :warning: If at any point you get stuck or have a question, you can share your workspace with your instructor - both for the [web-based IDE](#sharing-your-workspace-on-solana-playground-ide) & [your local setup](#sharing-your-workspace-from-your-local-setup).
---

## How to Code Along in Workshops

### Setting up Solana Playground IDE
* Go to https://beta.solpg.io/ and when you open the page for the first time, you'll see a template Solana program repository.
    * You can choose to delete this template Solana repository.
* Click the "Wallet Not Connected" button in the bottom left & follow the prompts to either upload your existing wallet or generate a new one.
* To create a new repository (called a workspace), click the "New" button in the upper left-hand side.
    * Choose your toolkit: Solana Native, Anchor, or Seahorse.
    * Name it, and click "Create".
* :key: If you want to instead import an existing project, SolPG supports importing GitHub repositories as well. 
    * Choose "Import from GitHub" & select the framework your repository is built using (Native, Anchor, Seahorse).
    * Follow the instructions detailed in the pop-up window about the specific path to provide.
    * Name it, and click "Import". You should see your program code in SolPG!
### Local Setup
* Install the Solana CLI 
    * Note: Requires Rust & Cargo full installation.
* Configure the Solana CLI's Cluster
    * `solana config set -ul`    : Sets cluster to `http://localhost:8899`
    * `solana config set -ud`    : Sets cluster to `https://api.devnet.solana.com`
    * `solana config set -ut`    : Sets cluster to `https://api.testnet.solana.com`
    * `solana config set -um`    : Sets cluster to `https://api.mainnet-beta.solana.com`
* Configure the Solana CLI's Wallet
    * `solana-keygen new`        : This will generate a new keypair to `~/.config/solana/id.json`
    * Use the `-o` flag to change that output location.
    * Use the `--help` flag to get more information about the CLI commands.
* Building programs with Cargo
    * `cargo new --lib program-name`
    * Ensure you add the following config to Cargo.toml under `[lib]`: `crate-type = ["cdylib", "lib"]`
    * `cargo build-sbf --manifest-path=path/to/Cargo.toml`
### Using the Redacted Code to Code Along
* Simply clone this repo but use only the `redacted-code` branch
    * `git clone git@github.com:solana-developers/workshop-dapps.git`
    * `git checkout redacted-code`
### Sharing Your Workspace on Solana Playground IDE
* Click the little arrow symbol underneath your project's name/path. If you hover over it, it should say "Share" (Not "Export").
    * This will generate a unique URL that will allow anyone to route to your specific SolPG workspace.
    * Share this link with the instructor!
### Sharing Your Workspace from Your Local Setup
* Currently the best way to do this is by using GitHub.
    * You can push your most recent changes up to GitHub
    * Share the link with the instructor
    * Instructor can import the project into his/her SolPG instance

## Resources for Learning Solana Development

### Web-based IDE
* [Solana Playground IDE](https://beta.solpg.io/)
### Wallets
* [Phantom Wallet](https://phantom.app/download)
* [Solflare Wallet](https://solflare.com/)
### Local Toolkit Installation
* [NodeJS](https://nodejs.org/en/download/)
* [Rust](https://rustup.rs/)
* [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
* [Anchor](https://www.anchor-lang.com/)
* [Seahorse](https://seahorse-lang.org/)
### dApp & Program Development
* [Spawn a Template Project Repo automatically!](https://www.npmjs.com/package/create-solana-dapp)
* [Solana Cookbook](https://solanacookbook.com)
* [Program Examples](https://github.com/solana-developers/program-examples)
* [Client Examples](https://github.com/solana-developers/web3-examples)
* [Solana Bytes YouTube Tutorials](https://www.youtube.com/playlist?list=PLilwLeBwGuK51Ji870apdb88dnBr1Xqhm)
* [Rust Solana YouTube Tutorials](https://www.youtube.com/playlist?list=PLUBKxx7QjtVnU3hkPc8GF1Jh4DE7cf4n1)
* [Full Solana Course](https://github.com/Unboxed-Software/solana-course)
* [Solana Core Docs](https://docs.solana.com/)
### Additional Tools
* [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
* [Solana Pay](https://github.com/solana-labs/solana-pay)