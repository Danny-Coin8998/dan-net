import { ethers } from "ethers";
import {
  DAN_TOKEN_ADDRESS,
  RECIPIENT_ADDRESS,
  NETWORK_CONFIG,
  ERC20_ABI,
} from "./constants";

// Custom Error Classes
class MetaMaskError extends Error {
  constructor(message) {
    super(message);
    this.name = "MetaMaskError";
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Token Transfer Service
 * Handles DAN token transfers using ethers.js
 */
class TokenTransferService {
  constructor() {
    this.provider = null;
    this.signer = null;
  }

  /**
   * Initialize provider and signer
   */
  async initializeProvider() {
    if (!window.ethereum) {
      throw new MetaMaskError("MetaMask is not installed");
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();

    // Verify network
    const network = await this.provider.getNetwork();
    if (Number(network.chainId) !== NETWORK_CONFIG.CHAIN_ID) {
      throw new NetworkError(`Please switch to ${NETWORK_CONFIG.CHAIN_NAME}`);
    }
  }

  /**
   * Get token contract instance
   */
  async getTokenContract() {
    if (!this.signer) {
      await this.initializeProvider();
    }

    return new ethers.Contract(DAN_TOKEN_ADDRESS, ERC20_ABI, this.signer);
  }

  /**
   * Convert token amount to wei
   */
  async convertToWei(amount) {
    const tokenContract = await this.getTokenContract();

    let decimals = 18; // Default to 18 decimals

    try {
      const contractDecimals = await tokenContract.decimals();
      decimals = Number(contractDecimals);
      console.log(`Token decimals: ${decimals}`);
    } catch (error) {
      console.warn(
        "Failed to get decimals from contract, using default 18:",
        error
      );
    }

    return ethers.parseUnits(amount.toString(), decimals);
  }

  /**
   * Convert wei to token amount
   */
  async convertFromWei(amountWei) {
    const tokenContract = await this.getTokenContract();

    let decimals = 18; // Default to 18 decimals

    try {
      const contractDecimals = await tokenContract.decimals();
      decimals = Number(contractDecimals);
    } catch (error) {
      console.warn(
        "Failed to get decimals from contract, using default 18:",
        error
      );
    }

    return parseFloat(ethers.formatUnits(amountWei, decimals));
  }

  /**
   * Handle transaction execution with proper error handling
   */
  async executeTransaction(transactionPromise, context) {
    try {
      console.log(`${context}: Initiating transaction...`);
      const transaction = await transactionPromise;

      console.log(`${context}: Transaction sent, waiting for confirmation...`);
      const receipt = await transaction.wait();

      if (!receipt) {
        throw new Error("Transaction receipt not available");
      }
      console.log(`${context}: Transaction confirmed - ${receipt.hash}`);

      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed,
      };
    } catch (error) {
      console.error(`${context}: Transaction failed`, error);

      let errorMessage = "Transaction failed";
      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient balance for transaction";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction cancelled by user";
        } else if (error.message.includes("gas")) {
          errorMessage = "Gas estimation failed or out of gas";
        } else if (error.message.includes("CALL_EXCEPTION")) {
          console.error("CALL_EXCEPTION details:", error);
          const errorObj = error;
          if (errorObj.reason) {
            errorMessage = `Contract call failed: ${errorObj.reason}`;
          } else if (errorObj.data) {
            errorMessage = `Contract call failed with data: ${errorObj.data}`;
          } else {
            errorMessage =
              "Contract call failed - the contract may not support this function or the network connection failed";
          }
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if user has sufficient balance for transfer
   */
  async checkSufficientBalance(userAddress, requiredAmount) {
    try {
      const tokenContract = await this.getTokenContract();
      const balanceWei = await tokenContract.balanceOf(userAddress);
      const currentBalance = await this.convertFromWei(balanceWei);

      return {
        sufficient: currentBalance >= requiredAmount,
        currentBalance,
        formattedBalance: currentBalance.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 4,
        }),
      };
    } catch (error) {
      console.error("Balance check failed:", error);
      return {
        sufficient: false,
        currentBalance: 0,
        formattedBalance: "0",
      };
    }
  }

  /**
   * Validate transfer state before execution
   */
  async validateTransferState(fromAddress, toAddress, amount) {
    try {
      // Validate addresses
      if (!ethers.isAddress(fromAddress)) {
        return { valid: false, error: "Invalid from address" };
      }
      if (!ethers.isAddress(toAddress)) {
        return { valid: false, error: "Invalid to address" };
      }

      // Check user balance
      const balanceCheck = await this.checkSufficientBalance(
        fromAddress,
        amount
      );
      if (!balanceCheck.sufficient) {
        return {
          valid: false,
          error: `Insufficient balance. Required: ${amount} DAN, Available: ${balanceCheck.formattedBalance} DAN`,
        };
      }

      // Check if contracts are accessible
      try {
        const tokenContract = await this.getTokenContract();
        await tokenContract.balanceOf(fromAddress);
      } catch {
        return {
          valid: false,
          error: "Token contract not accessible",
        };
      }

      return { valid: true };
    } catch (error) {
      console.error("Transfer validation failed:", error);
      return {
        valid: false,
        error:
          error instanceof Error ? error.message : "Transfer validation failed",
      };
    }
  }

  /**
   * Direct token transfer to a specific address
   */
  async transferToAddress(toAddress, amount, fromAddress) {
    try {
      console.log(
        `Starting transfer validation for ${amount} DAN from ${fromAddress} to ${toAddress}`
      );

      // Validate transfer state first
      const validation = await this.validateTransferState(
        fromAddress,
        toAddress,
        amount
      );
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || "Transfer validation failed",
        };
      }

      const amountInWei = await this.convertToWei(amount);
      console.log(`Amount in Wei: ${amountInWei.toString()}`);

      // Get token contract and execute direct transfer
      const tokenContract = await this.getTokenContract();

      // Log contract details for debugging
      console.log(
        `Token contract address: ${await tokenContract.getAddress()}`
      );
      console.log(`From address: ${fromAddress}`);
      console.log(`To address: ${toAddress}`);
      console.log(`Amount in Wei: ${amountInWei.toString()}`);

      // Estimate gas before transfer
      try {
        const gasEstimate = await tokenContract.transfer.estimateGas(
          toAddress,
          amountInWei,
          { from: fromAddress }
        );
        console.log(`Estimated gas: ${gasEstimate.toString()}`);
      } catch (gasError) {
        console.warn("Gas estimation failed:", gasError);
      }

      console.log(
        `Transferring ${amount} DAN from ${fromAddress} to ${toAddress}`
      );

      return await this.executeTransaction(
        tokenContract.transfer(toAddress, amountInWei),
        `Direct Transfer (${amount} DAN to ${toAddress})`
      );
    } catch (error) {
      console.error("Direct transfer failed:", error);

      // Enhanced error logging
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Direct transfer failed",
      };
    }
  }

  /**
   * Test basic contract connectivity and functionality
   */
  async testContractConnection() {
    try {
      const tokenContract = await this.getTokenContract();

      // Test optional contract calls that might not exist on all ERC-20 contracts
      let symbol;
      let name;
      let decimals = 18; // Default decimals

      try {
        symbol = await tokenContract.symbol();
      } catch (error) {
        console.warn("Contract doesn't support symbol() function:", error);
      }

      try {
        name = await tokenContract.name();
      } catch (error) {
        console.warn("Contract doesn't support name() function:", error);
      }

      try {
        const contractDecimals = await tokenContract.decimals();
        decimals = Number(contractDecimals);
      } catch (error) {
        console.warn(
          "Contract doesn't support decimals() function, using default 18:",
          error
        );
      }

      // Test the basic transfer function signature exists
      try {
        const transferFunction =
          tokenContract.interface.getFunction("transfer");
        if (!transferFunction) {
          throw new Error("Contract does not support transfer function");
        }
      } catch (error) {
        console.error("Contract missing essential transfer function:", error);
        return {
          success: false,
          error: "Contract does not implement ERC-20 transfer function",
        };
      }

      return {
        success: true,
        details: {
          symbol,
          decimals,
          name,
        },
      };
    } catch (error) {
      console.error("Contract connection test failed:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Contract connection test failed",
      };
    }
  }

  /**
   * Reset provider and signer (useful for wallet changes)
   */
  reset() {
    this.provider = null;
    this.signer = null;
  }
}

// Export singleton instance
export const tokenTransferService = new TokenTransferService();
