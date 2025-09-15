
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { MdOutlineArrowDropDown } from "react-icons/md";
import * as XLSX from "xlsx"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { tableFormatDate } from "../../components/Shared/formatDate";

const SupplierLedger = () => {
  const [supplies, setSupplies] = useState([]); // Supplier dropdown options
  const [supplierLedger, setSupplierLedger] = useState([]); // Ledger data for table
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);

  // Fetch supplies list
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/supply/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setSupplies(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching supplies:", error);
      });
  }, []);

  // Fetch full ledger on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/supplierLedger/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setSupplierLedger(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching ledger data:", error);
        setLoading(false);
      });
  }, []);

  // When supplier changes, update opening balance and filter ledger
  useEffect(() => {
    if (selectedSupplier) {
      // Find the selected supplier to get their due_amount
      const selectedSupply = supplies.find(
        (supply) => supply.supplier_name === selectedSupplier
      );
      
      if (selectedSupply) {
        // Set opening balance from supplier's due_amount
        const newOpeningBalance = parseFloat(selectedSupply.due_amount) || 0;
        setOpeningBalance(newOpeningBalance);
        setCurrentBalance(newOpeningBalance);
      }

      // Filter ledger data by selected supplier
      axios
        .get(`${import.meta.env.VITE_BASE_URL}/api/supplierLedger/list`)
        .then((response) => {
          if (response.data.status === "Success") {
            const filtered = response.data.data.filter(
              (item) => item.supplier_name === selectedSupplier
            );
            setSupplierLedger(filtered);
          }
        })
        .catch((error) => {
          console.error("Error fetching ledger data:", error);
        });
    } else {
      // Reset to show all ledger data when no supplier is selected
      setOpeningBalance(0);
      setCurrentBalance(0);
      axios
        .get(`${import.meta.env.VITE_BASE_URL}/api/supplierLedger/list`)
        .then((response) => {
          if (response.data.status === "Success") {
            setSupplierLedger(response.data.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching ledger data:", error);
        });
    }
  }, [selectedSupplier, supplies]);
console.log(supplies, "suo")
    //  Excel Export
  const exportExcel = () => {
    const tableData = ledgerWithBalance.map((item, index) => ({
      SL: index + 1,
      Date: item?.date,
      Particulars: item?.remarks || "",
      Mode: item?.mode || "",
      PurchaseAmount: item?.purchase_amount || "",
      PaymentAmount: item?.pay_amount || "",
      Balance: item?.runningBalance || "",
    }));

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Supplier Ledger");
    XLSX.writeFile(wb, "Supplier_Ledger.xlsx");

    toast.success("Excel file downloaded!");
  };

  //  PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Supplier Ledger", 14, 15);

    autoTable(doc, {
      head: [["SL", "Date", "Particulars", "Mode", "Purchase", "Payment", "Balance"]],
      body: ledgerWithBalance.map((item, index) => [
        index + 1,
       item.date,
        item.remarks || "",
        item.mode|| "",
        item?.purchase_amount || 0,
        item?.pay_amount || 0,
        item?.runningBalance || 0,
      ]),
      startY: 25,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [17, 55, 91], textColor: 255 },
    });

    doc.save("Supplier_Ledger.pdf");
    toast.success("PDF downloaded!");
  };

  //  Print
  const printTable = () => {
    const printWindow = window.open("", "", "width=900,height=650");
    printWindow.document.write(`
      <html>
        <head>
          <title>Supplier Ledger</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { text-align: center; color: #11375B; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
            thead { background: #11375B; color: white; }
            tr:nth-child(even) { background: #f9f9f9; }
            tr:hover { background: #f1f5f9; }
            .footer { margin-top: 20px; text-align: right; font-size: 12px; }
          </style>
        </head>
        <body>
          <h2>Supplier Ledger</h2>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Particulars</th>
                <th>Mode</th>
                <th>Purchase</th>
                <th>Payment</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${ledgerWithBalance
                .map(
                  (item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${item?.date}</td>
                  <td>${item?.remarks  || "--"}</td>
                  <td>${item?.mode || "--"}</td>
                  <td>${item?.purchase_amount || 0}</td>
                  <td>${item?.pay_amount || 0}</td>
                  <td>${item?.runningBalance || 0}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <div class="footer">
            Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };


  // Calculate running balance
  const calculateRunningBalance = () => {
    let balance = openingBalance;
    return supplierLedger.map((item) => {
      const purchase = parseFloat(item.purchase_amount) || 0;
      const payment = parseFloat(item.pay_amount) || 0;
      balance += purchase - payment;
      return {
        ...item,
        runningBalance: balance
      };
    });
  };

  const ledgerWithBalance = calculateRunningBalance();

  // Closing balance 
const closingBalance =
  ledgerWithBalance.length > 0
    ? ledgerWithBalance[ledgerWithBalance.length - 1].runningBalance
    : openingBalance;

  if (loading) return <p className="text-center mt-16">Loading data...</p>;

  return (
    <main className=" md:p-2 overflow-hidden">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#11375B] capitalize flex items-center gap-3">
            Supplier ledger
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2"></div>
        </div>

        {/* Export and Supplier Filter */}
        <div className="md:flex items-center justify-between mb-4">
          <div className="flex gap-1 md:gap-3 flex-wrap">
            <button onClick={exportExcel} className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer">
              Excel
            </button>
            <button onClick={exportPDF} className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer">
              PDF
            </button>
            <button onClick={printTable} className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer">
              Print
            </button>
          </div>
          <div className="mt-3 md:mt-0 w-full md:w-64 relative">
            <label className="text-primary text-sm font-semibold">
              Select Supplier Ledger
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="mt-1 w-full text-gray-700 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value="">Select supplier</option>
              {supplies.map((supply, idx) => (
                <option key={idx} value={supply.supplier_name}>
                  {supply.supplier_name} 
                  {/* (Due: {supply.due_amount}) */}
                </option>
              ))}
            </select>
            <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
          </div>
        </div>

        {/* Table */}
        <div className="w-full mt-5 overflow-x-auto border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="text-black capitalize font-bold">
              <tr>
    <td colSpan="6" className="text-right border border-gray-700 px-2 py-2">
      Closing Balance:
    </td>
    <td className="border border-gray-700 px-2 py-2">
      {closingBalance < 0 ? `${Math.abs(closingBalance)}` : closingBalance}
    </td>
  </tr>
              <tr>
                <th className="border border-gray-700 px-2 py-1">SL.</th>
                <th className="border border-gray-700 px-2 py-1">Date</th>
                <th className="border border-gray-700 px-2 py-1">
                  Supplier
                </th>
                <th className="border border-gray-700 px-2 py-1">
                  Particulars
                </th>
                <th className="border border-gray-700 px-2 py-1">Mode</th>
                <th className="border border-gray-700 px-2 py-1">
                  PurchaseAmount
                </th>
                <th className="border border-gray-700 px-2 py-1">
                  PaymentAmount
                </th>
                <th className="border border-gray-700 py-1 text-center">
                  <p className="border-b">
                    OpeningBalance: {openingBalance}
                  </p>
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="text-black font-semibold">
              {ledgerWithBalance.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="border border-gray-700 px-2 py-1 font-bold">
                    {index + 1}.
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {tableFormatDate(dt.date)}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.supplier_name}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.remarks}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.mode}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.purchase_amount}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.pay_amount}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.runningBalance < 0 
                      ? `${Math.abs(dt.runningBalance)}` 
                      : dt.runningBalance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default SupplierLedger;