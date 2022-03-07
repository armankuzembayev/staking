import { task } from "hardhat/config";
import * as Configs from "../config"


task("getPair", "Get pair")
    .addParam("token1", "First token")
    .addParam("token2", "Second token")
    .setAction(async  (taskArgs, { ethers }) => {

    const factory = await ethers.getContractAt("IUniswapV2Factory", Configs.factoryAddress);
    let pair = await factory.getPair(taskArgs.token1, taskArgs.token2);
    if (pair == Configs.zeroAddress) {
        pair = await factory.createPair(taskArgs.token1, taskArgs.token2);
    }

    console.log(pair);
    
});