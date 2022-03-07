import { task } from "hardhat/config";


task("unstake", "Unstake LP Tokens")
    .addParam("contract", "Contract address")
    .addParam("user", "The user's address")
    .setAction(async  (taskArgs, { ethers }) => {

    const contract = await ethers.getContractAt("Staking", taskArgs.contract);
    const lp = await contract.unstake();
    // await lp.wait()
    // console.log("LP unstaked: ", ethers.utils.formatEther(lp.value));

    // const balance = await contract.balanceOf(taskArgs.user);
    // console.log("LP Balance: ", ethers.utils.formatEther(balance));

});

