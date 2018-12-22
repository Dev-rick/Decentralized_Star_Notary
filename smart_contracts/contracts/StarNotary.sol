pragma solidity ^0.4.23;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";


contract StarNotary is ERC721 {

    struct Star {
        string name;
        string story;
        Coordinates coordinates;
    }

    struct Coordinates {
        string ra;
        string dec;
        string mag;
    }

    uint256 public countTokens;

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;
    mapping(bytes32 => bool) public starHashMap;

    function createStar(string name, string story, string ra, string dec, string mag) public {
        countTokens++;
        uint256 tokenId = countTokens;


        // check token if not 0 and if not already exists with this Id
        // Verify uniquenessFactor `keccak256(_ra, _dec, _mag)`
        require(tokenId != 0);
        require(keccak256(abi.encodePacked(tokenIdToStarInfo[tokenId].coordinates.dec)) == keccak256(""));
        require(keccak256(abi.encodePacked(dec)) != keccak256(""));
        require(keccak256(abi.encodePacked(ra)) != keccak256(""));
        require(keccak256(abi.encodePacked(mag)) != keccak256(""));
        require(!checkIfStarExist(ra, dec, mag));

        // Create a `Star memory newStar` variable
        Coordinates memory newCoordinates = Coordinates(ra, dec, mag);
        Star memory newStar = Star(name, story, newCoordinates);

        tokenIdToStarInfo[tokenId] = newStar;

        bytes32 hash = generateStarHash(ra, dec, mag);
        starHashMap[hash] = true;

        _mint(msg.sender, tokenId);
    }

    function putStarUpForSale(uint256 tokenId, uint256 price) public {
        require(this.ownerOf(tokenId) == msg.sender);

        starsForSale[tokenId] = price;
    }

    function buyStar(uint256 tokenId) public payable {
        require(starsForSale[tokenId] > 0);

        uint256 starCost = starsForSale[tokenId];
        address starOwner = this.ownerOf(tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, tokenId);
        _addTokenTo(msg.sender, tokenId);

        starOwner.transfer(starCost);

        if (msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function checkIfStarExist(string ra, string dec, string mag) public view returns(bool) {
        return starHashMap[generateStarHash(ra, dec, mag)];
    }

    function tokenIdToStarInfos(uint256 tokenId) public constant returns(string, string, string, string, string) {
        return (tokenIdToStarInfo[tokenId].name, tokenIdToStarInfo[tokenId].story, tokenIdToStarInfo[tokenId].coordinates.ra, tokenIdToStarInfo[tokenId].coordinates.dec, tokenIdToStarInfo[tokenId].coordinates.mag);
    }

    function mint(uint256 tokenId) public {
        super._mint(msg.sender, tokenId);
    }

    function generateStarHash(string ra, string dec, string mag) private pure returns(bytes32) {
        return keccak256(abi.encodePacked(ra, dec, mag));
    }
}
