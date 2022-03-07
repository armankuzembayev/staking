import { task } from "hardhat/config";


task("approve", "Approve amount")
    .addParam("token", "Token address")
    .addParam("spender", "The spender's address")
    .addParam("amount", "How much to approve")
    .setAction(async  (taskArgs, { ethers }) => {

const [signer] = await ethers.getSigners()
const contract = await ethers.getContractAt("Erc20", taskArgs.token)

const approve = await contract.approve(taskArgs.spender, ethers.utils.parseEther(taskArgs.amount))
await approve.wait()

const allowance = await contract.allowance(signer.address, taskArgs.spender)
console.log("Current allwoance for this user: ", ethers.utils.formatEther(allowance))
});