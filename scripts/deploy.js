// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(hre.ethers.utils.parseUnits("0.00001", "ether"));
  await nft.deployed();
  const MarketPlace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await MarketPlace.deploy();
  await marketplace.deployed();
  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(nft.address, hre.ethers.utils.parseUnits("0.00001", "ether"));
  await staking.deployed();
  
  console.log("NFT deployed to:", nft.address);
  console.log("MarketPlace deployed to:", marketplace.address);
  console.log("Staking deployed to:", staking.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
