
import { Toaster, toast } from "react-hot-toast";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaFilter } from "react-icons/fa6";
import { IoIosRemoveCircle } from "react-icons/io";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { tableFormatDate } from "../../components/Shared/formatDate";
import DatePicker from "react-datepicker";
import { isAfter, isBefore, isSameDay } from "date-fns";
import toNumber from "../../hooks/toNumber";

const OfficeLedger = () => {
  const [branch, setBranch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [officeList, setOfficeList] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);

  // Fetch branch data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/branch/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setBranch(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching branch data:", error);
        setLoading(false);
      });
  }, []);

  // Fetch office list with opening balances
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          const data = response.data.data;
          setOfficeList(data);

          // Set default branch if available
          if (data.length > 0 && !selectedBranch) {
            setSelectedBranch(data[0].branch_name);
            setOpeningBalance(parseFloat(data[0].opening_balance) || 0);
            setCurrentBalance(parseFloat(data[0].opening_balance) || 0);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching office list:", error);
      });
  }, []);

  // Update opening balance when branch changes
  useEffect(() => {
    if (selectedBranch && officeList.length > 0) {
      const selectedOffice = officeList.find(office => office.branch_name === selectedBranch);
      if (selectedOffice) {
        const balance = parseFloat(selectedOffice.opening_balance) || 0;
        setOpeningBalance(balance);
        setCurrentBalance(balance);
      }
    }
  }, [selectedBranch, officeList]);

  if (loading) return <p className="text-center mt-16">Loading data...</p>;

  // Filtered data based on selected branch and date range
  const filteredBranch = branch.filter((item) => {
    const isBranchMatch = selectedBranch
      ? item.branch_name === selectedBranch
      : true;

    if (!isBranchMatch) return false;
const itemDate = new Date(item.date);
     // If only startDate is set, match exactly that date
         if (startDate && !endDate) {
           return isSameDay(itemDate, startDate);
         }
   
         // If only endDate is set, match exactly that date
         if (!startDate && endDate) {
           return isSameDay(itemDate, endDate);
         }
   
         // If both startDate and endDate are set, filter range
         if (startDate && endDate) {
         return (
           (isAfter(itemDate, startDate) || isSameDay(itemDate, startDate)) &&
           (isBefore(itemDate, endDate) || isSameDay(itemDate, endDate))
         );
       }

    return true;
  });

  // Calculate running balance
  const calculateBalance = () => {
    let balance = openingBalance;
    return filteredBranch.map(item => {
      const cashIn = parseFloat(item.cash_in) || 0;
      const cashOut = parseFloat(item.cash_out) || 0;
      balance += cashIn - cashOut;
      return {
        ...item,
        runningBalance: balance
      };
    });
  };

  const branchDataWithBalance = calculateBalance();

  // Total CashIn, CashOut
const totalCashIn = filteredBranch.reduce(
  (sum, item) => sum + (parseFloat(item.cash_in) || 0),
  0
);
const totalCashOut = filteredBranch.reduce(
  (sum, item) => sum + (parseFloat(item.cash_out) || 0),
  0
);

  // Closing balance
  const closingBalance =
    branchDataWithBalance.length > 0
      ? branchDataWithBalance[branchDataWithBalance.length - 1].runningBalance
      : openingBalance;


  // ================= Excel Export =================
  const exportExcel = () => {
    const wsData = branchDataWithBalance.map((item, i) => ({
      SL: i + 1,
      Date: item.date,
      Particulars: item.remarks || "--",
      Mode: item.mode || "--",
      Destination: item.unload_point || "--",
      Due: item.due || "--",
      CashIn: toNumber(item.cash_in) || "--",
      CashOut: toNumber(item.cash_out) || "--",
      Balance: toNumber(item.runningBalance),
      Ref: item.ref || "--",
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Office Ledger");
    XLSX.writeFile(wb, `Office_Ledger_${selectedBranch || "All"}.xlsx`);

    toast.success("Excel file downloaded!");
  };

  // ================= PDF Export =================
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Office Ledger - ${selectedBranch}`, 14, 15);

    autoTable(doc, {
      head: [[
        "SL", "Date", "Particulars", "Mode", "Destination", "Due",
        "CashIn", "CashOut", "Balance", "Ref"
      ]],
      body: branchDataWithBalance.map((item, i) => [
        i + 1,
        item.date,
        item.remarks || "--",
        item.mode || "--",
        item.unload_point || "--",
        item.due || "--",
        item.cash_in || "--",
        item.cash_out || "--",
        item.runningBalance,
        item.ref || "--",
      ]),
      startY: 25,
      theme: "grid",
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: 255,
      },
      styles: { fontSize: 8 },
    });

    doc.save(`Office_Ledger_${selectedBranch || "All"}.pdf`);
    toast.success("PDF file downloaded!");
  };

  // ================= Print =================
  const printTable = () => {
    const printWindow = window.open("", "", "width=900,height=650");
    const tableHTML = `
    <html>
      <head>
        <title>Office Ledger - ${selectedBranch}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { color: #11375B; text-align: center; font-size: 20px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          thead tr { background: #11375B; color: white; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: center; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h2>Office Ledger - ${selectedBranch}</h2>
        <table>
          <thead>
            <tr>
              <th>SL</th>
              <th>Date</th>
              <th>Particulars</th>
              <th>Mode</th>
              <th>Destination</th>
              <th>Due</th>
              <th>CashIn</th>
              <th>CashOut</th>
              <th>Balance</th>
              <th>Ref</th>
            </tr>
          </thead>
          <tbody>
            ${branchDataWithBalance
        .map(
          (item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.date}</td>
                <td>${item.remarks || "--"}</td>
                <td>${item.mode || "--"}</td>
                <td>${item.unload_point || "--"}</td>
                <td>${item.due || "--"}</td>
                <td>${item.cash_in || "--"}</td>
                <td>${item.cash_out || "--"}</td>
                <td>${item.runningBalance}</td>
                <td>${item.ref || "--"}</td>
              </tr>`
        )
        .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <main className=" md:p-2 overflow-hidden">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#11375B] capitalize flex items-center gap-3">
            OFFICE LEDGER: {selectedBranch}
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {/* Export and Branch Selection */}
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
          <div className="mt-3 md:mt-0">
            <div className="relative w-full">
              <label className="text-primary text-sm font-semibold">
                Select Branch Ledger
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                {officeList.map((office, i) => (
                  <option key={i} value={office.branch_name}>
                    {office.branch_name} (Balance: {office.opening_balance})
                  </option>
                ))}
              </select>
              <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
            </div>
          </div>
        </div>

        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex items-center gap-5 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="flex-1 min-w-0">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                locale="en-GB"
                className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
                isClearable
              />
            </div>
            <div className="flex-1 min-w-0">
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                locale="en-GB"
                className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
                isClearable
              />
            </div>
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setShowFilter(false);
                }}
                className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <IoIosRemoveCircle /> Clear 
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="w-full mt-5 overflow-x-auto border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="text-black capitalize font-bold">
              <tr className="bg-gray-100 font-bold text-black">
               
                <td colSpan="6" className="text-right border border-gray-700 px-2 py-2">
                  Total Balance:
                </td>
                 <td className="border border-gray-700 px-2 py-2">{totalCashIn}</td>
  <td className="border border-gray-700 px-2 py-2">{totalCashOut}</td>
                <td className="border border-gray-700 px-2 py-2">
                  {closingBalance < 0
                    ? `${Math.abs(closingBalance)}`
                    : closingBalance}
                </td>
                <td className="border border-gray-700 px-2 py-2"></td>
              </tr>
              <tr>
                <th className="border border-gray-700 px-2 py-1">SL</th>
                <th className="border border-gray-700 px-2 py-1">Date</th>
                <th className="border border-gray-700 px-2 py-1">Particulars</th>
                <th className="border border-gray-700 px-2 py-1">Mode</th>
                <th className="border border-gray-700 px-2 py-1">Destination</th>
                <th className="border border-gray-700 px-2 py-1">Due</th>
                <th className="border border-gray-700 px-2 py-1">CashIn</th>
                <th className="border border-gray-700 px-2 py-1">CashOut</th>
                <th className="border border-gray-700 py-1 text-center">
                  <p className="border-b">Opening Balance: {openingBalance}</p>
                  <p>Current Balance</p>
                </th>
                <th className="border border-gray-700 px-2 py-1">Ref</th>
              </tr>
            </thead>
            <tbody className="text-black font-semibold">
              {branchDataWithBalance.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="border border-gray-700 px-2 py-1 font-bold">
                    {index + 1}.
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {tableFormatDate(dt.date)}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt?.remarks || "--"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.mode || "--"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.unload_point || "--"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.due || "--"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.cash_in || "--"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.cash_out || "--"}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.runningBalance < 0
                      ? `${Math.abs(dt.runningBalance)}`
                      : dt.runningBalance}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.ref || "--"}
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

export default OfficeLedger;