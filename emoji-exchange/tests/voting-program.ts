import * as anchor from "@project-serum/anchor";


describe("voting-program", async () => {

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const idl = require("./voting_program.json");
  const program = new anchor.Program(
    idl, 
    new anchor.web3.PublicKey("5dJaDcqnRNeMU8pK17HmR2BqwC7P8RpNbpsJp2cX32yb"), 
    provider
  );

  const candidateId = 1;
  const candidateName = "Joe C";

  const candidatePubkey = anchor.web3.PublicKey.findProgramAddressSync(
    [ Buffer.from("candidate"), Buffer.from(candidateId.toString()) ], 
    program.programId,
  )[0]

  it("Create a candidate to vote for", async () => {
    
    await program.methods.createCandidate(
      candidateId,
      candidateName,
    )
      .accounts({
        candidateAccount: candidatePubkey,
        authority: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet.payer])
      .rpc();
  });

  it("Cast a vote", async () => {
    
    await program.methods.castVote()
      .accounts({
        candidateAccount: candidatePubkey,
        payer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet.payer])
      .rpc();
      await printVotes();
  });

  it("Cast a vote", async () => {
    
    await program.methods.castVote()
      .accounts({
        candidateAccount: candidatePubkey,
        payer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet.payer])
      .rpc();
      await printVotes();
  });

  async function printVotes() {
    await delay(2);
    const account = await program.account.candidate.fetch(candidatePubkey);
    console.log("-------------------------------------------------------------------------------");
    console.log(`Candidate  : ${account.candidateName}`);
    console.log(`Vote Count : ${account.voteCount}`);
  }

  function delay(s: number) {
    return new Promise( resolve => setTimeout(resolve, s * 1000) );
  }
});