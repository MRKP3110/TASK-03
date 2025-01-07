// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeFiLending {

    // Token being used for lending/borrowing
    IERC20 public token;

    // Mapping of user balances (lent tokens) and collateral (borrowers' deposits)
    mapping(address => uint256) public lendingBalance;
    mapping(address => uint256) public borrowingBalance;
    mapping(address => uint256) public collateralBalance;

    // Interest rate model parameters
    uint256 public baseInterestRate = 5; // Base rate in percentage (e.g., 5%)
    uint256 public supplyDemandMultiplier = 10; // Multiplier to adjust the rate based on supply-demand

    // Collateralization ratio (e.g., 150% collateral required for borrowing)
    uint256 public collateralizationRatio = 150; // 150% collateral

    event Lended(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);

    // Constructor to set the token being used
    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    // Function to deposit tokens into the lending pool
    function lend(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");

        token.transferFrom(msg.sender, address(this), amount);
        lendingBalance[msg.sender] += amount;

        emit Lended(msg.sender, amount);
    }

    // Function to withdraw tokens from the lending pool
    function withdraw(uint256 amount) external {
        require(lendingBalance[msg.sender] >= amount, "Insufficient balance");

        lendingBalance[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
    }

    // Function to deposit collateral before borrowing
    function depositCollateral(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");

        token.transferFrom(msg.sender, address(this), amount);
        collateralBalance[msg.sender] += amount;

        emit CollateralDeposited(msg.sender, amount);
    }

    // Function to withdraw collateral
    function withdrawCollateral(uint256 amount) external {
        require(collateralBalance[msg.sender] >= amount, "Insufficient collateral");

        collateralBalance[msg.sender] -= amount;
        token.transfer(msg.sender, amount);

        emit CollateralWithdrawn(msg.sender, amount);
    }

    // Function to calculate the interest rate based on supply-demand
    function calculateInterestRate() public view returns (uint256) {
        uint256 totalSupply = address(this).balance;
        uint256 totalBorrowed = 0;
        for (uint256 i = 0; i < totalBorrowed; i++) {
            totalBorrowed += lendingBalance[i];  // Adjust according to the real structure
        }

        uint256 supplyDemandRatio = totalSupply == 0 ? 1 : totalBorrowed / totalSupply;
        uint256 dynamicRate = baseInterestRate + (supplyDemandRatio * supplyDemandMultiplier);
        return dynamicRate;
    }

    // Function to borrow tokens from the lending pool
    function borrow(uint256 amount) external {
        uint256 requiredCollateral = amount * collateralizationRatio / 100;
        require(collateralBalance[msg.sender] >= requiredCollateral, "Insufficient collateral");

        borrowingBalance[msg.sender] += amount;
        token.transfer(msg.sender, amount);

        emit Borrowed(msg.sender, amount);
    }

    // Function to repay the borrowed tokens
    function repay(uint256 amount) external {
        require(borrowingBalance[msg.sender] >= amount, "Repay amount exceeds borrowed balance");

        borrowingBalance[msg.sender] -= amount;
        token.transferFrom(msg.sender, address(this), amount);

        emit Repaid(msg.sender, amount);
    }
}
  );
};

export default LendingApp;
