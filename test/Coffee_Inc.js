const { expect } = require("chai");
const hre = require("hardhat");

describe("Coffee_Inc contract", function () {
  // global vars
  let Token;
  let Coffee_Inc;
  let owner;
  let addr1;
  let addr2;
  let tokenCap = 100000000;
  let tokenBlockReward = 50;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("Coffee_Inc");
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    Coffee_Inc = await Token.deploy(tokenCap, tokenBlockReward);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await Coffee_Inc.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await Coffee_Inc.balanceOf(owner.address);
      expect(await Coffee_Inc.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the max capped supply to the argument provided during deployment", async function () {
      const cap = await Coffee_Inc.cap();
      expect(Number(ethers.formatEther(cap))).to.equal(tokenCap);
    });

    it("Should set the blockReward to the argument provided during deployment", async function () {
  const blockReward = await Coffee_Inc.blockReward();
  expect(Number(ethers.formatEther(blockReward))).to.equal(tokenBlockReward);
});
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await Coffee_Inc.transfer(addr1.address, 50);
      const addr1Balance = await Coffee_Inc.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await Coffee_Inc.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await Coffee_Inc.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await Coffee_Inc.balanceOf(owner.address);
      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        Coffee_Inc.connect(addr1).transfer(owner.address, 1)
      ).to.be.reverted;

      // Owner balance shouldn't have changed.
      expect(await Coffee_Inc.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await Coffee_Inc.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await Coffee_Inc.transfer(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2.
      await Coffee_Inc.transfer(addr2.address, 50);

      // Check balances.
      const finalOwnerBalance = await Coffee_Inc.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - BigInt(150));

      const addr1Balance = await Coffee_Inc.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await Coffee_Inc.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});
