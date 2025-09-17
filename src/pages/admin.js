import { Noto_Sans_Thai } from "next/font/google";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Swal from "sweetalert2";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function Admin() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  // Fetch transactions from Supabase
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        Swal.fire({
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่สามารถดึงข้อมูลรายการได้",
          icon: "error",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#ef4444",
        });
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถเชื่อมต่อฐานข้อมูลได้",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update is_received status
  const updateReceivedStatus = async (transactionId) => {
    try {
      setUpdating((prev) => ({ ...prev, [transactionId]: true }));

      const { error } = await supabase
        .from("transactions")
        .update({ is_received: true })
        .eq("id", transactionId);

      if (error) {
        console.error("Error updating transaction:", error);
        Swal.fire({
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่สามารถอัปเดตสถานะได้",
          icon: "error",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#ef4444",
        });
        return;
      }

      // Update local state
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, is_received: true }
            : transaction
        )
      );

      Swal.fire({
        title: "สำเร็จ!",
        text: "อัปเดตสถานะเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#B2CA2E",
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถอัปเดตสถานะได้",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setUpdating((prev) => ({ ...prev, [transactionId]: false }));
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format wallet address for display
  const formatWalletAddress = (address) => {
    if (!address) return "-";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format transaction hash for display
  const formatTransactionHash = (hash) => {
    if (!hash) return "-";
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div
      className={`${notoSansThai.className} font-sans min-h-screen bg-gray-50 p-6`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Admin Dashboard
          </h1>
          <p className="text-gray-600">จัดการรายการธุรกรรม</p>
        </div>

        {/* Summary */}
        {!loading && transactions.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                จำนวนรายการทั้งหมด
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {transactions.length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                รายการที่ได้รับแล้ว
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {transactions.filter((t) => t.is_received).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                รายการที่ยังไม่ได้รับ
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {transactions.filter((t) => !t.is_received).length}
              </p>
            </div>
          </div>
        )}
        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="text-black px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
          </button>
        </div>
        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600">ไม่มีข้อมูลรายการธุรกรรม</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      หมายเลขโทรศัพท์
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      อีเมล
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ที่อยู่กระเป๋าเงิน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวนโทเคน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวนเงิน (THB)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Hash
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่สร้าง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.phone_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {formatWalletAddress(transaction.wallet_address)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.dan_tokens_sent
                          ? parseFloat(transaction.dan_tokens_sent).toFixed(2)
                          : "-"}{" "}
                        DAN
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.thb_amount || "-"} THB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        <a
                          href={`https://bscscan.com/tx/${transaction.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {formatTransactionHash(transaction.transaction_hash)}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.is_received
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.is_received
                            ? "ได้รับแล้ว"
                            : "ยังไม่ได้รับ"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {!transaction.is_received && (
                          <button
                            onClick={() => updateReceivedStatus(transaction.id)}
                            disabled={updating[transaction.id]}
                            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{
                              background:
                                "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
                            }}
                          >
                            {updating[transaction.id]
                              ? "กำลังอัปเดต..."
                              : "ยืนยันการรับ"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
