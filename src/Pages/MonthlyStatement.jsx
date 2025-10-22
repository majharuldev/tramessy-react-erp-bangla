import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { SlCalender } from "react-icons/sl";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../components/Shared/Pagination";

const MonthlyStatement = () => {
  const [allData, setAllData] = useState([]); // Store all data
  const [filteredData, setFilteredData] = useState([]); // Store filtered data
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(""); // For month filter
  const [availableMonths, setAvailableMonths] = useState([]); 

  

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [tripsRes, purchasesRes, expensesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/expense/list`)
      ]);

      const trips = tripsRes.data?.data || [];
      const purchases = purchasesRes.data?.data || [];
      const expenses = expensesRes.data?.data || [];

      const monthlyData = {};

      const getMonthKey = date => dayjs(date).format("YYYY-MM");

      // Process all data
      trips.forEach(trip => {
        const month = getMonthKey(trip.date);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            ownTripIncome: 0,
            vendorTripIncome: 0,
            ownTripCost: 0,
            vendorTripCost: 0,
            purchaseCost: 0,
            salaryExpense: 0,
            officeExpense: 0
          };
        }

        if (trip.transport_type === "own_transport") {
          monthlyData[month].ownTripIncome += parseFloat(trip.total_rent) || 0;
          // monthlyData[month].ownTripCost += 
            // (parseFloat(trip.fuel_cost) || 0) +
            // (parseFloat(trip.driver_commission) || 0) +
            // (parseFloat(trip.food_cost) || 0) +
            // (parseFloat(trip.parking_cost) || 0) +
            // (parseFloat(trip.toll_cost) || 0) +
            // (parseFloat(trip.feri_cost) || 0) +
            // (parseFloat(trip.police_cost) || 0) +
            // (parseFloat(trip.night_guard) || 0) +
            // (parseFloat(trip.chada) || 0) +
            // (parseFloat(trip.others_cost) || 0) +
            // (parseFloat(trip.additional_cost) || 0) +
            // (parseFloat(trip.additional_unload_charge) || 0) +
            // (parseFloat(trip.callan_cost) || 0) +
            // (parseFloat(trip.labor) || 0);
          monthlyData[month].ownTripCost += parseFloat(trip.total_exp) || 0;
        } else if (trip.transport_type === "vendor_transport") {
          monthlyData[month].vendorTripIncome += parseFloat(trip.total_rent) || 0;
          monthlyData[month].vendorTripCost += parseFloat(trip.total_exp) || 0;
        }
      });

      purchases.forEach(purchase => {
        const month = getMonthKey(purchase.date);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            ownTripIncome: 0,
            vendorTripIncome: 0,
            ownTripCost: 0,
            vendorTripCost: 0,
            purchaseCost: 0,
            salaryExpense: 0,
            officeExpense: 0
          };
        }
        monthlyData[month].purchaseCost += parseFloat(purchase.purchase_amount) || 0;
      });

      expenses.forEach(expense => {
        const month = getMonthKey(expense.date);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            ownTripIncome: 0,
            vendorTripIncome: 0,
            ownTripCost: 0,
            vendorTripCost: 0,
            purchaseCost: 0,
            salaryExpense: 0,
            officeExpense: 0
          };
        }

        if (expense.payment_category === "Salary") {
          monthlyData[month].salaryExpense += parseFloat(expense.pay_amount) || 0;
        } else {
          monthlyData[month].officeExpense += parseFloat(expense.pay_amount) || 0;
        }
      });

      // Convert to array
      const result = Object.entries(monthlyData)
        .sort(([a], [b]) => dayjs(b).diff(dayjs(a)))
        .map(([month, values], index) => ({
          id: index + 1,
          month: dayjs(month).format("MMMM YYYY"),
          monthKey: month,
          ...values,
          totalExpense: 
            values.ownTripCost + 
            values.vendorTripCost + 
            values.purchaseCost + 
            values.salaryExpense + 
            values.officeExpense,
          netProfit: 
            (values.ownTripIncome + values.vendorTripIncome) - 
            (values.ownTripCost + values.vendorTripCost + values.purchaseCost + values.salaryExpense + values.officeExpense)
        }));

      setAllData(result);
      setFilteredData(result);
      
      // Set available months for dropdown
      const months = Object.keys(monthlyData).map(month => ({
        value: month,
        label: dayjs(month).format("MMMM YYYY")
      }));
      setAvailableMonths(months);
      
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply month filter
  useEffect(() => {
    if (selectedMonth) {
      const filtered = allData.filter(item => item.monthKey === selectedMonth);
      setFilteredData(filtered);
    } else {
      setFilteredData(allData);
    }
  }, [selectedMonth, allData]);

  // Export functions
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      "Month": item.month,
      "Own Trip Income": item.ownTripIncome,
      "Vendor Trip Income": item.vendorTripIncome,
      "Own Trip Cost": item.ownTripCost,
      "Vendor Trip Cost": item.vendorTripCost,
      "Purchase Cost": item.purchaseCost,
      "Salary Expense": item.salaryExpense,
      "Office Expense": item.officeExpense,
      "Total Expense": item.totalExpense,
      "Net Profit": item.netProfit
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Statement");
    XLSX.writeFile(workbook, "Monthly_Statement.xlsx");
  };

  // pdf
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Monthly Statement Report", 10, 10);
    
    autoTable(doc, {
      head: [
        ["Month", "Own Income", "Vendor Income", "Own Cost", "Vendor Cost", 
         "Purchases", "Salaries", "Office", "Total Expense", "Net Profit"]
      ],
      body: filteredData.map(item => [
        item.month,
        item.ownTripIncome,
        item.vendorTripIncome,
        item.ownTripCost,
        item.vendorTripCost,
        item.purchaseCost,
        item.salaryExpense,
        item.officeExpense,
        item.totalExpense,
        item.netProfit
      ]),
      startY: 20
    });
    
    doc.save("Monthly_Statement.pdf");
  };

  useEffect(() => {
    fetchData();
  }, []);

  // print
  useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-table, .print-table * {
        visibility: visible;
      }
      .print-table {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}, []);
// print func
const handlePrint = () => {
  // টেবিল বানাবো filteredData দিয়ে
  const tableHTML = `
    <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse; font-size:12px; text-align:right;">
      <thead style="background:#11375B; color:white; text-align:center;">
        <tr>
          <th>#</th>
          <th style="text-align:left;">Month</th>
          <th>Own Trip Income</th>
          <th>Vendor Trip Income</th>
          <th>Own Trip Cost</th>
          <th>Vendor Trip Cost</th>
          <th>Purchase Cost</th>
          <th>Salary Expense</th>
          <th>Office Expense</th>
          <th>Total Expense</th>
          <th>Net Profit</th>
        </tr>
      </thead>
      <tbody>
        ${filteredData
          .map(
            (item, i) => `
            <tr>
              <td style="text-align:center;">${i + 1}</td>
              <td style="text-align:left;">${item.month}</td>
              <td>${item.ownTripIncome}</td>
              <td>${item.vendorTripIncome}</td>
              <td>${item.ownTripCost}</td>
              <td>${item.vendorTripCost}</td>
              <td>${item.purchaseCost}</td>
              <td>${item.salaryExpense}</td>
              <td>${item.officeExpense}</td>
              <td><b>${item.totalExpense}</b></td>
              <td style="color:${item.netProfit >= 0 ? "green" : "red"};">
                <b>${item.netProfit}</b>
              </td>
            </tr>
          `
          )
          .join("")}
        <tr style="font-weight:bold; background:#f5f5f5;">
          <td colspan="2" style="text-align:center;">Total</td>
          <td>${calculateTotal("ownTripIncome")}</td>
          <td>${calculateTotal("vendorTripIncome")}</td>
          <td>${calculateTotal("ownTripCost")}</td>
          <td>${calculateTotal("vendorTripCost")}</td>
          <td>${calculateTotal("purchaseCost")}</td>
          <td>${calculateTotal("salaryExpense")}</td>
          <td>${calculateTotal("officeExpense")}</td>
          <td>${calculateTotal("totalExpense")}</td>
          <td style="color:${calculateTotal("netProfit") >= 0 ? "green" : "red"};">
            ${calculateTotal("netProfit")}
          </td>
        </tr>
      </tbody>
    </table>
  `;

  const printWindow = window.open("", "", "width=900,height=650");
  printWindow.document.write(`
    <html>
      <head>
        <title>Monthly Statement</title>
        <style>
          body { font-family: Arial, sans-serif; padding:20px; }
          h2 { text-align:center; color:#11375B; margin-bottom:20px; }
          table { width:100%; border-collapse:collapse; }
          th, td { border:1px solid #ddd; padding:6px; }
          th { background:#11375B; color:white; }
          tr:nth-child(even) { background:#fafafa; }
        </style>
      </head>
      <body>
        <h2>Monthly Profit/Loss Statement</h2>
        ${tableHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

    // pagination
  const [currentPage, setCurrentPage] = useState([1])
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  // Calculate totals
  const calculateTotal = (key) => {
    return filteredData.reduce((sum, item) => sum + (item[key] || 0), 0);
  };

  return (
    <div className="md:p-2">
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <SlCalender className="text-lg" />
          Monthly Profit/loss Statement
        </h2>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <FaFilter /> Filter
        </button>
      </div>

      {/* Filter Section */}
      {showFilter && (
        <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
          <div className="relative w-full">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
            >
              <option value="">All Months</option>
              {availableMonths.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => {
                setSelectedMonth("");
                setCurrentPage(1);
              }}
              className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              Clear 
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
        >
          <FaFileExcel /> Excel
        </button>
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
        >
          <FaFilePdf /> PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 py-2 px-5 no-print hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
        >
          <FaPrint /> Print
        </button>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading data...</p>
      ) : currentItems.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No data available for selected filter</p>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200 print-table">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-primary text-white capitalize text-xs">
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Month</th>
                  <th className="p-2 border">Own Trip Income</th>
                  <th className="p-2 border">Vendor Trip Income</th>
                  <th className="p-2 border">Own Trip Cost</th>
                  <th className="p-2 border">Vendor Trip Cost</th>
                  <th className="p-2 border">Purchase Cost</th>
                  <th className="p-2 border">Salary Expense</th>
                  <th className="p-2 border">Office Expense</th>
                  <th className="p-2 border">Total Expense</th>
                  <th className="p-2 border">Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-400 text-center">{item.id}</td>
                    <td className="p-2 border border-gray-400">{item.month}</td>
                    <td className="p-2 border border-gray-400 text-right">{item.ownTripIncome}</td>
                    <td className="p-2 border border-gray-400 text-right">{item.vendorTripIncome}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.ownTripCost}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.vendorTripCost}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.purchaseCost}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.salaryExpense}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.officeExpense}</td>
                    <td className="p-2 border border-gray-400 text-right  font-semibold">
                      {item.totalExpense}
                    </td>
                    <td className={`p-2 border border-gray-400 text-right font-semibold ${
                      item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.netProfit}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="font-semibold">
                  <td className="p-2 border border-gray-400 text-center" colSpan={2}>Total</td>
                  <td className="p-2 border border-gray-400 text-right">{calculateTotal('ownTripIncome')}</td>
                  <td className="p-2 border border-gray-400 text-right">{calculateTotal('vendorTripIncome')}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('ownTripCost')}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('vendorTripCost')}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('purchaseCost')}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('salaryExpense')}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('officeExpense')}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('totalExpense')}</td>
                  <td className={`p-2 border border-gray-400 text-right ${
                    calculateTotal('netProfit') >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculateTotal('netProfit')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

            {/* pagination */}
               {currentItems.length > 0 && totalPages >= 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          maxVisible={8} 
        />
      )}
        </>
      )}
    </div>
    </div>
  );
};

export default MonthlyStatement;