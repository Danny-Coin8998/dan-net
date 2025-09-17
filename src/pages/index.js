import { Noto_Sans_Thai } from "next/font/google";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { tokenTransferService } from "../lib/tokenTransferService";
import {
  DAN_TOKEN_ADDRESS,
  RECIPIENT_ADDRESS,
  NETWORK_CONFIG,
  UI_CONFIG,
} from "../lib/constants";
import Swal from "sweetalert2";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function Home() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tokenPrice, setTokenPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Fetch DAN token price
  useEffect(() => {
    const fetchTokenPrice = async () => {
      try {
        const response = await fetch(
          "https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x43c92688ab7b5633fd165010feff4e3852162a5f"
        );
        const data = await response.json();
        const price = data?.data?.attributes?.base_token_price_usd;

        if (price) {
          setTokenPrice(parseFloat(price));
        }
      } catch (err) {
        // Failed to fetch token price
      }
    };

    fetchTokenPrice();
    const interval = setInterval(fetchTokenPrice, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate required DAN tokens for 200 THB
  const calculateRequiredTokens = () => {
    if (tokenPrice === 0) return 0;
    // Using exchange rate from constants
    const usdAmount = UI_CONFIG.THB_AMOUNT / UI_CONFIG.THB_TO_USD_RATE;
    return usdAmount / tokenPrice;
  };

  // Connect wallet function
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setError(null);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        // Check if we're on BSC network (chainId: 56)
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        if (chainId !== "0x38") {
          // 0x38 = 56 in decimal (BSC mainnet)
          const switchToBSC = confirm(
            "You need to be on BSC (Binance Smart Chain) network. Would you like to switch to BSC mainnet?"
          );

          if (switchToBSC) {
            try {
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x38" }],
              });
            } catch (switchError) {
              // If BSC is not added, add it
              if (switchError.code === 4902) {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x38",
                      chainName: NETWORK_CONFIG.CHAIN_NAME,
                      nativeCurrency: NETWORK_CONFIG.NATIVE_CURRENCY,
                      rpcUrls: [NETWORK_CONFIG.RPC_URL],
                      blockExplorerUrls: [NETWORK_CONFIG.BLOCK_EXPLORER],
                    },
                  ],
                });
              }
            }
          } else {
            const errorMessage = "Please switch to BSC network to continue.";
            setError(errorMessage);

            // Show SweetAlert for error
            Swal.fire({
              title: "เกิดข้อผิดพลาด!",
              text: "กรุณาเปลี่ยนไปใช้เครือข่าย BSC (Binance Smart Chain) เพื่อดำเนินการต่อ",
              icon: "error",
              confirmButtonText: "ตกลง",
              confirmButtonColor: "#ef4444",
              customClass: {
                popup: "swal-popup-custom",
                title: "swal-title-custom",
                content: "swal-content-custom",
                confirmButton: "swal-confirm-custom",
              },
            });
            return;
          }
        }

        setAccount(accounts[0]);
        setIsConnected(true);
        setSuccess("Wallet connected successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        const errorMessage = "Failed to connect wallet. Please try again.";
        setError(errorMessage);

        // Show SweetAlert for error
        Swal.fire({
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่สามารถเชื่อมต่อกระเป๋าเงินได้ กรุณาลองใหม่อีกครั้ง",
          icon: "error",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#ef4444",
          customClass: {
            popup: "swal-popup-custom",
            title: "swal-title-custom",
            content: "swal-content-custom",
            confirmButton: "swal-confirm-custom",
          },
        });
      }
    } else {
      const errorMessage =
        "Please install MetaMask or another Web3 wallet to continue.";
      setError(errorMessage);

      // Show SweetAlert for error
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "กรุณาติดตั้ง MetaMask หรือกระเป๋าเงิน Web3 อื่นๆ เพื่อดำเนินการต่อ",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-popup-custom",
          title: "swal-title-custom",
          content: "swal-content-custom",
          confirmButton: "swal-confirm-custom",
        },
      });
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount("");
    setError(null);
    setSuccess(null);
    setPhoneNumber("");
    setEmail("");
  };

  // Buy internet function using modern token transfer service
  const buyInternet = async () => {
    if (!isConnected) {
      const errorMessage = "Please connect your wallet first.";
      setError(errorMessage);

      // Show SweetAlert for error
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "กรุณาเชื่อมต่อกระเป๋าเงินของคุณก่อน",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-popup-custom",
          title: "swal-title-custom",
          content: "swal-content-custom",
          confirmButton: "swal-confirm-custom",
        },
      });
      return;
    }

    if (!phoneNumber.trim()) {
      const errorMessage = "Please enter your phone number.";
      setError(errorMessage);

      // Show SweetAlert for error
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "กรุณาใส่หมายเลขโทรศัพท์ของคุณ",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-popup-custom",
          title: "swal-title-custom",
          content: "swal-content-custom",
          confirmButton: "swal-confirm-custom",
        },
      });
      return;
    }

    if (tokenPrice === 0) {
      const errorMessage =
        "Token price is not available. Please try again later.";
      setError(errorMessage);

      // Show SweetAlert for error
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถดึงราคาโทเคนได้ กรุณาลองใหม่อีกครั้งในภายหลัง",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-popup-custom",
          title: "swal-title-custom",
          content: "swal-content-custom",
          confirmButton: "swal-confirm-custom",
        },
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const requiredTokens = calculateRequiredTokens();

      // Use the token transfer service
      const transferResult = await tokenTransferService.transferToAddress(
        RECIPIENT_ADDRESS,
        requiredTokens,
        account
      );

      if (transferResult.success) {
        // Save transaction data to Supabase
        try {
          if (
            process.env.NEXT_PUBLIC_SUPABASE_URL &&
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ) {
            const { data, error } = await supabase.from("transactions").insert([
              {
                wallet_address: account,
                email: email || null,
                phone_number: phoneNumber,
                is_received: false, // Set to false as requested
                transaction_hash: transferResult.transactionHash,
                dan_tokens_sent: requiredTokens, // Using dan_tokens_sent to match database schema
                thb_amount: UI_CONFIG.THB_AMOUNT,
                created_at: new Date().toISOString(),
              },
            ]);

            if (error) {
              // Show SweetAlert for success
              Swal.fire({
                title: "สำเร็จ!",
                text: "คำสั่งซื้ออินเตอร์เน็ตของคุณเสร็จสมบูรณ์แล้ว",
                icon: "success",
                confirmButtonText: "ตกลง",
                confirmButtonColor: "#B2CA2E",
                customClass: {
                  popup: "swal-popup-custom",
                  title: "swal-title-custom",
                  content: "swal-content-custom",
                  confirmButton: "swal-confirm-custom",
                },
              });

              setSuccess(
                `Transaction successful! Hash: ${
                  transferResult.transactionHash
                }\nPhone: ${phoneNumber}\nEmail: ${
                  email || "Not provided"
                }\n\nNote: Transaction data could not be saved to database.`
              );
            } else {
              // Show SweetAlert for success
              Swal.fire({
                title: "สำเร็จ!",
                text: "คำสั่งซื้ออินเตอร์เน็ตของคุณเสร็จสมบูรณ์แล้ว",
                icon: "success",
                confirmButtonText: "ตกลง",
                confirmButtonColor: "#B2CA2E",
                customClass: {
                  popup: "swal-popup-custom",
                  title: "swal-title-custom",
                  content: "swal-content-custom",
                  confirmButton: "swal-confirm-custom",
                },
              });

              setSuccess(
                `Transaction successful! Hash: ${
                  transferResult.transactionHash
                }\nPhone: ${phoneNumber}\nEmail: ${
                  email || "Not provided"
                }\n\nTransaction data saved successfully!`
              );
            }
          } else {
            setDebugInfo(
              "Supabase credentials missing. Please check your .env.local file."
            );

            // Show SweetAlert for success
            Swal.fire({
              title: "สำเร็จ!",
              text: "คำสั่งซื้ออินเตอร์เน็ตของคุณเสร็จสมบูรณ์แล้ว",
              icon: "success",
              confirmButtonText: "ตกลง",
              confirmButtonColor: "#B2CA2E",
            });

            setSuccess(
              `Transaction successful! Hash: ${
                transferResult.transactionHash
              }\nPhone: ${phoneNumber}\nEmail: ${
                email || "Not provided"
              }\n\nNote: Database not configured - transaction data not saved.`
            );
          }
        } catch (dbError) {
          // Show SweetAlert for success
          Swal.fire({
            title: "สำเร็จ!",
            text: "คำสั่งซื้ออินเตอร์เน็ตของคุณเสร็จสมบูรณ์แล้ว",
            icon: "success",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#B2CA2E",
          });

          setSuccess(
            `Transaction successful! Hash: ${
              transferResult.transactionHash
            }\nPhone: ${phoneNumber}\nEmail: ${
              email || "Not provided"
            }\n\nNote: Transaction data could not be saved to database.`
          );
        }

        // Reset form
        setPhoneNumber("");
        setEmail("");

        // Clear success message after 10 seconds
        setTimeout(() => setSuccess(null), 10000);
      } else {
        const errorMessage = transferResult.error || "Transfer failed";
        setError(errorMessage);

        // Show SweetAlert for error
        Swal.fire({
          title: "เกิดข้อผิดพลาด!",
          text: "ยอดเงินไม่เพียงพอ กรุณาลองใหม่อีกครั้ง",
          icon: "error",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#ef4444",
          customClass: {
            popup: "swal-popup-custom",
            title: "swal-title-custom",
            content: "swal-content-custom",
            confirmButton: "swal-confirm-custom",
          },
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Transaction failed. Please try again.";
      setError(errorMessage);

      // Show SweetAlert for error
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการทำรายการ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-popup-custom",
          title: "swal-title-custom",
          content: "swal-content-custom",
          confirmButton: "swal-confirm-custom",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${notoSansThai.className} font-sans min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-white`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div
          className="absolute top-20 left-20 w-32 h-32 rounded-full animate-float"
          style={{
            background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
            animationDelay: "0s",
          }}
        ></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 rounded-full animate-float"
          style={{
            background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
            animationDelay: "1s",
          }}
        ></div>
        <div
          className="absolute bottom-32 left-40 w-20 h-20 rounded-full animate-float"
          style={{
            background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
            animationDelay: "2s",
          }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-28 h-28 rounded-full animate-float"
          style={{
            background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
            animationDelay: "3s",
          }}
        ></div>
        <div
          className="absolute top-1/2 left-10 w-16 h-16 rounded-full animate-float"
          style={{
            background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
            animationDelay: "4s",
          }}
        ></div>
        <div
          className="absolute top-1/3 right-10 w-12 h-12 rounded-full animate-float"
          style={{
            background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
            animationDelay: "5s",
          }}
        ></div>
      </div>

      {/* Main Content */}
      <main className="text-center z-10 max-w-4xl mx-auto">
        {/* Logo/Brand */}
        <div className="mb-8 animate-fade-in-up">
          <h1
            className="text-6xl md:text-8xl font-bold mb-4 tracking-tight animate-pulse-slow"
            style={{
              background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            DAN
          </h1>
          <h2
            className="text-2xl md:text-3xl font-light text-gray-700 mb-2 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            Internet
          </h2>
          <div
            className="w-24 h-1 mx-auto rounded-full animate-scale-in"
            style={{
              background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
              animationDelay: "1s",
            }}
          ></div>
        </div>
        {/* Token Price Display */}
        <div className="mb-8 text-center">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg max-w-md mx-auto">
            <h4 className="text-gray-800 font-semibold text-lg mb-2">
              DAN Token Price
            </h4>
            <p className="text-2xl font-bold text-gray-800">
              {tokenPrice > 0 ? `$${tokenPrice.toFixed(6)} USD` : "Loading..."}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Required:{" "}
              {tokenPrice > 0
                ? `${calculateRequiredTokens().toFixed(2)} DAN`
                : "Calculating..."}{" "}
              for {UI_CONFIG.THB_AMOUNT} THB
            </p>
          </div>
        </div>
        {/* Wallet Connection Section */}
        {!isConnected ? (
          <div
            className="bg-gray-50 rounded-2xl p-8 border border-gray-200 max-w-lg mx-auto shadow-lg animate-fade-in-up hover:shadow-xl transition-all duration-300"
            style={{ animationDelay: "4s" }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🔗</div>
              <h4 className="text-gray-800 font-semibold text-xl mb-4">
                Connect Your Wallet
              </h4>
              <p className="text-gray-600 text-sm mb-6">
                Please connect your Web3 wallet to purchase internet packages
                with DAN tokens
              </p>

              <button
                onClick={connectWallet}
                className="w-full px-6 py-4 font-semibold rounded-lg transition-all duration-300 text-white hover:scale-105 hover:shadow-lg text-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
                }}
              >
                Connect Wallet
              </button>

              <p className="text-xs text-gray-500 mt-4">
                Supported: MetaMask, WalletConnect, and other Web3 wallets
              </p>
            </div>
          </div>
        ) : (
          /* Buy Internet Form - Only shown after wallet connection */
          <div
            className="bg-gray-50 rounded-2xl p-8 border border-gray-200 max-w-lg mx-auto shadow-lg animate-fade-in-up hover:shadow-xl transition-all duration-300"
            style={{ animationDelay: "0.5s" }}
          >
            <h4 className="text-gray-800 font-semibold text-lg mb-4 text-center">
              Buy Internet Package
            </h4>
            <p className="text-gray-600 text-sm mb-6 text-center">
              Enter your details and pay with DAN tokens
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <button
                onClick={buyInternet}
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full px-6 py-3 font-semibold rounded-lg transition-all duration-300 text-white hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background:
                    "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
                }}
              >
                {isLoading
                  ? "Processing..."
                  : `Buy Internet (${UI_CONFIG.THB_AMOUNT} THB)`}
              </button>{" "}
              <div className="text-center mb-6">
                {/* <div className="text-2xl mb-2">✅</div> */}
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row items-center gap-2">
                    <h4 className="text-gray-800 font-semibold text-lg">
                      Wallet Connected
                    </h4>
                    <p className="text-sm text-gray-600">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="bg-white border-gray-200 border-2 px-5 py-2 rounded-lg cursor-pointer hover:bg-gray-100 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-16">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-3xl mb-3">🚀</div>
            <h4 className="text-gray-800 font-semibold text-lg mb-2">
              เร็วและเสถียร
            </h4>
            <p className="text-gray-600 text-sm">
              การเชื่อมต่ออินเทอร์เน็ตความเร็วสูง
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-3xl mb-3">🛡️</div>
            <h4 className="text-gray-800 font-semibold text-lg mb-2">
              ปลอดภัย
            </h4>
            <p className="text-gray-600 text-sm">ระบบรักษาความปลอดภัยขั้นสูง</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-3xl mb-3">💎</div>
            <h4 className="text-gray-800 font-semibold text-lg mb-2">
              พรีเมียม
            </h4>
            <p className="text-gray-600 text-sm">คุณภาพบริการระดับพรีเมียม</p>
          </div>
        </div>
      </main>

      {/* Error Display */}
      {/* {error && (
        <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-900/50 rounded-lg border border-red-500">
          <p className="text-red-200 text-sm text-center">⚠️ {error}</p>
        </div>
      )} */}

      {/* Success Display */}
      {/* {success && (
        <div className="max-w-2xl mx-auto mb-4 p-4 bg-green-900/50 rounded-lg border border-green-500">
          <p className="text-green-200 text-sm text-center whitespace-pre-line">
            ✅ {success}
          </p>
        </div>
      )} */}

      {/* Debug Info Display */}
      {/* {debugInfo && (
        <div className="max-w-2xl mx-auto mb-4 p-4 bg-yellow-900/50 rounded-lg border border-yellow-500">
          <p className="text-yellow-200 text-sm text-center">🔧 {debugInfo}</p>
        </div>
      )} */}

      {/* Footer */}
      <footer className="text-center my-8">
        <p className="text-gray-600 text-sm">
          © 2024 Dan Internet. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
