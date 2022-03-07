//SPDX-License-Identifier: Unlicense
pragma solidity  ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IErc20 {
    event Transfer(address indexed _from, address indexed _to, uint256 _amount);
    event Approval(address indexed _owner, address indexed _spender, uint256 _amount);

    function transfer(address _recipient, uint256 _amount) external returns (bool);

    function transferFrom(address _sender, address _recipient, uint256 _amount) external returns (bool);

    function approve(address _spender, uint256 _amount) external returns (bool);

    function increaseAllowance(address _spender, uint256 _amount) external returns (bool);

    function decreaseAllowance(address _spender, uint256 _amount) external returns (bool);

    function allowance(address _owner, address _spender) external view returns (uint256);
    
    function balanceOf(address _user) external view returns (uint256);
}

contract Staking is AccessControl {
    bytes32 public constant ADMIN = keccak256("ADMIN");

    address public rewardToken;
    address public lpToken;
    uint256 public percent;
    uint256 public holdTime;    // in seconds
    uint256 public freezeTime;  // in seconds

    struct Stake {
        uint256 amount;
        uint256 startReward;
        uint256 startLp;
    }

    mapping(address => Stake[]) private data;

    constructor (address _rewardToken, address _lpToken,  uint256 _percent, uint256 _holdTime, uint256 _freezeTime) {
        _setupRole(ADMIN, msg.sender);

        rewardToken = _rewardToken;
        lpToken = _lpToken;
        percent = _percent;
        holdTime = _holdTime;
        freezeTime = _freezeTime;
    }

    function setPercent(uint256 _percent) public onlyRole(ADMIN) {
        percent = _percent;
    }

    function setHoldTime(uint256 _holdTime) public onlyRole(ADMIN) {
        holdTime = _holdTime;
    }

    function setFreezeTime(uint256 _freezeTime) public onlyRole(ADMIN) {
        freezeTime = _freezeTime;
    }

    function setRewardToken(address _rewardToken) public onlyRole(ADMIN) {
        rewardToken = _rewardToken;
    }

    function setLpToken(address _lpToken) public onlyRole(ADMIN) {
        lpToken = _lpToken;
    }

    function stake(uint256 _amount) external {
        require(IErc20(lpToken).allowance(msg.sender, address(this)) >= _amount, "Not enough allowance");
        require(IErc20(lpToken).balanceOf(msg.sender) >= _amount, "Not enough balance");

        IErc20(lpToken).transferFrom(msg.sender, address(this), _amount);

        data[msg.sender].push(Stake(_amount, block.timestamp, block.timestamp));
    }

    function _getAvailableLP(address _account) private returns (uint256 lp) {
        Stake[] memory stakes = data[_account];
        for (uint256 idx = 0; idx < stakes.length; idx++) {
            uint256 delta = uint256(block.timestamp - stakes[idx].startLp);
            if (delta >= freezeTime) {
                lp += stakes[idx].amount;

                delete data[_account][idx];
            }
        }
    }

    function unstake() external returns (uint256) {
        require(IErc20(lpToken).balanceOf(msg.sender) != 0, "No balance");

        uint256 lp = _getAvailableLP(msg.sender);
        
        IErc20(lpToken).transfer(msg.sender, lp);

        return lp;
    }

    function _getRewards(address _account) private returns (uint256) {
        Stake[] memory stakes = data[_account];
        
        uint256 claimed = 0;
        for (uint256 idx = 0; idx < stakes.length; idx++) {
            uint256 delta = uint256(block.timestamp - stakes[idx].startReward);
            
            if (delta >= holdTime) {
                uint256 ratio = delta / holdTime;
                
                claimed += ratio * stakes[idx].amount * percent / 100;
                data[_account][idx].startReward = block.timestamp;
            }
        }
        return claimed;
    }

    function claim() external returns (uint256) {
        uint256 claimed = _getRewards(msg.sender);

        IErc20(rewardToken).transfer(msg.sender, claimed);
        
        return claimed;
    }

    function balanceOf(address _user) public view returns (uint256) {
        return IErc20(lpToken).balanceOf(_user);
    }
}
