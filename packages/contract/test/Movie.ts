import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseGwei } from "viem";
import ethers from "ethers";

describe("MovieContract", function () {
  // Fixture to deploy the contract
  async function deployMovieTokenFixture() {
    const [owner, account1] = await hre.viem.getWalletClients();




    const movieContract = await hre.viem.deployContract("Movie", [owner.account.address]); // Add type assertion to fix the problem
    const publicClient = await hre.viem.getPublicClient();

    return { movieContract, owner, account1, publicClient };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { movieContract, owner } = await loadFixture(deployMovieTokenFixture);

      expect(await movieContract.read.owner()).to.equal(getAddress(owner.account.address));
    });
  });
  describe("Minting", function () {
    it("Should mint a new token with clips", async function () {
      const { movieContract, owner, account1, publicClient } = await loadFixture(deployMovieTokenFixture);



      const clips = [
        { id: BigInt(1), name: "Clip1", clip_url: "http://clip1.com", video_cid: "http://movie1.com" },
        { id: BigInt(2), name: "Clip2", clip_url: "http://clip2.com", video_cid: "http://movie2.com" },
        { id: BigInt(3), name: "Clip3", clip_url: "http://clip3.com", video_cid: "http://movie3.com" },
        { id: BigInt(4), name: "Clip4", clip_url: "http://clip4.com", video_cid: "http://movie4.com" }
      ]
      const seed = BigInt(1);
      const name = "token 1";
      const desc = "token 1";
      const image = "http://image.com";
      const json = "http://json.com";

      const hash = await movieContract.write.mint([clips, name, desc, image, json, seed], { account: publicClient.account });



      await publicClient.waitForTransactionReceipt({ hash });
      const minted = await movieContract.getEvents.TokenMinted;

      // expect(minted.length).to.eq(1);
      expect(minted).to.be.lengthOf(1);

    });
  });
});
