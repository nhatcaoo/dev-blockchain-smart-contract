// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 public listingPrice;
    event TokenDistributed(uint256 id, uint256 price, uint256 blockNumber);
    event TokenSold(uint256 id, uint256 blockNumber);
    struct TokenSellInfo {
        uint256 price;
        bool isSold;
        uint256 blockNumber;
    }
    mapping(uint256 => TokenSellInfo) public idToInfo;

    constructor(uint256 _listingPrice) ERC721("My NFT", "MNT") {
        listingPrice = _listingPrice;
    }

    function distributeToken(string calldata _tokenURI, uint256 _price)
        public
        onlyOwner
    {
        uint256 tokenId = _tokenIds.current();
        _mint(address(this), tokenId);
        _setTokenURI(tokenId, _tokenURI);
        idToInfo[tokenId] = TokenSellInfo(_price, false, block.number);
        _tokenIds.increment();
        emit TokenDistributed(tokenId, _price, block.number);
    }

    function buyToken(uint256 _id) public payable {
        require(
            msg.value == idToInfo[_id].price,
            "price must equal to token price"
        );
        require(idToInfo[_id].isSold == false, "token was sold");
        _transfer(address(this), msg.sender, _id);
        idToInfo[_id].isSold = true;
        emit TokenSold(_id, block.number);
    }
}
