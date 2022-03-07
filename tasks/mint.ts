import { task } from "hardhat/config";


task("mint", "Mint some amount")
    .addParam("token", "Token address")
    .addParam("recipient", "The recipient's address")
    .addParam("amount", "How much to approve")
    .setAction(async  (taskArgs, { ethers }) => {

const contract = await ethers.getContractAt("Erc20", taskArgs.token)

const mint = await contract.mint(taskArgs.recipient, ethers.utils.parseEther(taskArgs.amount))
await mint.wait()

const balance = await contract.balanceOf(taskArgs.recipient)
console.log("Current balance of recipient: ", ethers.utils.formatEther(balance))
});