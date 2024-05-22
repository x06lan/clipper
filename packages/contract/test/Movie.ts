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

    return { movieContract, owner, account1 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { movieContract, owner } = await loadFixture(deployMovieTokenFixture);

      expect(await movieContract.read.owner()).to.equal(getAddress(owner.account.address));
    });
  });
  describe("Minting", function () {
    it("Should mint a new token with clips", async function () {
      const { movieContract, owner, account1 } = await loadFixture(deployMovieTokenFixture);

      const clips = [
        { id: BigInt(1), name: "Clip1", image_url: "http://clip1.com", movie_url: "http://movie1.com" },
        { id: BigInt(2), name: "Clip2", image_url: "http://clip2.com", movie_url: "http://movie2.com" },
        { id: BigInt(3), name: "Clip3", image_url: "http://clip3.com", movie_url: "http://movie3.com" },
        { id: BigInt(4), name: "Clip4", image_url: "http://clip4.com", movie_url: "http://movie4.com" }
      ]
      const seed = BigInt(1);
      const name = "token 1";
      const image = "http://image.com";

      const id = await movieContract.write.mint([clips, name, image, seed], { account: owner.account.address });

      expect(id).to.equal(seed);
    });
  });
});
