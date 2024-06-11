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
      expect(await movieContract.read.symbol()).to.equal("🎥");
      expect(await movieContract.read.supportsInterface([`0x2a55205a`])).to.equal(false);
    });
  });
  describe("Minting", function () {
    it("Should mint a new token with clips", async function () {
      const { movieContract, owner, account1, publicClient } = await loadFixture(deployMovieTokenFixture);



      const clips = [
        { id: BigInt(1), name: "Clip1", video_cid: "http://movie1.com" },
        { id: BigInt(2), name: "Clip2", video_cid: "http://movie2.com" },
        { id: BigInt(3), name: "Clip3", video_cid: "http://movie3.com" },
        { id: BigInt(4), name: "Clip4", video_cid: "http://movie4.com" }
      ]
      const seed = BigInt(1);
      const name = "token 1";
      const desc = "token 1";
      const image = "http://image.com";
      const json = "http://json.com";

      await movieContract.write.mint([clips, name, desc, image, json, seed], { account: publicClient.account });

      const tokens = await movieContract.read.ownedTokens({ account: publicClient.account });
      expect(tokens.length).to.eq(1);

      const token = await movieContract.read.tokenInfo([tokens[0]], { account: publicClient.account });
      expect(token.name).to.eq(name);

      const tokenUrl = await movieContract.read.tokenURI([tokens[0]], { account: publicClient.account });
      expect(tokenUrl).to.eq(json);

      const clip = await movieContract.read.clipInfo([token.clips[0]], { account: publicClient.account });
      expect(clip.name).to.eq(clips[0].name);

    });

  });
  describe("Selling", function () {
    it("Should mint a new token selling and unsell", async function () {
      const { movieContract, owner, account1, publicClient } = await loadFixture(deployMovieTokenFixture);



      const clips = [
        { id: BigInt(1), name: "Clip1", video_cid: "http://movie1.com" },
        { id: BigInt(2), name: "Clip2", video_cid: "http://movie2.com" },

      ]
      const seed = BigInt(1);
      const name = "token 1";
      const desc = "token 1";
      const image = "http://image.com";
      const json = "http://json.com";
      const price = BigInt(1000000000000000000);

      await movieContract.write.mint([clips, name, desc, image, json, seed], { account: publicClient.account });

      const tokens = await movieContract.read.ownedTokens({ account: publicClient.account });
      expect(tokens.length).to.eq(1);


      await movieContract.write.sell([tokens[0], price], { account: publicClient.account });

      const sellingToken = await movieContract.read.sellingToken({ account: publicClient.account });
      expect(sellingToken.length).to.eq(1);
      expect(sellingToken[0]).to.eq(tokens[0]);

      const token = await movieContract.read.tokenInfo([tokens[0]], { account: publicClient.account });
      expect(token.selling).to.eq(true);
      expect(token.price).to.eq(price);

      await movieContract.write.unsell([tokens[0]], { account: publicClient.account });

      const new_token = await movieContract.read.tokenInfo([tokens[0]], { account: publicClient.account });
      expect(new_token.selling).to.eq(false);
      expect(new_token.price).to.eq(BigInt(0));

      const new_selling_token = await movieContract.read.sellingToken({ account: publicClient.account });
      expect(new_selling_token.length).to.eq(0);

    });

  });
  describe("Buying", function () {
    it("Should mint a new token with clips", async function () {
      const { movieContract, owner, account1, publicClient } = await loadFixture(deployMovieTokenFixture);



      const clips = [
        { id: BigInt(1), name: "Clip1", video_cid: "http://movie1.com" },
        { id: BigInt(2), name: "Clip2", video_cid: "http://movie2.com" },

      ]
      const seed = BigInt(1);
      const name = "token 1";
      const desc = "token 1";
      const image = "http://image.com";
      const json = "http://json.com";
      const price = BigInt(1000000000000000000);

      await movieContract.write.mint([clips, name, desc, image, json, seed], { account: publicClient.account });

      const tokens = await movieContract.read.ownedTokens({ account: publicClient.account });
      expect(tokens.length).to.eq(1);


      await movieContract.write.sell([tokens[0], price], { account: publicClient.account });

      await movieContract.write.buySellingToken([tokens[0]], { account: account1.account, value: price });

      const sellingToken = await movieContract.read.sellingToken({ account: account1.account });
      expect(sellingToken.length).to.eq(0);

      const new_tokens = await movieContract.read.ownedTokens({ account: account1.account });
      expect(new_tokens.length).to.eq(1);

    });

  });
  describe("Fuse", function () {
    it("Should mint two new token and merge", async function () {
      const { movieContract, owner, account1, publicClient } = await loadFixture(deployMovieTokenFixture);
      const clips1 = [
        { id: BigInt(1), name: "Clip1", video_cid: "http://movie1.com" },
        { id: BigInt(2), name: "Clip2", video_cid: "http://movie2.com" },
      ]
      const clips2 = [
        { id: BigInt(3), name: "Clip3", video_cid: "http://movie3.com" },
        { id: BigInt(4), name: "Clip4", video_cid: "http://movie4.com" },
      ]
      const seed1 = BigInt(1);
      const name1 = "token 1";
      const desc1 = "token 1";
      const image1 = "http://image.com";
      const json1 = "http://json.com";

      const seed2 = BigInt(2);
      const name2 = "token 2";
      const desc2 = "token 2";
      const image2 = "http://image.com";
      const json2 = "http://json.com";

      await movieContract.write.mint([clips1, name1, desc1, image1, json1, seed1], { account: publicClient.account });
      await movieContract.write.mint([clips2, name2, desc2, image2, json2, seed2], { account: publicClient.account });

      const tokens = await movieContract.read.ownedTokens({ account: publicClient.account });
      expect(tokens.length).to.eq(2);

      const seed3 = BigInt(3);
      const name3 = "token 3";
      const desc3 = "token 3";
      const image3 = "http://image.com";
      const json3 = "http://json.com";

      // await movieContract.write.fuse(, { account: publicClient.account });
      await movieContract.write.fuse([tokens[0], tokens[1], name3, image3, desc3, json3, seed3, [BigInt(1), BigInt(3), BigInt(2), BigInt(4)]], { account: publicClient.account });

      const newtokens = await movieContract.read.ownedTokens({ account: publicClient.account });
      expect(newtokens.length).to.eq(1);

      const parent = await movieContract.read.parent([newtokens[0]], { account: publicClient.account });
      expect(parent.length).to.eq(2);

      const isArchiveToken = await movieContract.read.isArchiveToken([tokens[0]], { account: publicClient.account });
      expect(isArchiveToken).to.eq(true);


    });
  });
  describe("Split", function () {
    it("Should mint a new token and split to two tokens", async function () {
      const { movieContract, owner, account1, publicClient } = await loadFixture(deployMovieTokenFixture);
      const clips = [
        { id: BigInt(1), name: "Clip1", video_cid: "http://movie1.com" },
        { id: BigInt(2), name: "Clip2", video_cid: "http://movie2.com" },
      ]

      const seed1 = BigInt(1);
      const name1 = "token 1";
      const desc1 = "token 1";
      const image1 = "http://image.com";
      const json1 = "http://json.com";



      await movieContract.write.mint([clips, name1, desc1, image1, json1, seed1], { account: publicClient.account });

      const tokens = await movieContract.read.ownedTokens({ account: publicClient.account });
      expect(tokens.length).to.eq(1);

      const seed = BigInt(2);

      const name2 = "token 2";
      const desc2 = "token 2";
      const image2 = "http://image.com";
      const json2 = "http://json.com";

      const name3 = "token 3";
      const desc3 = "token 3";
      const image3 = "http://image.com";
      const json3 = "http://json.com";

      // await movieContract.write.fuse(, { account: publicClient.account });
      await movieContract.write.split([tokens[0], seed, [clips[1].id], [clips[0].id], name2, name3, desc2, desc3, image2, image3, json2, json3], { account: publicClient.account });

      const newtokens = await movieContract.read.ownedTokens({ account: publicClient.account });
      expect(newtokens.length).to.eq(2);


      const parent1 = await movieContract.read.parent([newtokens[0]], { account: publicClient.account });
      expect(parent1.length).to.eq(1);

      const parent2 = await movieContract.read.parent([newtokens[1]], { account: publicClient.account });
      expect(parent2.length).to.eq(1);


      const isArchiveToken = await movieContract.read.isArchiveToken([tokens[0]], { account: publicClient.account });
      expect(isArchiveToken).to.eq(true);

      const children = await movieContract.read.children([tokens[0]], { account: publicClient.account });
      expect(children.length).to.eq(2);
    });
  });
});
