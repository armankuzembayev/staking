import { task } from "hardhat/config";


task("claim", "Claim Reward Tokens")
    .addParam("contract", "Contract address")
    .addParam("rewardcontract", "Reward contract address")
    .addParam("user", "The user's address")
    .setAction(async  (taskArgs, { ethers }) => {

    const contract = await ethers.getContractAt("Staking", taskArgs.contract);
    const claimed = await contract.claim();
    // await claimed.wait();
    // console.log("Claimed: ", ethers.utils.formatEther(claimed.value));

    // const reward = await ethers.getContractAt(abiStaking, taskArgs.rewardcontract);
    // const balance = await reward.balanceOf(taskArgs.user);
    // console.log("Reward Balance: ", ethers.utils.formatEther(balance));

});
