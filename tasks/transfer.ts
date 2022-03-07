import { task } from "hardhat/config";


task("transfer", "Transfer some amount of token")
    .addParam("token", "Token address")
    .addParam("recipient", "The recipient's address")
    .addParam("amount", "How much to send")
    .setAction(async  (taskArgs, { ethers }) => {

const contract = await ethers.getContractAt("Erc20", taskArgs.token)

const transfer = await contract.transfer(taskArgs.recipient, ethers.utils.parseEther(taskArgs.amount))
await transfer.wait()

const balance = await contract.balanceOf(taskArgs.recipient)
console.log("Current balance of recipient: ", ethers.utils.formatEther(balance))
});