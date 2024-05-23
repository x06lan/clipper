// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Movie is ERC721, ERC721URIStorage, Ownable {


    struct Clip {
        uint256 id;
        string name;
        string image_cid;
        string video_cid;
    }

    struct Token {
        uint256 id;
        string name;
        string image_cid;
        uint256[] clips;
        uint256 price;
        bool selling;


        uint256[] children;
        uint256[] parant;        
    }

   
    // uint256 private _seed;

    mapping(uint256 => Clip) private _clips;
    mapping(uint256 => Token) private _tokens;

    //clip id to token id
    mapping(uint256 => uint256) private _clipToToken;

    //selling token
    uint256[] private _sellingToken;

    mapping(address => uint256[]) private  _ownedTokens;


    constructor(
        address initialOwner
        // uint256 seed
    ) ERC721("movie", unicode"🎥") Ownable(initialOwner) {
        // uint256 newSeed= uint256(keccak256(abi.encodePacked(seed)));
        // _seed=newSeed;
    }

    modifier tokenOwnerCheck(uint256 tokenId,address addr){
        require(_ownerOf(tokenId)==addr,"token id error or not owner");
        _;
    }

    function _archiveToken(uint256 tokenId)internal {
        _transfer(msg.sender, address(this), tokenId);
    }
    function _availableTokenId(uint256 tokenId)internal  view returns (bool) {
        return (_ownerOf(tokenId)==address(0) && tokenId!=0);
    }

    function _ownedTokenTransfer(uint256 tokenId, address owner, address newOwner) internal {
        uint256[] storage ownerTokens = _ownedTokens[owner];
        for (uint256 i = 0; i < ownerTokens.length; i++) {
            if (ownerTokens[i] == tokenId) {
                ownerTokens[i] = ownerTokens[ownerTokens.length - 1];
                ownerTokens.pop();
                _ownedTokens[newOwner].push(tokenId);
                break;
            }
        }
    }
    function _removeSellToken(uint256 tokenId)internal  {
        for(uint i=0;i<_sellingToken.length;i++){
            if(_sellingToken[i]==tokenId){
                _sellingToken[i]=_sellingToken[_sellingToken.length-1];
                _sellingToken.pop();
                break;
            }
        }
    }

    function _pushSellToken(uint256 tokenId)internal  {
        _sellingToken.push(tokenId);
    }
    function _transferClips(uint256[] memory clipId,uint256 tokenId) internal {
        //transfer clips to target token
        for(uint i=0;i<clipId.length;i++){
            _clipToToken[clipId[i]]=tokenId;
        }
    }

    
    function buySellingToken(uint256 tokenId) public payable{
        require(_tokens[tokenId].selling==true,"token not selling");
        require(msg.value >= _tokens[tokenId].price,"payed price enougth match");
        address owner=ownerOf(tokenId);
        _transfer(owner,msg.sender,tokenId);
        _ownedTokenTransfer(tokenId,owner,msg.sender);

        _tokens[tokenId].selling=false;
        _removeSellToken(tokenId);

        payable(owner).transfer(msg.value);
        
    }
    function sellingToken ()public view returns(uint256[] memory){
        return _sellingToken;
    }
    function sell(uint256 tokenId,uint256 price) tokenOwnerCheck(tokenId, msg.sender) public{
        _tokens[tokenId].selling=true;
        _tokens[tokenId].price=price;
        _pushSellToken(tokenId);
    }
    function unsell(uint256 tokenId) tokenOwnerCheck(tokenId, msg.sender) public{
        _tokens[tokenId].selling=false;
        _tokens[tokenId].price=0;
        _removeSellToken(tokenId);
    }
    function clipInfo(uint256 clipId)public view tokenOwnerCheck(_clipToToken[clipId], msg.sender) returns (Clip memory){
        require(_clipToToken[clipId]!=0,"clip not exist");
        return _clips[clipId];
    }

    function tokenInfo(uint256 tokenId) public view returns (Token memory){
        require(ownerOf(tokenId)!=address(0),"token not exist");
        
        return _tokens[tokenId];
    }
    function isArchiveToken(uint256 tokenId)public view returns (bool){
        require(ownerOf(tokenId)!=address(0),"token not exist");
        return ownerOf(tokenId)==address(this);
    }
    function ownedTokens()public view returns(uint256[] memory){
        return _ownedTokens[msg.sender];
    }

        
    
    
    function mint(Clip[] memory clips, string memory name,string memory image,uint256 seed) public returns(uint256){
        uint256 tokenId= uint256(keccak256(abi.encodePacked(seed)));
        require(_availableTokenId(tokenId)==true,"token id is not available");
        
        uint256[] memory order=new uint[](clips.length);
        for(uint i=0;i<clips.length;i++){
            require(_clips[clips[i].id].id == 0 ,"clip exist");
            for(uint j=i+1;j<clips.length;j++){
                require(clips[i].id != clips[j].id ,"clip not unique");
            }
            order[i]=clips[i].id;
            _clips[clips[i].id]=clips[i];
            _clipToToken[clips[i].id]=tokenId;
        }
        _safeMint(msg.sender, tokenId);
        // [[1,"1","1","1"]]

        Token memory token =Token({
            id:tokenId,
            clips:order,
            name:name,
            image_cid:image,
            price: 0 wei,
            selling:false,
            parant:new uint256[](2),
            children:new uint256[](2)
        });
        _tokens[tokenId]=token;
        _ownedTokens[msg.sender].push(tokenId);
        return tokenId;
    }
    function fuse(uint256 tokenIdA,uint256 tokenIdB,string memory name ,string memory image ,uint256 seed,uint256[] memory clipOrder)tokenOwnerCheck(tokenIdA,msg.sender) tokenOwnerCheck(tokenIdB,msg.sender)  public returns(uint256){  
        
        
        for(uint i=0;i<clipOrder.length;i++){
            uint256 tokenId =_clipToToken[clipOrder[i]];
            require( tokenId==tokenIdA || tokenId==tokenIdB ,"clip illegal");

            for(uint j=i+1;j<clipOrder.length;j++){
                require(clipOrder[i]!=clipOrder[j] ,"clip not unique");
            }
        }
        // new token id
        uint256 newTokenId= uint256(keccak256(abi.encodePacked(tokenIdA^(tokenIdB+seed))));

        require(_availableTokenId(newTokenId)==true,"token id is not available");

        require(_tokens[tokenIdA].selling==false,"token A is on selling");
        require(_tokens[tokenIdB].selling==false,"token B is on selling");
        

        //transfer clips to new token 
        _transferClips(clipOrder,newTokenId);


        Token memory token =Token({
            id:newTokenId,
            clips:clipOrder,
            name:name,
            image_cid:image,
            price: 0 wei,
            selling:false,
            parant:new uint256[](2),
            children:new uint256[](2)
        });

        token.parant[0]=tokenIdA;
        token.parant[1]=tokenIdB;

        _tokens[tokenIdA].children[0]=newTokenId;
        _tokens[tokenIdB].children[0]=newTokenId;

        _safeMint(msg.sender, newTokenId);

        //burn token A and token B
        _ownedTokenTransfer(tokenIdA, msg.sender, address(this));
        _ownedTokenTransfer(tokenIdB, msg.sender, address(this));
        
        _archiveToken(tokenIdA);
        _archiveToken(tokenIdB);

        _tokens[newTokenId]=token;
        _ownedTokens[msg.sender].push(newTokenId);

        return newTokenId;
    }
    function  split(uint256 sourceId,uint256 seed,uint256[] memory leftClip,uint256[] memory rightClip ,string memory leftName,string memory rightName,string memory leftImage,string memory rightImage)  public returns (uint256 ,uint256){
        
        // tokenOwnerCheck(sourceId,msg.sender)
        require( _tokens[sourceId].clips.length == (leftClip.length+rightClip.length) ,"left right lenght illegal");
        
        for(uint i=0;i<leftClip.length;i++){
            uint256 tokenId =_clipToToken[leftClip[i]];
            require( tokenId==sourceId ,"left clip illegal");
        }
        for(uint i=0;i<rightClip.length;i++){
            uint256 tokenId =_clipToToken[rightClip[i]];
            require( tokenId==sourceId ,"right clip illegal");
        }
        require(_tokens[sourceId].selling==false,"token A is on selling");

        seed=uint256(keccak256(abi.encodePacked(seed)));
        uint256 newTokenIdLeft= seed;
        require(_availableTokenId(newTokenIdLeft) ==true,"token id is not available. change seed");

        uint256 newTokenIdRight= uint256(keccak256(abi.encodePacked(sourceId^seed)));
        require(_availableTokenId(newTokenIdRight)==true,"token id is not available. change seed");
        
        _safeMint(msg.sender, newTokenIdLeft);
        _safeMint(msg.sender, newTokenIdRight);

        _tokens[sourceId].children[0]=newTokenIdLeft;
        _tokens[sourceId].children[1]=newTokenIdRight;
        
        //burn source token 
        _archiveToken(sourceId);
        _ownedTokenTransfer(sourceId, msg.sender, address(this));
        
        // transfer clips to another token
        _transferClips(leftClip,newTokenIdLeft);
        _transferClips(rightClip,newTokenIdLeft);

        
        Token memory tokenLeft =Token({
            id:newTokenIdLeft,
            clips:leftClip,
            name:leftName,
            image_cid:leftImage,
            price: 0 wei,
            parant:new uint256[](1),
            selling:false,
            children:new uint256[](2)
        });

        tokenLeft.parant[0]=sourceId;
        
        Token memory tokenRight =Token({
            id:newTokenIdRight,
            clips:rightClip,
            name:rightName,
            image_cid:rightImage,
            price: 0 wei,
            parant:new uint256[](1),
            selling:false,
            children:new uint256[](2)
        });
        
        tokenRight.parant[0]=sourceId;

        _tokens[newTokenIdLeft]=tokenLeft;
        _tokens[newTokenIdRight]=tokenRight;

        _ownedTokens[msg.sender].push(newTokenIdLeft);
        _ownedTokens[msg.sender].push(newTokenIdRight);

        return (newTokenIdLeft,newTokenIdRight);
    }



    function parant(uint256 tokenId) public view returns(uint256[] memory){
        return _tokens[tokenId].parant;
    }

    function children(uint256 tokenId) public view returns(uint256[] memory){
        return _tokens[tokenId].children;
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        // require(_availableTokenId(tokenId)==true,"token id not exist");
        return _tokens[tokenId].image_cid;
        // return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
