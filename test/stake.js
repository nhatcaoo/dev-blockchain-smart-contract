const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Nft", function () {
    let [owner, acc1, acc2] = []
    let nftAddress
    let nft
    let marketAddress
    let market
    let stake
    let stakeAddress
    let priceAmount = ethers.utils.parseUnits("2", "ether")
    let profitPerBlock = ethers.utils.parseUnits("0.1", "ether")
    beforeEach(async () => {
        [owner, acc1, acc2] = await ethers.getSigners()
        const Nft = await ethers.getContractFactory('NFT')
        nft = await Nft.deploy(ethers.utils.parseUnits("1", "ether"))
        await nft.deployed()
        nftAddress = nft.address

        const Staking = await ethers.getContractFactory('Staking')
        stake = await Staking.deploy(nftAddress, profitPerBlock)
        await stake.deployed()
        stakeAddress = stake.address

        let distributeTokenTx = await nft.distributeToken("", priceAmount)
        let buyTx = await nft.connect(acc1).buyToken(0, {
            value: priceAmount,
        });
        let ownerOfToken = await nft.ownerOf(0);
        await expect(ownerOfToken).to.be.equal(acc1.address)
        await owner.sendTransaction({
            to: stakeAddress,
            value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
          });

    })
    describe('#stake positive', () => {
        it("stake correctly", async function () {
            nft.connect(acc1).setApprovalForAll(stake.address, true)
            let stakeTx = await stake.connect(acc1).stake(0)
            let ownerOfToken = await nft.ownerOf(0);
            let blockNumBefore = await ethers.provider.getBlockNumber()
            await expect(ownerOfToken).to.be.equal(stakeAddress)
            await expect(stakeTx).to.emit(stake, 'StakePlaced').withArgs(acc1.address, 0, blockNumBefore)
        });
    })
    describe('#unstake positive', () => {
        it("unstake correctly", async function () {
            nft.connect(acc1).setApprovalForAll(stake.address, true)
            let stakeTx = await stake.connect(acc1).stake(0)
            let blockNumBefore = await ethers.provider.getBlockNumber()
            
            let unstakeTx = await stake.connect(acc1).unStake(0)
            let blockNumAfter = await ethers.provider.getBlockNumber()
            let ownerOfToken = await nft.ownerOf(0);
            await expect(ownerOfToken).to.be.equal(acc1.address)
            let profit = ethers.utils.parseUnits(((blockNumAfter-blockNumBefore)*0.1).toString(), "ether")
            await expect(unstakeTx).to.emit(stake, 'StakeRelease').withArgs(acc1.address, 0, profit )
        });
    })
});
