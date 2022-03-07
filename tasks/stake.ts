import { task } from "hardhat/config";


task("stake", "Stake LP Tokens")
    .addParam("contract", "Contract address")
    .addParam("amount", "The amount of lp tokens")
    .addParam("user", "The user's address")
    .setAction(async  (taskArgs, { ethers }) => {

    const contract = await ethers.getContractAt("Staking", taskArgs.contract);
    await contract.stake(ethers.utils.parseEther(taskArgs.amount));

    // const balance = await contract.balanceOf(taskArgs.user);
    // console.log("LP Balance left: ", ethers.utils.formatEther(balance));

});
