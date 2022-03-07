import { task } from "hardhat/config";


task("allowance", "Allowance")
    .addParam("token", "Token address")
    .addParam("owner", "The owner's address")
    .addParam("spender", "The spender's address")
    .setAction(async  (taskArgs, { ethers }) => {
    
    const contract = await ethers.getContractAt("Erc20", taskArgs.token)

    const allowance = await contract.allowance(taskArgs.owner, taskArgs.spender)

    console.log("Current allwoance for this user: ", ethers.utils.formatEther(allowance))
});