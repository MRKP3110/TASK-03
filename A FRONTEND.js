import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

// ABI for DeFi Lending Contract 
const LendingContractABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "calculateInterestRate",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "lend",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "borrow",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "repay",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const LENDING_CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";
const TOKEN_ADDRESS = "YOUR_TOKEN_ADDRESS";

const App = () => {
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState(0);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(0);
  const [interestRate, setInterestRate] = useState(0);

  const providerOptions = {
    walletconnect: {
      package: require("@walletconnect/client"),
      options: {
        rpc: {
          1: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID"
        }
      }
    }
  };

  const connectWallet = async () => {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions
    });

    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    setAccount(await signer.getAddress());

    const lendingContract = new ethers.Contract(LENDING_CONTRACT_ADDRESS, LendingContractABI, signer);
    setContract(lendingContract);

    const userBalance = await provider.getBalance(await signer.getAddress());
    setBalance(ethers.utils.formatEther(userBalance));

    const rate = await lendingContract.calculateInterestRate();
    setInterestRate(ethers.utils.formatUnits(rate, 18)); // Assuming the rate is in 18 decimals
  };

  const lendTokens = async () => {
    if (!contract || !amount) return;
    try {
      const tx = await contract.lend(ethers.utils.parseUnits(amount.toString(), 18));
      await tx.wait();
      alert("Tokens successfully lent!");
    } catch (error) {
      console.error(error);
      alert("Error in lending tokens");
    }
  };

  const borrowTokens = async () => {
    if (!contract || !amount) return;
    try {
      const tx = await contract.borrow(ethers.utils.parseUnits(amount.toString(), 18));
      await tx.wait();
      alert("Tokens successfully borrowed!");
    } catch (error) {
      console.error(error);
      alert("Error in borrowing tokens");
    }
  };

  useEffect(() => {
    if (account) {
      connectWallet();
    }
  }, [account]);

  return (
    <div>
      <h1>DeFi Lending & Borrowing</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <h3>Connected Account: {account}</h3>
          <h3>Balance: {balance} ETH</h3>
          <h3>Interest Rate: {interestRate}%</h3>

          <div>
            <h4>Lend Tokens</h4>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount to Lend"
            />
            <button onClick={lendTokens}>Lend</button>
          </div>

          <div>
            <h4>Borrow Tokens</h4>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount to Borrow"
            />
            <button onClick={borrowTokens}>Borrow</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
