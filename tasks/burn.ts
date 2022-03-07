import { task } from "hardhat/config";


task("burn", "Burn some amount from user")
    .addParam("account", "The recipient's address")
    .addParam("amount", "How much to approve")
    .setAction(async  (taskArgs, { ethers }) => {

const contract = await ethers.getContractAt("Erc20", taskArgs.token)

const mint = await contract.burn(taskArgs.account, ethers.utils.parseEther(taskArgs.amount))
await mint.wait()

const balance = await contract.balanceOf(taskArgs.account)
console.log("Current balance of recipient: ", ethers.utils.formatEther(balance))
});