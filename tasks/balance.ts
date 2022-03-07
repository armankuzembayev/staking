import { task } from "hardhat/config";


task("balance", "Get balance of")
    .addParam("token", "Token address")
    .addParam("user", "The user's address")
    .setAction(async  (taskArgs, { ethers }) => {
    
    const arm = await ethers.getContractAt("Erc20", taskArgs.token);
    
    const balance = await arm.balanceOf(taskArgs.user);
    console.log("User's balance is: ", ethers.utils.formatEther(balance));
});