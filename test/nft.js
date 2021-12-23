const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Nft", function () {
  let [owner, acc1, acc2] = []
  let nftAddress
  let nft
  let priceAmount = ethers.utils.parseUnits("2", "ether")
  let priceAmountSecond = ethers.utils.parseUnits("4", "ether")
  beforeEach(async () => {
    [owner, acc1, acc2] = await ethers.getSigners()
    const Nft = await ethers.getContractFactory('NFT')
    nft = await Nft.deploy(ethers.utils.parseUnits("1", "ether"))
    await nft.deployed()
    nftAddress = nft.address
  })
  describe('#distributeToken', () => {
    it("distributeToken should revert if not owner", async function () {
      await expect(nft.connect(acc1).distributeToken("", priceAmount)).to.be.revertedWith('Ownable: caller is not the owner')
    });
    it("distributeToken should work correctly, new Sell infor created and event emited", async function () {
      let distributeTokenTx = await nft.distributeToken("", priceAmount)
      let info = await nft.idToInfo(0)
      expect(info.price).to.be.equal(priceAmount)
      expect(info.isSold).to.be.equal(false)
      await expect(distributeTokenTx).to.emit(nft, 'TokenDistributed').withArgs(0, priceAmount)
    });
  })
  describe('#createToken', () => {
    it("createToken should revert if not owner", async function () {
      await expect(nft.connect(acc1).distributeToken("", priceAmount)).to.be.revertedWith('Ownable: caller is not the owner')
    });
    it("distributeToken should work correctly, new Sell infor created and event emited", async function () {
      let distributeTokenTx = await nft.distributeToken("", priceAmount)
      let info = await nft.idToInfo(0)
      expect(info.price).to.be.equal(priceAmount)
      expect(info.isSold).to.be.equal(false)
      await expect(distributeTokenTx).to.emit(nft, 'TokenDistributed').withArgs(0, priceAmount)
    });
  })
});
