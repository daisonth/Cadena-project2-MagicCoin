
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract MagicCoin is ERC20, Ownable, ERC20Burnable {
    event tokensBurned(address indexed owner, uint256 amount, string message);
    event tokensMinted(address indexed owner, uint256 amount, string message);
    event additionalTokensMinted(address indexed owner,uint256 amount,string message);
    event tokenRequested(address indexed owner,uint256 amount,string message);

    constructor() ERC20("MagicCoin", "MGC") 
    {
        _mint(msg.sender, 500* 10**decimals());
        emit tokensMinted(msg.sender, 500 * 10**decimals(), "Initial supply of tokens minted.");
    }

    function mint(address _to, uint256 _amount) public onlyOwner 
    {
        _mint(_to, _amount* 10**decimals());
        emit additionalTokensMinted(msg.sender, _amount, "Additional tokens minted.");
    }

    function burn(uint256 _amount) public override onlyOwner 
    {
        _burn(msg.sender, _amount* 10**decimals());
        emit tokensBurned(msg.sender, _amount, "Tokens burned.");
    }

    function getMagicCoin(address _to, uint256 _amount) public 
    {
        if (balanceOf(owner()) < _amount) 
        {
            _mint(owner(), 500 * 10**decimals());
        }
        require ( _amount * 10**decimals()  <= 20 * 10**decimals(), "You can only get upto 20 MagicCoins at a time");
        _transfer(owner(), _to, _amount * 10**decimals());

        emit tokenRequested ( msg.sender, _amount, "MGC send");
    }

    function myTokenBalance() public view returns (uint256) 
    {
        return balanceOf(msg.sender);
    }
}

