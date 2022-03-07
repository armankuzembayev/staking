import { task } from "hardhat/config";
import * as Configs from "../config"


task("addLiquidity", "Get pair")
    .addParam("token", "Token address")
    .addParam("amounttokendesired", "The amount of token to add as liquidity")
    .addParam("amountethdesired", "The amount of ETH to add as liquidity")
    .addParam("amounttokenmin", "The minimum amount of token to add as liquidity")
    .addParam("amountethmin", "The minimum amount of ETH to add as liquidity")
    .addParam("to", "Address where to send LP tokens")
    .setAction(async  (taskArgs, { ethers }) => {

    const [signer] = await ethers.getSigners();
    const arm = await ethers.getContractAt("Erc20", taskArgs.token);
    await arm.approve(Configs.routerAddress, ethers.utils.parseEther(taskArgs.amounttokendesired));
    
    
    const router = await ethers.getContractAt("IUniswapV2Router", Configs.routerAddress);
    const overrides = {value: ethers.utils.parseEther(taskArgs.amountethdesired)};
    const t = Date.now() + 300;

    await router.addLiquidityETH(taskArgs.token, ethers.utils.parseEther(taskArgs.amountethdesired), ethers.utils.parseEther(taskArgs.amounttokenmin), ethers.utils.parseEther(taskArgs.amountethmin), taskArgs.to, t, overrides);
    
});