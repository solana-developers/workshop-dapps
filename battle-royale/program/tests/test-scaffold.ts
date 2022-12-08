import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TestScaffold } from "../target/types/test_scaffold";

describe("test-scaffold", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TestScaffold as Program<TestScaffold>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
