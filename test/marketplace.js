const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Nft", function () {
    let [owner, acc1, acc2] = []
    let nftAddress
    let nft
    let marketAddress
    let market
    let priceAmount = ethers.utils.parseUnits("2", "ether")
    let priceAmountSecond = ethers.utils.parseUnits("4", "ether")
    beforeEach(async () => {
        [owner, acc1, acc2] = await ethers.getSigners()
        const Nft = await ethers.getContractFactory('NFT')
        nft = await Nft.deploy(ethers.utils.parseUnits("1", "ether"))
        await nft.deployed()
        nftAddress = nft.address

        const Marketplace = await ethers.getContractFactory('Marketplace')
        market = await Marketplace.deploy()
        await market.deployed()

        marketAddress = market.address
        let distributeTokenTx = await nft.distributeToken("", priceAmount)
        let buyTx = await nft.buyToken(0, {
            value: priceAmount,
        });

    })
    describe('#createMarketItem positive', () => {
        it("create market correctly", async function () {
            nft.approve(marketAddress, 0)
            let createMarketItemTx = await market.createMarketItem(nftAddress, 0, priceAmount)
            let ownerOfToken = await nft.ownerOf(0);
            await expect(ownerOfToken).to.be.equal(marketAddress)
            await expect(createMarketItemTx).to.emit(market, 'MarketItemCreated').withArgs(0, 0, priceAmount, owner.address)
        });
    })
    describe('#buyMarketItem positive', () => {
        it("buy market item correctly", async function () {
            nft.approve(marketAddress, 0)
            let createMarketItemTx = await market.createMarketItem(nftAddress, 0, priceAmount)
            let buyTx = await market.connect(acc1).buyMarketItem(0, {
                value: priceAmount,
              });
            await expect(buyTx).to.emit(market, 'MarketItemBought').withArgs(0, 0, acc1.address)
        });
    })
    describe('#cancelMartketItem positive', () => {
        it("cancel market item correctly", async function () {
            nft.approve(marketAddress, 0)
            let createMarketItemTx = await market.createMarketItem(nftAddress, 0, priceAmount)
            let ownerOfToken = await nft.ownerOf(0);
            let cancelTx = await market.cancelMartketItem(0);
            await expect(cancelTx).to.emit(market, 'MarketItemCanceled').withArgs(0, 0, owner.address)

        });
    })
});
