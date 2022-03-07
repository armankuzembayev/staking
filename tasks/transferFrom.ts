import { task } from "hardhat/config";


task("transferFrom", "Transfer some amount of token")
    .addParam("token", "Token address")
    .addParam("sender", "The sender's address")
    .addParam("recipient", "The recipient's address")
    .addParam("amount", "How much to send")
    .setAction(async  (taskArgs, { ethers }) => {
    
    const contract = await ethers.getContractAt("Erc20", taskArgs.token)
    
    const transferFrom = await contract.transferFrom(taskArgs.sender, taskArgs.recipient, ethers.utils.parseEther(taskArgs.amount))
    await transferFrom.wait()

    const balanceSender = await contract.balanceOf(taskArgs.sender)
    console.log("Current balance of sender after transfer: ", ethers.utils.formatEther(balanceSender))

    const balanceRecipient = await contract.balanceOf(taskArgs.recipient)
    console.log("Current balance of recipient after transfer: ", ethers.utils.formatEther(balanceRecipient))
});