
import axios from "axios";
import { useEffect, useState } from "react";
import { MdOutlineArrowDropDown } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilter } from "react-icons/fa";
import { tableFormatDate } from "../../components/Shared/formatDate";

const DriverLedger = () => {
  const [driver, setDriver] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverList, setDriverList] = useState([]);
  // Driver selection state
  const [selectedDriver, setSelectedDriver] = useState("");
  const [driverOpeningBalances, setDriverOpeningBalances] = useState({});
  const openingBalance = selectedDriver
    ? driverOpeningBalances[selectedDriver] || 0
    : 0;
  const TADA_RATE = 0;

  // helper states
  const [helpers, setHelpers] = useState([]);
  const [selectedHelper, setSelectedHelper] = useState("");

  useEffect(() => {
    // Fetch helpers data
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/helper/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          // Store helpers data directly, assuming salary is part of each helper object
          setHelpers(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching helpers:", error);
      });
  }, []);

  // driver data fetch
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((res) => {
        if (res.data.status === "Success") {
          const drivers = res.data.data;
          setDriverList(drivers);
          // Store opening balances by driver name
          const openingBalances = {};
          drivers.forEach((driver) => {
            openingBalances[driver.driver_name] =
              Number(driver.opening_balance) || 0;
          });
          setDriverOpeningBalances(openingBalances);
        }
      })
      .catch((err) => console.error("Error fetching driver list:", err));
  }, []);

  // Month filter state
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // Fetch driver ledger data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/driverLedger/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setDriver(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  const driverNames = [...new Set(driver.map((d) => d.driver_name))];

  // Get unique months from data for dropdown
  // const availableMonths = [
  //   ...new Set(
  //     driver.map((item) => {
  //       const date = new Date(item.date);
  //       return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
  //         2,
  //         "0"
  //       )}`;
  //     })
  //   ),
  // ].sort();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const availableMonths = [
    ...new Set(
      driver.map((item) => {
        const date = new Date(item.date);
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`; // Month Name + Year
      })
    )
  ].sort((a, b) => {
    // Sort by actual date
    const [monthA, yearA] = a.split(" ");
    const [monthB, yearB] = b.split(" ");
    const dateA = new Date(`${monthA} 1, ${yearA}`);
    const dateB = new Date(`${monthB} 1, ${yearB}`);
    return dateA - dateB;
  });

  // helper function
  // const toNumber = (val) => {
  //   if (val === null || val === undefined) return 0;
  //   if (typeof val === "string") {
  //     if (val.trim().toLowerCase() === "null" || val.trim() === "") return 0;
  //   }
  //   const num = Number(val);
  //   return isNaN(num) ? 0 : num;
  // };
 const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "string") {
    const cleaned = value.trim();
    if (cleaned === "" || cleaned.toLowerCase() === "null" || cleaned === "undefined") {
      return 0;
    }
    const num = Number(cleaned);
    return isNaN(num) ? 0 : num;
  }
  if (typeof value === "number") return value;
  return 0;
};


  // Filter by driver and month
  const filteredDriver = driver.filter((d) => {
    const matchesDriver = selectedDriver
      ? d.driver_name === selectedDriver
      : true;
    const matchesMonth = selectedMonth
      ? `${monthNames[new Date(d.date).getMonth()]} ${new Date(d.date).getFullYear()}` === selectedMonth
      : true;
    return matchesDriver && matchesMonth;
  });

  // Calculate TADA (300 BDT per day) for each unique date per driver
  const calculateTADA = () => {
    const tadaData = {};
    filteredDriver.forEach((item) => {
      if (!tadaData[item.driver_name]) {
        tadaData[item.driver_name] = new Set();
      }
      // Extract just the date part (YYYY-MM-DD) without time
      const dateOnly = item.date.split("T")[0];
      tadaData[item.driver_name].add(dateOnly);
    });
    const result = {};
    Object.keys(tadaData).forEach((driver) => {
      result[driver] = {
        days: tadaData[driver].size,
        amount: tadaData[driver].size * TADA_RATE,
      };
    });
    return result;
  };
  const tadaAmounts = calculateTADA();

  // Calculate running balance and totals (without TADA)
  let runningBalance = openingBalance;
  const rowsWithBalance = filteredDriver.map((item) => {
    const {
      labor = 0,
      parking_cost = 0,
      night_guard = 0,
      toll_cost = 0,
      feri_cost = 0,
      police_cost = 0,
      chada = 0,
      callan_cost = 0,
      others_cost = 0,
      additional_cost=0,
      additional_unload_charge=0,
      food_cost=0,
      fuel_cost = 0,
      driver_adv = 0,
    } = item;
    const totalExpense =
      toNumber(labor) +
      toNumber(parking_cost) +
      toNumber(night_guard) +
      toNumber(toll_cost) +
      toNumber(feri_cost) +
      toNumber(police_cost) +
      toNumber(chada) +
      toNumber(callan_cost) +
      toNumber(others_cost) +
      toNumber(additional_cost)+
      toNumber(additional_unload_charge)+
      toNumber(food_cost)+
      toNumber(fuel_cost);
    runningBalance += Number(driver_adv) - totalExpense;
    console.log("Row Debug:", item.driver_name, item.fuel_cost, item.food_cost, item.additional_cost, item.callan_cost);

    return {
      ...item,
      totalExpense,
      balance: runningBalance,
    };
  });

  // Calculate totals (without TADA)
  const calculateFooterTotals = () => {
    return rowsWithBalance.reduce(
      (acc, item) => {
        acc.commission += toNumber(item.driver_commission || 0);
        acc.advance += toNumber(item.driver_adv || 0);
        acc.totalExpense += item.totalExpense;
        acc.balance = item.balance; // Last balance will be the final balance
        return acc;
      },
      {
        commission: 0,
        advance: 0,
        totalExpense: 0,
        balance: openingBalance,
      }
    );
  };
  const footerTotals = calculateFooterTotals();

  const currentHelperSalary = selectedHelper
    ? helpers.find((h) => h.helper_name === selectedHelper)?.salary || 0
    : 0;

  // Calculate final balance including TADA, commission, and helper salary
  const getFinalBalance = () => {
    let balance = footerTotals.balance;
    if (selectedDriver && tadaAmounts[selectedDriver]) {
      balance -= tadaAmounts[selectedDriver].amount;
    }
    // Deduct driver commission
    balance -= footerTotals.commission;
    // Deduct helper salary if a helper is selected
    if (selectedHelper) {
      balance -= toNumber(currentHelperSalary); // Use currentHelperSalary
    }
    return balance;
  };
  const finalBalance = getFinalBalance();

  // Excel export
  const exportDriversToExcel = () => {
    const dataToExport = rowsWithBalance.map((item) => ({
      Date: item.date,
      Driver: item.driver_name,
      Load: item.load_point,
      Unload: item.unload_point,
      Commission: toNumber(item.driver_commission),
      Advance: toNumber(item.driver_adv),
      Labor: toNumber(item.labor),
      Parking: toNumber(item.parking_cost),
      Night: toNumber(item.night_guard),
      Toll: toNumber(item.toll_cost),
      Ferry: toNumber(item.feri_cost),
      Police: toNumber(item.police_cost),
      Chada: toNumber(item.chada),
      Fuel: toNumber(item.fuel_cost),
      Callan: toNumber(item.callan_cost),
      Others: toNumber(item.others_cost),
      Total_Expense: toNumber(item.totalExpense),
      Balance: toNumber(item.balance),
    }));

    // Add TADA row if a specific driver is selected
    if (selectedDriver && tadaAmounts[selectedDriver]) {
      dataToExport.push({
        Date: "TADA Total",
        Driver: selectedDriver,
        Load: "",
        Unload: "",
        Commission: "",
        Advance: "",
        Labor: "",
        Parking: "",
        Night: "",
        Toll: "",
        Ferry: "",
        Police: "",
        Chada: "",
        Fuel: "",
        Callan: "",
        Others: "",
        Total_Expense: tadaAmounts[selectedDriver].amount,
        Balance: finalBalance,
      });
    }

    // Add Helper Salary row if a specific helper is selected and salary is entered
    if (selectedHelper && currentHelperSalary > 0) { // Use currentHelperSalary
      dataToExport.push({
        Date: "Helper Salary",
        Driver: selectedHelper,
        Load: "",
        Unload: "",
        Commission: "",
        Advance: "",
        Labor: "",
        Parking: "",
        Night: "",
        Toll: "",
        Ferry: "",
        Police: "",
        Chada: "",
        Fuel: "",
        Callan: "",
        Others: "",
        Total_Expense: currentHelperSalary, // Use currentHelperSalary
        Balance: finalBalance,
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Driver Ledger");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(
      data,
      `Driver_Ledger_${selectedDriver || "All"}_${selectedMonth || "All"}.xlsx`
    );
  };

  // PDF export
  const exportDriversToPDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "SL.",
      "Date",
      "Driver",
      "Load",
      "Unload",
      "Commission",
      "Advance",
      "Labor",
      "Parking",
      "Night",
      "Toll",
      "Ferry",
      "Police",
      "Chada",
      "Fuel",
      "Callan",
      "Others",
      "Total Expense",
      "Balance",
    ];
    let pdfRows = [];
    rowsWithBalance.forEach((item, index) => {
      pdfRows.push([
        index + 1,
        item.date || "",
        item.driver_name || "",
        item.load_point || "",
        item.unload_point || "",
        item.driver_commission || "0",
        item.driver_adv || "0",
        item.labor || "0",
        item.parking_cost || "0",
        item.night_guard || "0",
        item.toll_cost || "0",
        item.feri_cost || "0",
        item.police_cost || "0",
        item.chada || "0",
        item.fuel_cost || "0",
        item.callan_cost || "0",
        item.others_cost || "0",
        item.totalExpense || "0",
        item.balance < 0 ? `(${Math.abs(item.balance)})` : item.balance,
      ]);
    });

    // Add TADA row if a specific driver is selected
    if (selectedDriver && tadaAmounts[selectedDriver]) {
      pdfRows.push([
        "",
        "TADA Total",
        selectedDriver,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        tadaAmounts[selectedDriver].amount,
        finalBalance < 0 ? `(${Math.abs(finalBalance)})` : finalBalance,
      ]);
    }

    // Add Helper Salary row if a specific helper is selected and salary is entered
    if (selectedHelper && currentHelperSalary > 0) { // Use currentHelperSalary
      pdfRows.push([
        "",
        "Helper Salary",
        selectedHelper,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        currentHelperSalary, // Use currentHelperSalary
        finalBalance < 0 ? `(${Math.abs(finalBalance)})` : finalBalance,
      ]);
    }

    autoTable(doc, {
      head: [tableColumn],
      body: pdfRows,
      startY: 20,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: [255, 255, 255],
        halign: "left",
      },
      bodyStyles: {
        textColor: [17, 55, 91],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      theme: "grid",
    });
    doc.save(
      `Driver_Ledger_${selectedDriver || "All"}_${selectedMonth || "All"}.pdf`
    );
  };

  // Print function
  const printDriversTable = () => {
    const content = document.getElementById("driver-ledger-table").innerHTML;
    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Driver Ledger</title>
          <style>
            table, th, td {
              border: 1px solid black;
              border-collapse: collapse;
            }
            th, td {
              padding: 4px;
              font-size: 12px;
            }
            table {
              width: 100%;
            }
            .tada-row {
              font-weight: bold;
              background-color: #f0f0f0;
            }
            .text-red-500 {
              color: #ef4444; /* Tailwind's red-500 */
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <p className="text-center mt-16">Loading Driver...</p>;

  return (
    <div className="md:p-2">
      <div className="border border-gray-200 md:p-4 rounded-xl">
        <div className="overflow-hidden overflow-x-auto max-w-5xl mx-auto">
          {/* Header */}
          <div className="md:flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-[#11375B] capitalize flex items-center gap-3">
              Driver ledger : {selectedDriver || "All Drivers"}{" "}
              {selectedMonth && `(${selectedMonth})`}
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
          {/* Export and Driver Dropdown */}
          <div className="md:flex items-center justify-between mb-4">
            <div className="flex gap-1 md:gap-3 flex-wrap font-semibold text-primary">
              <button
                onClick={exportDriversToExcel}
                className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
              >
                Excel
              </button>
              <button
                onClick={exportDriversToPDF}
                className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
              >
                PDF
              </button>
              <button
                onClick={printDriversTable}
                className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
              >
                Print
              </button>
            </div>
          </div>
          {/* Month Filter Section */}
          {showFilter && (
            <div className="flex flex-col md:flex-row gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
              <div className="w-full">
                <div className="relative w-full">
                  <label className="text-primary text-sm font-semibold">
                    Select Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
                  >
                    <option value="">All Months</option>
                    {availableMonths.map((month, idx) => (
                      <option key={idx} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Driver dropdown */}
              <div className="w-full">
                <div className="relative w-full">
                  <label className="text-primary text-sm font-semibold">
                    Select Driver
                  </label>
                  {/* <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
                >
                  <option value="">All Drivers</option>
                  {driverNames.map((name, idx) => (
                    <option key={idx} value={name}>
                      {name}
                    </option>
                  ))}
                </select> */}
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
                  >
                    <option value="">All Drivers</option>
                    {driverList.map((driver, idx) => (
                      <option key={idx} value={driver.driver_name}>
                        {driver.driver_name}
                      </option>
                    ))}
                  </select>

                  <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
                </div>
              </div>
              {/* Helper dropdown */}
              <div className="w-full">
                <div className="relative w-full">
                  <label className="text-primary text-sm font-semibold">
                    Select Helper
                  </label>
                  <select
                    value={selectedHelper}
                    onChange={(e) => setSelectedHelper(e.target.value)}
                    className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
                  >
                    <option value="">All Helper</option>
                    {helpers.map((helper, idx) => (
                      <option key={idx} value={helper.helper_name}>
                        {helper.helper_name}
                      </option>
                    ))}
                  </select>
                  <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
                </div>
              </div>
              <div className="w-xs mt-7">
                <button
                  onClick={() => {
                    setSelectedDriver("");
                    setSelectedHelper("");
                    setSelectedMonth("");
                    setShowFilter(false);
                  }}
                  className="w-full bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
          {/* TADA Summary */}
          {selectedDriver && tadaAmounts[selectedDriver] && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <h3 className="font-semibold text-primary">
                TADA Summary for {selectedDriver}
              </h3>
              <p>Total Days Present: {tadaAmounts[selectedDriver].days}</p>
              <p>
                Total TADA Amount: {tadaAmounts[selectedDriver].amount} BDT ({TADA_RATE}
                BDT per day)
              </p>
            </div>
          )}
          {/* Table with scroll */}
          <div id="driver-ledger-table" className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-900">
              <thead>
                <tr>
                  <th rowSpan="2" className="border px-2 py-1">
                    Date
                  </th>
                  <th colSpan="3" className="border py-1">
                    Particulars
                  </th>
                  <th rowSpan="2" className="border px-2 py-1">
                    Advance
                  </th>
                  <th colSpan="15" className="border px-2 py-1">
                    Expense
                  </th>
                  <th rowSpan="2" className="border py-1">
                    <p className="border-b">
                      Opening Balance:{" "}
                      {selectedDriver
                        ? driverOpeningBalances[selectedDriver] || 0
                        : 0}
                    </p>
                    Balance
                  </th>
                </tr>
                <tr>
                  <th className="border px-2 py-1">Load</th>
                  <th className="border px-2 py-1">Unload</th>
                  <th className="border px-2 py-1">Commission</th>
                  <th className="border px-2 py-1">Labor</th>
                  <th className="border px-2 py-1">Parking</th>
                  <th className="border px-2 py-1">Night</th>
                  <th className="border px-2 py-1">Toll</th>
                  <th className="border px-2 py-1">Ferry</th>
                  <th className="border px-2 py-1">Police</th>
                  <th className="border px-2 py-1">Chada</th>
                  <th className="border px-2 py-1">Fuel</th>
                  <th className="border px-2 py-1">Food</th>
                  <th className="border px-2 py-1">Add.LoadCost</th>
                  <th className="border px-2 py-1">Add.UnloadCost</th>
                  <th className="border px-2 py-1">Callan</th>
                  <th className="border px-2 py-1">Depo Cost</th>
                  <th className="border px-2 py-1">Others</th>
                  <th className="border px-2 py-1">Total</th>
                </tr>
              </thead>
              <tbody className="overflow-x-auto">
                {rowsWithBalance.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-2 py-1">{tableFormatDate(item.date)}</td>
                    <td className="border px-2 py-1">{item.load_point}</td>
                    <td className="border px-2 py-1">{item.unload_point}</td>
                    <td className="border px-2 py-1">{toNumber(item.driver_commission)}</td>
                    <td className="border px-2 py-1">{toNumber(item.driver_adv)}</td>
                    <td className="border px-2 py-1">{toNumber(item.labor)}</td>
                    <td className="border px-2 py-1">{toNumber(item.parking_cost)}</td>
                    <td className="border px-2 py-1">{toNumber(item.night_guard)}</td>
                    <td className="border px-2 py-1">{toNumber(item.toll_cost)}</td>
                    <td className="border px-2 py-1">{toNumber(item.feri_cost)}</td>
                    <td className="border px-2 py-1">{toNumber(item.police_cost)}</td>
                    <td className="border px-2 py-1">{toNumber(item.chada)}</td>
                    <td className="border px-2 py-1">{toNumber(item.fuel_cost)}</td>
                    <td className="border px-2 py-1">{toNumber(item.food_cost)}</td>
                    <td className="border px-2 py-1">{toNumber(item.additional_cost)}</td>
                    <td className="border px-2 py-1">{toNumber(item.additional_unload_charge)}</td>
                    <td className="border px-2 py-1">{toNumber(item.callan_cost)}</td>
                    <td className="border px-2 py-1">{toNumber(item.depo_cost)}</td>
                    <td className="border px-2 py-1">{toNumber(item.others_cost)}</td>
                    <td className="border px-2 py-1">{toNumber(item.totalExpense)}</td>
                    <td className="border px-2 py-1">
                      <span className={item.balance < 0 ? "text-red-500" : ""}>
                        {item.balance < 0
                          ? `(${Math.abs(item.balance)})`
                          : item.balance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-100">
                  <td colSpan={3} className="border px-2 py-1 text-right">
                    Total:
                  </td>
                  <td className="border px-2 py-1">{footerTotals.commission}</td>
                  <td className="border px-2 py-1">{footerTotals.advance}</td>
                  <td colSpan={13} className="border px-2 py-1"></td>
                  <td className="border px-2 py-1">
                    {footerTotals.totalExpense}
                  </td>
                  <td className="border px-2 py-1">
                    <span className={footerTotals.balance < 0 ? "text-red-500" : ""}>
                      {footerTotals.balance < 0
                        ? `(${Math.abs(footerTotals.balance)})`
                        : footerTotals.balance}
                    </span>
                  </td>
                </tr>
                {/* TADA Calculation in Footer */}
                {selectedDriver && tadaAmounts[selectedDriver] && (
                  <>
                    <tr className="font-bold bg-gray-100">
                      <td colSpan={21} className="border px-2 py-1">
                        <div className="flex justify-between">
                          <span>Balance:</span>
                          <span className={footerTotals.balance < 0 ? "text-red-500" : ""}>
                            {footerTotals.balance < 0
                              ? `(${Math.abs(footerTotals.balance)})`
                              : footerTotals.balance}{" "}
                            BDT
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr className="font-bold bg-gray-100">
                      <td colSpan={21} className="border px-2 py-1">
                        <div className="flex justify-between">
                          <span>TADA Calculation:</span>
                          <span>
                            {tadaAmounts[selectedDriver].days} days × {TADA_RATE} ={" "}
                            {tadaAmounts[selectedDriver].amount} BDT
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr className="font-bold bg-gray-100">
                      <td colSpan={21} className="border px-2 py-1">
                        <div className="flex justify-between">
                          <span>Driver Commission:</span>
                          <span>{footerTotals.commission} BDT</span>
                        </div>
                      </td>
                    </tr>
                    {/* Helper Salary Row */}
                    {selectedHelper && (
                      <tr className="font-bold bg-gray-100">
                        <td colSpan={21} className="border px-2 py-1">
                          <div className="flex justify-between">
                            <span>Helper Salary:</span>
                            <span>{currentHelperSalary} BDT</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr className="font-bold bg-gray-100">
                      <td colSpan={20} className="border px-2 py-1">
                        <div className="flex justify-between">
                          <span>Final Balance (After All Deductions):</span>
                          <span className={finalBalance < 0 ? "text-red-500" : ""}>
                            {finalBalance < 0
                              ? `(${Math.abs(finalBalance)})`
                              : finalBalance}{" "}
                            BDT
                          </span>
                        </div>
                      </td>
                    </tr>
                  </>
                )}
                {/* Final Balance Row when no driver is selected */}
                {!selectedDriver && (
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={7} className="border px-2 py-1 text-right">
                      Final Balance:
                    </td>
                    <td colSpan={14} className="border px-8 py-1 text-right">
                      <span className={footerTotals.balance < 0 ? "text-red-500" : ""}>
                        {footerTotals.balance < 0
                          ? `(${Math.abs(footerTotals.balance)})`
                          : footerTotals.balance}
                      </span>
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverLedger;

