// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Marketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    event MarketItemCreated(
        uint256 marketItemId,
        uint256 tokenId,
        uint256 price,
        address seller
    );
    event MarketItemBought(
        uint256 marketItemId,
        uint256 tokenId,
        address buyer
    );
    event MarketItemCanceled(
        uint256 marketItemId,
        uint256 tokenId,
        address seller
    );
    struct MarketItem {
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable buyer;
        uint256 price;
        bool isSold;
        bool isCanceled;
    }
    mapping(uint256 => MarketItem) private idToMarketItem;

    constructor() {}

    function createMarketItem(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price
    ) public nonReentrant {
        require(_price > 0, "price must greater than 0");
        uint256 itemId = _itemIds.current();
        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);
        idToMarketItem[itemId] = MarketItem(
            _nftContract,
            _tokenId,
            payable(msg.sender),
            payable(address(0)),
            _price,
            false,
            false
        );
        _itemIds.increment();
        emit MarketItemCreated(itemId, _tokenId, _price, msg.sender);
    }

    function buyMarketItem(uint256 _itemId) public payable nonReentrant {
        //uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            msg.sender != idToMarketItem[_itemId].seller,
            "asker must not be owner"
        );

        require(idToMarketItem[_itemId].isSold == false, "item has been sold");
        require(!idToMarketItem[_itemId].isCanceled, "Item has been cancelled");
        require(
            idToMarketItem[_itemId].price == msg.value,
            "Price must equal to token price"
        );
        idToMarketItem[_itemId].buyer = payable(msg.sender);
        idToMarketItem[_itemId].isSold = true;
        IERC721(idToMarketItem[_itemId].nftContract).transferFrom(
            address(this),
            msg.sender,
            idToMarketItem[_itemId].tokenId
        );
        emit MarketItemBought(
            _itemId,
            idToMarketItem[_itemId].tokenId,
            msg.sender
        );
    }

    function cancelMartketItem(uint256 _itemId) public {
        require(
            idToMarketItem[_itemId].seller == msg.sender,
            "sender must be the seller"
        );
        require(!idToMarketItem[_itemId].isCanceled, "item has been cancelled");
        require(
            idToMarketItem[_itemId].buyer == address(0),
            "item has been sold"
        );
        idToMarketItem[_itemId].isCanceled = true;
        IERC721(idToMarketItem[_itemId].nftContract).transferFrom(
            address(this),
            msg.sender,
            idToMarketItem[_itemId].tokenId
        );
        emit MarketItemCanceled(
            _itemId,
            idToMarketItem[_itemId].tokenId,
            msg.sender
        );
    }
}