// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Staking is ReentrancyGuard {
    using Counters for Counters.Counter;

    using SafeMath for uint256;
    address public nftContract;
    uint256 public profitPerBlock;
    event StakePlaced(address stakeHolder, uint256 tokenId, uint256 startBlock);
    event StakeRelease(
        address stakeHolder,
        uint256 tokenId,
        uint256 totalProfit
    );
    struct StakeInfo {
        uint256 itemId;
        uint256 tokenId;
        uint256 startBlock;
        bool isValid;
    }
    mapping(address => mapping(uint256 => StakeInfo)) private stakesToStakeInfo;
    mapping(address => Counters.Counter) private stakeHolderToStakeNum;

    constructor(address _nftContract, uint256 _profitPerBlock) {
        nftContract = _nftContract;
        profitPerBlock = _profitPerBlock;
    }

    function stake(uint256 _tokenId) public nonReentrant {
        uint256 itemId = stakeHolderToStakeNum[msg.sender].current();
        IERC721(nftContract).transferFrom(msg.sender, address(this), _tokenId);
        stakesToStakeInfo[msg.sender][itemId] = StakeInfo(
            itemId,
            _tokenId,
            block.number,
            true
        );
        stakeHolderToStakeNum[msg.sender].increment();
        emit StakePlaced(msg.sender, _tokenId, block.number);
    }

    function unStake(uint256 _itemId) public nonReentrant {
        require(
            stakesToStakeInfo[msg.sender][_itemId].isValid == true,
            "Invalid stake"
        );
        IERC721(nftContract).transferFrom(
            address(this),
            msg.sender,
            stakesToStakeInfo[msg.sender][_itemId].tokenId
        );
        uint256 profit = profitPerBlock.mul(
            (
                block.number.sub(
                    stakesToStakeInfo[msg.sender][_itemId].startBlock
                )
            )
        );
        payable(msg.sender).transfer(profit);
        stakesToStakeInfo[msg.sender][_itemId].isValid = false;
        emit StakeRelease(
            msg.sender,
            stakesToStakeInfo[msg.sender][_itemId].tokenId,
            profit
        );
    }

    receive() external payable {}

    function getMyStakeInfo() public view returns (StakeInfo[] memory) {
        uint256 itemId = stakeHolderToStakeNum[msg.sender].current();
        StakeInfo[] memory stakes = new StakeInfo[](itemId);
        for (uint256 i = 0; i < itemId; i++) {
            stakes[i] = stakesToStakeInfo[msg.sender][i];
        }
        return stakes;
    }
}
