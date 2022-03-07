import { ethers } from "hardhat";

import * as Configs from "../config"

async function main() {

    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(
      Configs.armAdresss,
      Configs.lpAddress,
      Configs.percent,
      Configs.holdTime,
      Configs.freezeTime
    );

    await staking.deployed();

    console.log("Staking deployed to:", staking.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
