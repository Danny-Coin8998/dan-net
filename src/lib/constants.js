// DAN Token Configuration
export const DAN_TOKEN_ADDRESS = "0x046b82988a7113FCAd568B7102c7b823f4411385";
export const RECIPIENT_ADDRESS = "0x301a9B960F8bbD74609c51868d6bD1a27Ed2D7b2";

// Network Configuration (BSC Mainnet)
export const NETWORK_CONFIG = {
  CHAIN_ID: 56, // BSC Mainnet
  RPC_URL: "https://bsc-dataseed.binance.org/",
  CHAIN_NAME: "BSC Mainnet",
  NATIVE_CURRENCY: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  BLOCK_EXPLORER: "https://bscscan.com",
};

// ERC-20 ABI for token operations
export const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
];

// UI Constants
export const UI_CONFIG = {
  REFRESH_INTERVAL: 60000, // 60 seconds
  THB_TO_USD_RATE: 35, // 1 USD ≈ 35 THB
  THB_AMOUNT: 200,
};
