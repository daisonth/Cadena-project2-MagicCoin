import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import abi from "./contracts/MagicCoin.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [inputValue, setInputValue] = useState({
    walletAddress: "",
    transferAmount: "",
    burnAmount: "",
    mintAmount: "",
  });
  const [tokenName, setTokenName] = useState("");
  const [myTotalBalance, setmyTotalBalance] = useState(null);
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0);
  const [isTokenOwner, setIsTokenOwner] = useState(false);
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState(null);
  const [yourWalletAddress, setYourWalletAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = "0x8Df32F0ffC92B8A94dBBb8225b47A290815adc72";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setIsWalletConnected(true);
        setYourWalletAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Install a MetaMask wallet to get our token.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTokenInfo = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        let tokenName = await tokenContract.name();
        let tokenSymbol = await tokenContract.symbol();
        let tokenOwner = await tokenContract.owner();
        let tokenSupply = await tokenContract.totalSupply();
        let balance = await tokenContract.myTokenBalance();
        tokenSupply = utils.formatEther(tokenSupply);

        setmyTotalBalance(utils.formatEther(balance));
        setTokenName(`${tokenName} 🦊`);
        setTokenSymbol(tokenSymbol);
        setTokenTotalSupply(tokenSupply);
        setTokenOwnerAddress(tokenOwner);

        if (account.toLowerCase() === tokenOwner.toLowerCase()) {
          setIsTokenOwner(true);
        }

        console.log("Token Name: ", tokenName);
        console.log("Token Symbol: ", tokenSymbol);
        console.log("Token Supply: ", tokenSupply);
        console.log("Token Owner: ", tokenOwner);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const transferToken = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await tokenContract.getMagicCoin(
          inputValue.walletAddress,
          inputValue.transferAmount
        );
        console.log("Transfering MGC...");
        await txn.wait();
        console.log("MGC Transfered", txn.hash);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const burnTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await tokenContract.burn(
          utils.parseEther(inputValue.burnAmount)
        );
        console.log("Burning MGC...");
        await txn.wait();
        console.log("MGC burned...", txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);
        setTokenTotalSupply(tokenSupply);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mintTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let tokenOwner = await tokenContract.owner();
        const txn = await tokenContract.mint(
          tokenOwner,
          utils.parseEther(inputValue.mintAmount)
        );
        console.log("Minting MGC...");
        await txn.wait();
        console.log("MGC minted...", txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);
        setTokenTotalSupply(tokenSupply);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (event) => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getTokenInfo();
  }, [isWalletConnected]);

  return (
    <main>
      <h1>
        <span>Magic Coin Mine</span> 🪄
      </h1>
      <section>
        {error && <p>{error}</p>}
        <div>
          <span>
            <strong>Coin Name:</strong> {tokenName}{" "}
          </span>
          <br />
          <span>
            <strong>Coin Symbol:</strong> {tokenSymbol}{" "}
          </span>
          <br />
          <span>
            <strong>Total Supply:</strong> {tokenTotalSupply}
          </span>
        </div>
        <div>
          <form>
            <br />
            <p>Enter your wallet address and Number of MGC</p>
            <input
              type="text"
              onChange={handleInputChange}
              name="walletAddress"
              placeholder="Wallet Address"
              value={inputValue.walletAddress}
            />
            <br />
            <br />
            <input
              type="text"
              onChange={handleInputChange}
              name="transferAmount"
              placeholder={`0 ${tokenSymbol}`}
              value={inputValue.transferAmount}
            />
            <p>You can only take upto 20 MGC at a time</p>
            <button onClick={transferToken}>Get Magic Coins</button>
            <br />
            <br />
          </form>
        </div>
        {isTokenOwner && (
          <section>
            <div>
              <form className="form-style">
                <br />
                <br />
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="burnAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.burnAmount}
                />
                <br />
                <br />
                <button onClick={burnTokens}>Burn Magic Coins</button>
              </form>
            </div>
            <div>
              <form>
                <br />
                <br />
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="mintAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.mintAmount}
                />
                <br />
                <br />
                <button onClick={mintTokens}>Mint Magic Coins</button>
              </form>
            </div>
          </section>
        )}
        <div>
          <p>
            <span>MGC in Your Wallet: </span>
            {myTotalBalance}
          </p>
          <br />
          <p>
            <span>Contract Address: </span>
            {contractAddress}
          </p>
        </div>
        <div>
          <p>
            <span>MGC Owner Address: </span>
            {tokenOwnerAddress}
          </p>
        </div>
        <div>
          {isWalletConnected && (
            <p>
              <span>Your Wallet Address: </span>
              {yourWalletAddress}
            </p>
          )}
          <button onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
    </main>
  );
}
export default App;
