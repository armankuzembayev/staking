const { expect } = require("chai");
const { ethers } = require("hardhat");

import * as Configs from "../config"

describe("Staking", function ()  {

    let Token: any;
    let ArmToken: any;
    let armToken: any;
    let LpToken: any;
    let lpToken: any;
    let hardhatToken: any;
    let factoryContract: any;
    let routerContract: any;
    let owner: any;
    let zeroAddress = ethers.utils.getAddress(Configs.zeroAddress)

    let FastRewardToken: any;
    let fastRewardToken: any;

    beforeEach(async function() {
        [owner] = await ethers.getSigners();

        ArmToken = await ethers.getContractFactory("Erc20");
        const name = Configs.name;
        const symbol = Configs.symbol;
        const decimals = Configs.decimals;
        const totalSupply = Configs.totalSupply;

        armToken = await ArmToken.deploy(name, symbol, decimals, ethers.utils.parseEther(totalSupply));
        await armToken.deployed();

        LpToken = await ethers.getContractFactory("Erc20");

        lpToken = await ArmToken.deploy(name, symbol, decimals, ethers.utils.parseEther(totalSupply));
        await lpToken.deployed();

        factoryContract = await ethers.getContractAt("IUniswapV2Factory", Configs.factoryAddress);

        let pair = await factoryContract.getPair(armToken.address, Configs.wethAddress);
        if (pair == Configs.zeroAddress) {
            await factoryContract.createPair(armToken.address, Configs.wethAddress);
        }

        routerContract = await ethers.getContractAt("IUniswapV2Router", Configs.routerAddress);
        const approve = await armToken.approve(Configs.routerAddress, ethers.utils.parseEther("10000"));
        await approve.wait();

        // const overrides = {value: ethers.utils.parseEther("100")};
        // const t = Date.now() / 1000 + 300;
        // const [amountToken, amountETH, liquidity] = await routerContract.addLiquidityETH(armToken.address, ethers.utils.parseEther("100"), ethers.utils.parseEther("100"), ethers.utils.parseEther("100"), owner.address, t, overrides);
        

        Token = await ethers.getContractFactory("Staking");
        const armAddress = armToken.address;
        const lpAdress = lpToken.address;
        const percent = Configs.percent;
        const holdTime = Configs.holdTime;
        const freezeTime = Configs.freezeTime;

        hardhatToken = await Token.deploy(armAddress, lpAdress, percent, holdTime, freezeTime);
        await hardhatToken.deployed();


        FastRewardToken = await ethers.getContractFactory("Staking");

        fastRewardToken = await FastRewardToken.deploy(armAddress, lpAdress, percent, 10, 10);
        await fastRewardToken.deployed();
    });


    describe("Deployment", function() {

        it("Should initialize correctly", async function() {
            expect(await hardhatToken.percent()).to.equal(Configs.percent);
            expect(await hardhatToken.holdTime()).to.equal(Configs.holdTime);
            expect(await hardhatToken.freezeTime()).to.equal(Configs.freezeTime);
            expect(await hardhatToken.rewardToken()).to.equal(armToken.address);
            expect(await hardhatToken.lpToken()).to.equal(lpToken.address);
            
            expect(await factoryContract.getPair(armToken.address, Configs.wethAddress)).to.not.equal(Configs.zeroAddress);  
        });
    });

    describe("Setters", function() {

        it("Should set correctly", async function() {
            await hardhatToken.setPercent(30);
            expect(await hardhatToken.percent()).to.equal(30);

            await hardhatToken.setHoldTime(1000);
            expect(await hardhatToken.holdTime()).to.equal(1000);

            await hardhatToken.setFreezeTime(1000);
            expect(await hardhatToken.freezeTime()).to.equal(1000);

            await hardhatToken.setRewardToken(lpToken.address);
            expect(await hardhatToken.rewardToken()).to.equal(lpToken.address);

            await hardhatToken.setLpToken(armToken.address);
            expect(await hardhatToken.lpToken()).to.equal(armToken.address);
        });
    });

    describe("Stake", function() {
        
        it("Should revert", async function() {
            await expect(hardhatToken.stake(ethers.utils.parseEther("1"))).to.be.revertedWith("Not enough allowance");

            await armToken.mint(owner.address, ethers.utils.parseEther("1000"));
            await lpToken.mint(owner.address, ethers.utils.parseEther("1000"));
            await lpToken.approve(hardhatToken.address, ethers.utils.parseEther("10000"));

            await expect(hardhatToken.stake(ethers.utils.parseEther("2000"))).to.be.revertedWith("Not enough balance");
        });

        it("Should stake token", async function() {
            await armToken.mint(owner.address, ethers.utils.parseEther("1000"));
            await lpToken.mint(owner.address, ethers.utils.parseEther("1000"));
            await lpToken.approve(hardhatToken.address, ethers.utils.parseEther("1000"));

            expect(await lpToken.balanceOf(hardhatToken.address)).to.be.equal(ethers.utils.parseEther("0"));

            await hardhatToken.stake(ethers.utils.parseEther("100"));

            expect(await lpToken.balanceOf(hardhatToken.address)).to.be.equal(ethers.utils.parseEther("100"));
        });
        
    });

    describe("Unstake", function() {

        it("Should revert", async function() {
            await expect(hardhatToken.unstake()).to.be.revertedWith("No balance");
        });

        it("Should unstake token", async function() {
            await armToken.mint(owner.address, ethers.utils.parseEther("1000"));
            await lpToken.mint(owner.address, ethers.utils.parseEther("1000"));
            await lpToken.approve(fastRewardToken.address, ethers.utils.parseEther("1000"));
            expect (await lpToken.allowance(owner.address, fastRewardToken.address)).to.equal(ethers.utils.parseEther("1000"));
            
            await fastRewardToken.stake(ethers.utils.parseEther("100"));
            expect(await lpToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("900"));
            expect(await lpToken.balanceOf(fastRewardToken.address)).to.be.equal(ethers.utils.parseEther("100"));
            await new Promise(f => setTimeout(f, 10000));
            
            await fastRewardToken.unstake();
            expect(await lpToken.balanceOf(fastRewardToken.address)).to.be.equal(ethers.utils.parseEther("0"));
            expect(await lpToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("1000"));
        });
        
    });

    describe("Claim", function() {
        
        it("Should not return reward", async function() {
            await armToken.mint(owner.address, ethers.utils.parseEther("1000"));
            await armToken.mint(fastRewardToken.address, ethers.utils.parseEther("1000"));
            await lpToken.mint(owner.address, ethers.utils.parseEther("1000"));

            await armToken.approve(fastRewardToken.address, ethers.utils.parseEther("1000"));
            await lpToken.approve(fastRewardToken.address, ethers.utils.parseEther("1000"));
            expect (await armToken.allowance(owner.address, fastRewardToken.address)).to.equal(ethers.utils.parseEther("1000"));
            
            await fastRewardToken.stake(ethers.utils.parseEther("100"));
            expect(await lpToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("900"));
            expect(await lpToken.balanceOf(fastRewardToken.address)).to.be.equal(ethers.utils.parseEther("100"));

            await fastRewardToken.claim();
            expect(await lpToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("900"));
            expect(await armToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("1000"));
            
            await fastRewardToken.unstake();
            expect(await lpToken.balanceOf(fastRewardToken.address)).to.be.equal(ethers.utils.parseEther("100"));
            expect(await lpToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("900"));
        });

        it("Should return reward", async function() {
            await armToken.mint(owner.address, ethers.utils.parseEther("1000"));
            await armToken.mint(fastRewardToken.address, ethers.utils.parseEther("1000"));
            await lpToken.mint(owner.address, ethers.utils.parseEther("1000"));

            await armToken.approve(fastRewardToken.address, ethers.utils.parseEther("1000"));
            await lpToken.approve(fastRewardToken.address, ethers.utils.parseEther("1000"));
            expect (await armToken.allowance(owner.address, fastRewardToken.address)).to.equal(ethers.utils.parseEther("1000"));
            
            await fastRewardToken.stake(ethers.utils.parseEther("100"));
            expect(await lpToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("900"));
            expect(await lpToken.balanceOf(fastRewardToken.address)).to.be.equal(ethers.utils.parseEther("100"));
            await new Promise(f => setTimeout(f, 10000));


            await fastRewardToken.claim();
            expect(await lpToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("900"));
            expect(await armToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("1020"));
            
            
            await fastRewardToken.unstake();
            expect(await lpToken.balanceOf(fastRewardToken.address)).to.be.equal(ethers.utils.parseEther("0"));
            expect(await lpToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("1000"));
        });
    });

});