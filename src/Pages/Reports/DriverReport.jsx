
// import { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   FaFileExcel,
//   FaFilePdf,
//   FaFilter,
//   FaPrint,
//   FaUser,
// } from "react-icons/fa6";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { GrFormNext, GrFormPrevious } from "react-icons/gr";
// import { FiFilter } from "react-icons/fi";
// import Pagination from "../../components/Shared/Pagination";

// const DriverReport = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [trips, setTrips] = useState([]);
//   const [selectedDriver, setSelectedDriver] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [showFilter, setShowFilter] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // Clear all filters
//   const clearFilters = () => {
//     setSelectedDriver("");
//     setSelectedMonth("");
//     setCurrentPage(1);
//   };

//   // Fetch drivers and trips data
//   useEffect(() => {
//     setLoading(true);
//     const fetchDrivers = axios.get(
//       `${import.meta.env.VITE_BASE_URL}/api/driver/list`
//     );
//     const fetchTrips = axios.get(
//       `${import.meta.env.VITE_BASE_URL}/api/trip/list`
//     );

//     Promise.all([fetchDrivers, fetchTrips])
//       .then(([driverRes, tripRes]) => {
//         setDrivers(driverRes?.data?.data ?? []);
//         setTrips(tripRes?.data?.data ?? []);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch data", err);
//         setDrivers([]);
//         setTrips([]);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   // Reset pagination when filter changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedMonth, selectedDriver]);

//   // Get unique months from trips data
//   const getAvailableMonths = () => {
//     if (!Array.isArray(trips)) return [];
    
//     const monthSet = new Set();
//     trips.forEach(trip => {
//       if (trip.date) {
//         const date = new Date(trip.date);
//         const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//         monthSet.add(monthYear);
//       }
//     });
    
//     return Array.from(monthSet).sort().map(month => {
//       const [year, monthNum] = month.split('-');
//       const date = new Date(year, monthNum - 1);
//       return {
//         value: month,
//         label: date.toLocaleString('default', { month: 'short', year: 'numeric' })
//       };
//     });
//   };

//   const availableMonths = getAvailableMonths();

//   // Filter trips by month and driver
//   const tripsFiltered = Array.isArray(trips)
//     ? trips.filter((t) => {
//         if (!t.date) return false;
        
//         const tripDate = new Date(t.date);
//         const tripMonth = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`;
        
//         // const driverMatch = !selectedDriver || t.driver_name === selectedDriver;
//         const driverMatch =
//   !selectedDriver ||
//   t.driver_name?.trim().toLowerCase() === selectedDriver.trim().toLowerCase();
//         const monthMatch = !selectedMonth || tripMonth === selectedMonth;
        
//         return driverMatch && monthMatch;
//       })
//     : [];

//   // Process driver statistics by month
//   const getMonthlyDriverStats = () => {
//     if (!Array.isArray(drivers) || !Array.isArray(tripsFiltered)) return [];

//     const monthlyStats = [];

//     // Group trips by driver and month
//     const tripsByDriverAndMonth = tripsFiltered.reduce((acc, trip) => {
//       if (!trip.driver_name) return acc;
      
//       const tripDate = new Date(trip.date);
//       const monthYear = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`;
//       const monthName = tripDate.toLocaleString('default', { month: 'short', year: 'numeric' });

//       if (!acc[trip.driver_name]) {
//         acc[trip.driver_name] = {};
//       }

//       if (!acc[trip.driver_name][monthYear]) {
//         acc[trip.driver_name][monthYear] = {
//           month: monthName,
//           trips: [],
//           totalRent: 0,
//           totalExp: 0
//         };
//       }

//       acc[trip.driver_name][monthYear].trips.push(trip);
//       acc[trip.driver_name][monthYear].totalRent += Number(trip.total_rent || 0);
//       acc[trip.driver_name][monthYear].totalExp += Number(trip.total_exp || 0);

//       return acc;
//     }, {});

//     // Create monthly stats for each driver
//     drivers.forEach(driver => {
//       if (tripsByDriverAndMonth[driver.driver_name]) {
//         Object.entries(tripsByDriverAndMonth[driver.driver_name]).forEach(([monthKey, monthData]) => {
//           monthlyStats.push({
//             name: driver.driver_name,
//             mobile: driver.driver_mobile,
//             month: monthData.month,
//             monthKey,
//             totalTrips: monthData.trips.length,
//             totalRent: monthData.totalRent,
//             totalExp: monthData.totalExp,
//             totalProfit: monthData.totalRent - monthData.totalExp
//           });
//         });
//       }
//     });

//     // Sort by driver name and month
//     return monthlyStats.sort((a, b) => {
//       if (a.name === b.name) {
//         return a.monthKey.localeCompare(b.monthKey);
//       }
//       return a.name.localeCompare(b.name);
//     });
//   };

//   const monthlyDriverStats = getMonthlyDriverStats();

//   // Export to Excel
//   const exportExcel = () => {
//     const data = monthlyDriverStats.map((d, i) => ({
//       SL: i + 1,
//       Month: d.month,
//       Driver: d.name,
//       Mobile: d.mobile,
//       Trips: d.totalTrips,
//       Rent: d.totalRent,
//       Expense: d.totalExp,
//       Profit: d.totalProfit,
//     }));
//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "DriverMonthlyReport");
//     XLSX.writeFile(wb, "Driver_Monthly_Report.xlsx");
//   };

//   // Export to PDF
//   const exportPDF = () => {
//     const doc = new jsPDF("landscape");
//     const head = [
//       ["SL", "Month", "Driver", "Mobile", "Trips", "Rent", "Expense", "Profit"],
//     ];
//     const body = monthlyDriverStats.map((d, i) => [
//       i + 1,
//       d.month,
//       d.name,
//       d.mobile,
//       d.totalTrips,
//       d.totalRent,
//       d.totalExp,
//       d.totalProfit,
//     ]);
//     autoTable(doc, { head, body, theme: "grid" });
//     doc.save("Driver_Monthly_Report.pdf");
//   };

//   // Print
//   // Print full filtered report
// const printReport = () => {
//   // Generate table rows for all filtered data
//   const bodyRows = monthlyDriverStats.map((d, i) => `
//     <tr>
//       <td style="border:1px solid #ccc;padding:6px;text-align:center">${i + 1}</td>
//       <td style="border:1px solid #ccc;padding:6px;text-align:center">${d.month}</td>
//       <td style="border:1px solid #ccc;padding:6px">${d.name}</td>
//       <td style="border:1px solid #ccc;padding:6px">${d.mobile}</td>
//       <td style="border:1px solid #ccc;padding:6px;text-align:center">${d.totalTrips}</td>
//       <td style="border:1px solid #ccc;padding:6px;text-align:right">${d.totalRent}</td>
//       <td style="border:1px solid #ccc;padding:6px;text-align:right">${d.totalExp}</td>
//       <td style="border:1px solid #ccc;padding:6px;text-align:right;color:${d.totalProfit >= 0 ? 'green':'red'}">${d.totalProfit}</td>
//     </tr>
//   `).join("");

//   const totalRow = `
//     <tr style="font-weight:bold;background:#f0f0f0">
//       <td colspan="4" style="border:1px solid #ccc;padding:6px;text-align:right">Total:</td>
//       <td style="border:1px solid #ccc;padding:6px;text-align:center">${totalTrips}</td>
//       <td style="border:1px solid #ccc;padding:6px;text-align:right">${totalRent}</td>
//       <td style="border:1px solid #ccc;padding:6px;text-align:right">${totalExp}</td>
//       <td style="border:1px solid #ccc;padding:6px;text-align:right;color:${totalProfit >= 0 ? 'green':'red'}">${totalProfit}</td>
//     </tr>
//   `;

//   const html = `
//     <table style="width:100%;border-collapse:collapse">
//       <thead style="background:#11375B;color:white">
//         <tr>
//           <th style="border:1px solid #ccc;padding:6px">SL</th>
//           <th style="border:1px solid #ccc;padding:6px">Month</th>
//           <th style="border:1px solid #ccc;padding:6px">Driver</th>
//           <th style="border:1px solid #ccc;padding:6px">Mobile</th>
//           <th style="border:1px solid #ccc;padding:6px">Trips</th>
//           <th style="border:1px solid #ccc;padding:6px">Income</th>
//           <th style="border:1px solid #ccc;padding:6px">Expense</th>
//           <th style="border:1px solid #ccc;padding:6px">Profit</th>
//         </tr>
//       </thead>
//       <tbody>
//         ${bodyRows}
//       </tbody>
//       <tfoot>
//         ${totalRow}
//       </tfoot>
//     </table>
//   `;

//   const w = window.open("", "", "width=900,height=650");
//   w.document.write(`<html><head><title>Driver Monthly Report</title></head><body><h3>Driver Monthly Report</h3>${html}</body></html>`);
//   w.document.close();
//   w.print();
//   w.close();
// };

//   // Grand Totals
// const totalTrips = monthlyDriverStats.reduce((sum, d) => sum + d.totalTrips, 0);
// const totalRent = monthlyDriverStats.reduce((sum, d) => sum + d.totalRent, 0);
// const totalExp = monthlyDriverStats.reduce((sum, d) => sum + d.totalExp, 0);
// const totalProfit = monthlyDriverStats.reduce((sum, d) => sum + d.totalProfit, 0);

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentDriverReport = monthlyDriverStats.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(monthlyDriverStats.length / itemsPerPage);

//   // Loading state
//   if (loading)
//     return (
//       <div>
//         <div className="text-center py-10 text-gray-500">
//           <div className="flex justify-center items-center gap-2">
//             <div className="w-5 h-5 border-2 border-primary border-t-transparent animate-spin rounded-full" />
//             Loading Driver report...
//           </div>
//         </div>
//       </div>
//     );

//   return (
//     <div className="md:p-2">
//       <div className="p-4 max-w-7xl mx-auto bg-white shadow rounded-lg border border-gray-200">
//         <h2 className="text-xl font-bold text-primary flex items-center gap-2">
//           <FaUser className="text-lg" />
//           Driver Monthly Performance Report
//         </h2>

//         {/* Buttons */}
//         <div className="flex items-center justify-between my-6">
//           <div className="flex flex-wrap md:flex-row gap-3">
//             <button
//               onClick={exportExcel}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaFileExcel />
//               Excel
//             </button>
//             <button
//               onClick={exportPDF}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaFilePdf />
//               PDF
//             </button>
//             <button
//               onClick={printReport}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaPrint />
//               Print
//             </button>
//           </div>
//           <div className="flex gap-3">
            
//             <button
//               onClick={() => setShowFilter((prev) => !prev)}
//               className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//               >
//               <FaFilter /> Filter
//             </button>
//           </div>
//         </div>

//         {/* Filter UI */}
//         {showFilter && (
//           <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//             <div className="relative w-full">
//               <label className="block mb-1 text-sm font-medium">Driver</label>
//               <select
//                 value={selectedDriver}
//                 onChange={(e) => setSelectedDriver(e.target.value)}
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               >
//                 <option value="">All Drivers</option>
//                 {drivers.map((driver) => (
//                   <option key={driver.driver_name} value={driver.driver_name}>
//                     {driver.driver_name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="relative w-full">
//               <label className="block mb-1 text-sm font-medium">Month</label>
//               <select
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               >
//                 <option value="">All Months</option>
//                 {availableMonths.map((month) => (
//                   <option key={month.value} value={month.value}>
//                     {month.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               {(selectedDriver || selectedMonth) && (
//               <button
//                 onClick={clearFilters}
//                 className="mt-7 border border-red-500 text-red-500 px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//               >
//                 <FiFilter/> Clear
//               </button>
//             )}
//             </div>
//           </div>
//         )}

//         {/* Report Table */}
//         <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
//           <table id="driver-report" className="min-w-full text-sm text-left">
//             <thead className="bg-[#11375B] text-white capitalize text-xs">
//               <tr>
//                 <th className="px-2 py-3">SL</th>
//                 <th className="px-2 py-3">Month</th>
//                 <th className="px-2 py-3">Driver</th>
//                 <th className="px-2 py-3">Mobile</th>
//                 <th className="px-2 py-3">Trips</th>
//                 <th className="px-2 py-3">Income</th>
//                 <th className="px-2 py-3">Expense</th>
//                 <th className="px-2 py-3">Profit</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentDriverReport.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="8"
//                     className="text-center py-10 text-gray-500 italic"
//                   >
//                     <div className="flex flex-col items-center">
//                       <svg
//                         className="w-12 h-12 text-gray-300 mb-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                         />
//                       </svg>
//                       No report data found.
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 currentDriverReport.map((d, i) => (
//                   <tr key={`${d.name}-${d.monthKey}`} className="hover:bg-gray-50">
//                     <td className="px-2 py-3">{i + 1 + indexOfFirstItem}</td>
//                     <td className="px-2 py-3">{d.month}</td>
//                     <td className="px-2 py-3">{d.name}</td>
//                     <td className="px-2 py-3">{d.mobile}</td>
//                     <td className="px-2 py-3">{d.totalTrips}</td>
//                     <td className="px-2 py-3">{d.totalRent}</td>
//                     <td className="px-2 py-3">{d.totalExp}</td>
//                     <td>{d.totalProfit}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//             {/* Total Row */}
//   {currentDriverReport.length > 0 && (
//     <tfoot className="bg-gray-100 font-bold">
//       <tr>
//         <td colSpan="4" className="text-right px-4 py-3">Total:</td>
//         <td className="px-4 py-3">{totalTrips}</td>
//         <td className="px-4 py-3">{totalRent}</td>
//         <td className="px-4 py-3">{totalExp}</td>
//         <td className={`px-4 py-3 ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
//           {totalProfit}
//         </td>
//       </tr>
//     </tfoot>
//   )}
//           </table>
//         </div>

//         {/* Pagination */}
//         {currentDriverReport.length > 0 && totalPages >= 1 && (
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={(page) => setCurrentPage(page)}
//           maxVisible={8} 
//         />
//       )}
//       </div>
//     </div>
//   );
// };

// export default DriverReport;

// import { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   FaFileExcel,
//   FaFilePdf,
//   FaFilter,
//   FaPrint,
//   FaUser,
// } from "react-icons/fa6";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { FiFilter } from "react-icons/fi";
// import Pagination from "../../components/Shared/Pagination";

// const DriverReport = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [trips, setTrips] = useState([]);
//   const [selectedDriver, setSelectedDriver] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [showFilter, setShowFilter] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // Clear all filters
//   const clearFilters = () => {
//     setSelectedDriver("");
//     setSelectedMonth("");
//     setCurrentPage(1);
//   };

//   // Fetch drivers and trips data
//   useEffect(() => {
//     setLoading(true);
//     const fetchDrivers = axios.get(
//       `${import.meta.env.VITE_BASE_URL}/api/driver/list`
//     );
//     const fetchTrips = axios.get(
//       `${import.meta.env.VITE_BASE_URL}/api/trip/list`
//     );

//     Promise.all([fetchDrivers, fetchTrips])
//       .then(([driverRes, tripRes]) => {
//         setDrivers(driverRes?.data?.data ?? []);
//         setTrips(tripRes?.data?.data ?? []);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch data", err);
//         setDrivers([]);
//         setTrips([]);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   // Reset pagination when filter changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedMonth, selectedDriver]);

//   // Get unique months from trips data
//   const getAvailableMonths = () => {
//     if (!Array.isArray(trips)) return [];
    
//     const monthSet = new Set();
//     trips.forEach(trip => {
//       if (trip.date) {
//         const date = new Date(trip.date);
//         const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//         monthSet.add(monthYear);
//       }
//     });
    
//     return Array.from(monthSet).sort().map(month => {
//       const [year, monthNum] = month.split('-');
//       const date = new Date(year, monthNum - 1);
//       return {
//         value: month,
//         label: date.toLocaleString('default', { month: 'short', year: 'numeric' })
//       };
//     });
//   };

//   const availableMonths = getAvailableMonths();

//   // Filter trips by month and driver
//   const tripsFiltered = Array.isArray(trips)
//     ? trips.filter((t) => {
//         if (!t.date) return false;
        
//         const tripDate = new Date(t.date);
//         const tripMonth = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`;
        
//         // Improved driver matching to handle name variations
//         let driverMatch = true;
//         if (selectedDriver) {
//           const selectedDriverObj = drivers.find(d => 
//             d.driver_name?.trim().toLowerCase() === selectedDriver.trim().toLowerCase()
//           );
          
//           if (selectedDriverObj) {
//             // Match by driver name or mobile number
//             driverMatch = 
//               t.driver_name?.trim().toLowerCase() === selectedDriver.trim().toLowerCase() ||
//               t.driver_mobile === selectedDriverObj.driver_mobile;
//           }
//         }
        
//         const monthMatch = !selectedMonth || tripMonth === selectedMonth;
        
//         return driverMatch && monthMatch;
//       })
//     : [];

//   // Process driver statistics by month - FIXED VERSION
//   const getMonthlyDriverStats = () => {
//     if (!Array.isArray(drivers) || !Array.isArray(tripsFiltered)) return [];

//     const monthlyStats = [];

//     // Create a map to track driver mobile numbers for better matching
//     const driverMobileMap = {};
//     drivers.forEach(driver => {
//       if (driver.driver_name && driver.driver_mobile) {
//         driverMobileMap[driver.driver_name.trim().toLowerCase()] = driver.driver_mobile;
//       }
//     });

//     // Group trips by driver and month
//     const tripsByDriverAndMonth = tripsFiltered.reduce((acc, trip) => {
//       if (!trip.driver_name) return acc;
      
//       const tripDate = new Date(trip.date);
//       const monthYear = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`;
//       const monthName = tripDate.toLocaleString('default', { month: 'short', year: 'numeric' });

//       // Use a consistent key for the driver (name + mobile if available)
//       let driverKey = trip.driver_name.trim().toLowerCase();
      
//       // Try to find the mobile number from our driver list for this driver
//       const driverMobile = driverMobileMap[driverKey] || trip.driver_mobile || "N/A";
      
//       // Include mobile in the key to distinguish drivers with same name
//       driverKey = `${driverKey}_${driverMobile}`;

//       if (!acc[driverKey]) {
//         acc[driverKey] = {};
//       }

//       if (!acc[driverKey][monthYear]) {
//         acc[driverKey][monthYear] = {
//           month: monthName,
//           driverName: trip.driver_name,
//           driverMobile: driverMobile,
//           trips: [],
//           totalRent: 0,
//           totalExp: 0
//         };
//       }

//       acc[driverKey][monthYear].trips.push(trip);
//       acc[driverKey][monthYear].totalRent += Number(trip.total_rent || 0);
//       acc[driverKey][monthYear].totalExp += Number(trip.total_exp || 0);

//       return acc;
//     }, {});

//     // Create monthly stats for each driver
//     Object.entries(tripsByDriverAndMonth).forEach(([driverKey, monthlyData]) => {
//       Object.entries(monthlyData).forEach(([monthKey, monthData]) => {
//         monthlyStats.push({
//           name: monthData.driverName,
//           mobile: monthData.driverMobile,
//           month: monthData.month,
//           monthKey,
//           totalTrips: monthData.trips.length,
//           totalRent: monthData.totalRent,
//           totalExp: monthData.totalExp,
//           totalProfit: monthData.totalRent - monthData.totalExp
//         });
//       });
//     });

//     // Sort by driver name and month
//     return monthlyStats.sort((a, b) => {
//       if (a.name === b.name) {
//         return a.monthKey.localeCompare(b.monthKey);
//       }
//       return a.name.localeCompare(b.name);
//     });
//   };

//   const monthlyDriverStats = getMonthlyDriverStats();

//   // Export to Excel
//   const exportExcel = () => {
//     const data = monthlyDriverStats.map((d, i) => ({
//       SL: i + 1,
//       Month: d.month,
//       Driver: d.name,
//       Mobile: d.mobile,
//       Trips: d.totalTrips,
//       Rent: d.totalRent,
//       Expense: d.totalExp,
//       Profit: d.totalProfit,
//     }));
//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "DriverMonthlyReport");
//     XLSX.writeFile(wb, "Driver_Monthly_Report.xlsx");
//   };

//   // Export to PDF
//   const exportPDF = () => {
//     const doc = new jsPDF("landscape");
//     const head = [
//       ["SL", "Month", "Driver", "Mobile", "Trips", "Rent", "Expense", "Profit"],
//     ];
//     const body = monthlyDriverStats.map((d, i) => [
//       i + 1,
//       d.month,
//       d.name,
//       d.mobile,
//       d.totalTrips,
//       d.totalRent,
//       d.totalExp,
//       d.totalProfit,
//     ]);
//     autoTable(doc, { head, body, theme: "grid" });
//     doc.save("Driver_Monthly_Report.pdf");
//   };

//   // Print full filtered report
//   const printReport = () => {
//     // Generate table rows for all filtered data
//     const bodyRows = monthlyDriverStats.map((d, i) => `
//       <tr>
//         <td style="border:1px solid #ccc;padding:6px;text-align:center">${i + 1}</td>
//         <td style="border:1px solid #ccc;padding:6px;text-align:center">${d.month}</td>
//         <td style="border:1px solid #ccc;padding:6px">${d.name}</td>
//         <td style="border:1px solid #ccc;padding:6px">${d.mobile}</td>
//         <td style="border:1px solid #ccc;padding:6px;text-align:center">${d.totalTrips}</td>
//         <td style="border:1px solid #ccc;padding:6px;text-align:right">${d.totalRent}</td>
//         <td style="border:1px solid #ccc;padding:6px;text-align:right">${d.totalExp}</td>
//         <td style="border:1px solid #ccc;padding:6px;text-align:right;color:${d.totalProfit >= 0 ? 'green':'red'}">${d.totalProfit}</td>
//       </tr>
//     `).join("");

//     // Calculate totals
//     const totalTrips = monthlyDriverStats.reduce((sum, d) => sum + d.totalTrips, 0);
//     const totalRent = monthlyDriverStats.reduce((sum, d) => sum + d.totalRent, 0);
//     const totalExp = monthlyDriverStats.reduce((sum, d) => sum + d.totalExp, 0);
//     const totalProfit = monthlyDriverStats.reduce((sum, d) => sum + d.totalProfit, 0);

//     const totalRow = `
//       <tr style="font-weight:bold;background:#f0f0f0">
//         <td colspan="4" style="border:1px solid #ccc;padding:6px;text-align:right">Total:</td>
//         <td style="border:1px solid #ccc;padding:6px;text-align:center">${totalTrips}</td>
//         <td style="border:1px solid #ccc;padding:6px;text-align:right">${totalRent}</td>
//         <td style="border:1px solid #ccc;padding:6px;text-align:right">${totalExp}</td>
//         <td style="border:1px solid #ccc;padding:6px;text-align:right;color:${totalProfit >= 0 ? 'green':'red'}">${totalProfit}</td>
//       </tr>
//     `;

//     const html = `
//       <table style="width:100%;border-collapse:collapse">
//         <thead style="background:#11375B;color:white">
//           <tr>
//             <th style="border:1px solid #ccc;padding:6px">SL</th>
//             <th style="border:1px solid #ccc;padding:6px">Month</th>
//             <th style="border:1px solid #ccc;padding:6px">Driver</th>
//             <th style="border:1px solid #ccc;padding:6px">Mobile</th>
//             <th style="border:1px solid #ccc;padding:6px">Trips</th>
//             <th style="border:1px solid #ccc;padding:6px">Income</th>
//             <th style="border:1px solid #ccc;padding:6px">Expense</th>
//             <th style="border:1px solid #ccc;padding:6px">Profit</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${bodyRows}
//         </tbody>
//         <tfoot>
//           ${totalRow}
//         </tfoot>
//       </table>
//     `;

//     const w = window.open("", "", "width=900,height=650");
//     w.document.write(`<html><head><title>Driver Monthly Report</title></head><body><h3>Driver Monthly Report</h3>${html}</body></html>`);
//     w.document.close();
//     w.print();
//     w.close();
//   };

//   // Grand Totals
//   const totalTrips = monthlyDriverStats.reduce((sum, d) => sum + d.totalTrips, 0);
//   const totalRent = monthlyDriverStats.reduce((sum, d) => sum + d.totalRent, 0);
//   const totalExp = monthlyDriverStats.reduce((sum, d) => sum + d.totalExp, 0);
//   const totalProfit = monthlyDriverStats.reduce((sum, d) => sum + d.totalProfit, 0);

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentDriverReport = monthlyDriverStats.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(monthlyDriverStats.length / itemsPerPage);

//   // Loading state
//   if (loading)
//     return (
//       <div>
//         <div className="text-center py-10 text-gray-500">
//           <div className="flex justify-center items-center gap-2">
//             <div className="w-5 h-5 border-2 border-primary border-t-transparent animate-spin rounded-full" />
//             Loading Driver report...
//           </div>
//         </div>
//       </div>
//     );

//   return (
//     <div className="md:p-2">
//       <div className="p-4 max-w-7xl mx-auto bg-white shadow rounded-lg border border-gray-200">
//         <h2 className="text-xl font-bold text-primary flex items-center gap-2">
//           <FaUser className="text-lg" />
//           Driver Monthly Performance Report
//         </h2>

//         {/* Buttons */}
//         <div className="flex items-center justify-between my-6">
//           <div className="flex flex-wrap md:flex-row gap-3">
//             <button
//               onClick={exportExcel}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaFileExcel />
//               Excel
//             </button>
//             <button
//               onClick={exportPDF}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaFilePdf />
//               PDF
//             </button>
//             <button
//               onClick={printReport}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaPrint />
//               Print
//             </button>
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={() => setShowFilter((prev) => !prev)}
//               className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaFilter /> Filter
//             </button>
//           </div>
//         </div>

//         {/* Filter UI */}
//         {showFilter && (
//           <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//             <div className="relative w-full">
//               <label className="block mb-1 text-sm font-medium">Driver</label>
//               <select
//                 value={selectedDriver}
//                 onChange={(e) => setSelectedDriver(e.target.value)}
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               >
//                 <option value="">All Drivers</option>
//                 {drivers.map((driver) => (
//                   <option key={driver.driver_name} value={driver.driver_name}>
//                     {driver.driver_name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="relative w-full">
//               <label className="block mb-1 text-sm font-medium">Month</label>
//               <select
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               >
//                 <option value="">All Months</option>
//                 {availableMonths.map((month) => (
//                   <option key={month.value} value={month.value}>
//                     {month.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               {(selectedDriver || selectedMonth) && (
//                 <button
//                   onClick={clearFilters}
//                   className="mt-7 border border-red-500 text-red-500 px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//                 >
//                   <FiFilter/> Clear
//                 </button>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Report Table */}
//         <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
//           <table id="driver-report" className="min-w-full text-sm text-left">
//             <thead className="bg-[#11375B] text-white capitalize text-xs">
//               <tr>
//                 <th className="px-2 py-3">SL</th>
//                 <th className="px-2 py-3">Month</th>
//                 <th className="px-2 py-3">Driver</th>
//                 <th className="px-2 py-3">Mobile</th>
//                 <th className="px-2 py-3">Trips</th>
//                 <th className="px-2 py-3">Income</th>
//                 <th className="px-2 py-3">Expense</th>
//                 <th className="px-2 py-3">Profit</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentDriverReport.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="8"
//                     className="text-center py-10 text-gray-500 italic"
//                   >
//                     <div className="flex flex-col items-center">
//                       <svg
//                         className="w-12 h-12 text-gray-300 mb-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                         />
//                       </svg>
//                       No report data found.
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 currentDriverReport.map((d, i) => (
//                   <tr key={`${d.name}-${d.monthKey}`} className="hover:bg-gray-50">
//                     <td className="px-2 py-3">{i + 1 + indexOfFirstItem}</td>
//                     <td className="px-2 py-3">{d.month}</td>
//                     <td className="px-2 py-3">{d.name}</td>
//                     <td className="px-2 py-3">{d.mobile}</td>
//                     <td className="px-2 py-3">{d.totalTrips}</td>
//                     <td className="px-2 py-3">{d.totalRent}</td>
//                     <td className="px-2 py-3">{d.totalExp}</td>
//                     <td className={d.totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
//                       {d.totalProfit}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//             {/* Total Row */}
//             {currentDriverReport.length > 0 && (
//               <tfoot className="bg-gray-100 font-bold">
//                 <tr>
//                   <td colSpan="4" className="text-right px-4 py-3">Total:</td>
//                   <td className="px-4 py-3">{totalTrips}</td>
//                   <td className="px-4 py-3">{totalRent}</td>
//                   <td className="px-4 py-3">{totalExp}</td>
//                   <td className={`px-4 py-3 ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
//                     {totalProfit}
//                   </td>
//                 </tr>
//               </tfoot>
//             )}
//           </table>
//         </div>

//         {/* Pagination */}
//         {currentDriverReport.length > 0 && totalPages >= 1 && (
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={(page) => setCurrentPage(page)}
//             maxVisible={8} 
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default DriverReport;

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaPrint,
  FaUser,
} from "react-icons/fa6";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiFilter } from "react-icons/fi";
import Pagination from "../../components/Shared/Pagination";
import toNumber from "../../hooks/toNumber";

const DriverReport = () => {
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Clear all filters
  const clearFilters = () => {
    setSelectedDriver("");
    setSelectedMonth("");
    setCurrentPage(1);
  };

  // Fetch drivers and trips data
  useEffect(() => {
    setLoading(true);
    const fetchDrivers = axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/driver/list`
    );
    const fetchTrips = axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/trip/list`
    );

    Promise.all([fetchDrivers, fetchTrips])
      .then(([driverRes, tripRes]) => {
        setDrivers(driverRes?.data?.data ?? []);
        setTrips(tripRes?.data?.data ?? []);
      })
      .catch((err) => {
        console.error("Failed to fetch data", err);
        setDrivers([]);
        setTrips([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedDriver]);

  // Get unique months from trips data
  const getAvailableMonths = () => {
    if (!Array.isArray(trips)) return [];
    
    const monthSet = new Set();
    trips.forEach(trip => {
      if (trip.date && trip.transport_type === "own_transport") {
        const date = new Date(trip.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthSet.add(monthYear);
      }
    });
    
    return Array.from(monthSet).sort().map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(year, monthNum - 1);
      return {
        value: month,
        label: date.toLocaleString('default', { month: 'short', year: 'numeric' })
      };
    });
  };

  const availableMonths = getAvailableMonths();

  // Filter trips by month, driver, and only include own transport trips with valid drivers
  const tripsFiltered = Array.isArray(trips)
    ? trips.filter((t) => {
        if (!t.date || t.transport_type !== "own_transport") return false;
        
        const tripDate = new Date(t.date);
        const tripMonth = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`;
        
        // Check if driver exists in driver list
        const driverExists = drivers.some(driver => 
          driver.driver_name?.trim().toLowerCase() === t.driver_name?.trim().toLowerCase()
        );
        
        if (!driverExists) return false;
        
        const driverMatch = !selectedDriver || 
          t.driver_name?.trim().toLowerCase() === selectedDriver.trim().toLowerCase();
        
        const monthMatch = !selectedMonth || tripMonth === selectedMonth;
        
        return driverMatch && monthMatch;
      })
    : [];

  // Process driver statistics by month - FIXED VERSION
  const getMonthlyDriverStats = () => {
    if (!Array.isArray(drivers) || !Array.isArray(tripsFiltered)) return [];

    const monthlyStats = [];

    // Create a map of driver names for quick lookup
    const driverMap = {};
    drivers.forEach(driver => {
      if (driver.driver_name) {
        driverMap[driver.driver_name.trim().toLowerCase()] = {
          name: driver.driver_name,
          mobile: driver.driver_mobile
        };
      }
    });

    // Group trips by driver and month
    const tripsByDriverAndMonth = tripsFiltered.reduce((acc, trip) => {
      if (!trip.driver_name) return acc;
      
      const driverKey = trip.driver_name.trim().toLowerCase();
      
      // Only process if driver exists in our driver list
      if (!driverMap[driverKey]) return acc;
      
      const tripDate = new Date(trip.date);
      const monthYear = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = tripDate.toLocaleString('default', { month: 'short', year: 'numeric' });

      if (!acc[driverKey]) {
        acc[driverKey] = {};
      }

      if (!acc[driverKey][monthYear]) {
        acc[driverKey][monthYear] = {
          month: monthName,
          driverName: driverMap[driverKey].name,
          driverMobile: driverMap[driverKey].mobile,
          trips: [],
          totalRent: 0,
          totalExp: 0
        };
      }

      acc[driverKey][monthYear].trips.push(trip);
      acc[driverKey][monthYear].totalRent += Number(trip.total_rent || 0);
      acc[driverKey][monthYear].totalExp += Number(trip.total_exp || 0);

      return acc;
    }, {});

    // Create monthly stats for each driver
    Object.entries(tripsByDriverAndMonth).forEach(([driverKey, monthlyData]) => {
      Object.entries(monthlyData).forEach(([monthKey, monthData]) => {
        monthlyStats.push({
          name: monthData.driverName,
          mobile: monthData.driverMobile,
          month: monthData.month,
          monthKey,
          totalTrips: monthData.trips.length,
          totalRent: monthData.totalRent,
          totalExp: monthData.totalExp,
          totalProfit: monthData.totalRent - monthData.totalExp
        });
      });
    });

    // Sort by driver name and month
    return monthlyStats.sort((a, b) => {
      if (a.name === b.name) {
        return a.monthKey.localeCompare(b.monthKey);
      }
      return a.name.localeCompare(b.name);
    });
  };

  const monthlyDriverStats = getMonthlyDriverStats();

  // Export to Excel
  const exportExcel = () => {
    const data = monthlyDriverStats.map((d, i) => ({
      SL: i + 1,
      Month: d.month,
      Driver: d.name,
      Mobile: d.mobile,
      Trips: toNumber(d.totalTrips),
      Rent: toNumber(d.totalRent),
      Expense: toNumber(d.totalExp),
      Profit: toNumber(d.totalProfit),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DriverMonthlyReport");
    XLSX.writeFile(wb, "Driver_Monthly_Report.xlsx");
  };

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    const head = [
      ["SL", "Month", "Driver", "Mobile", "Trips", "Rent", "Expense", "Profit"],
    ];
    const body = monthlyDriverStats.map((d, i) => [
      i + 1,
      d.month,
      d.name,
      d.mobile,
      d.totalTrips,
      d.totalRent,
      d.totalExp,
      d.totalProfit,
    ]);
    autoTable(doc, { head, body, theme: "grid" });
    doc.save("Driver_Monthly_Report.pdf");
  };

  // Print full filtered report
  const printReport = () => {
    // Generate table rows for all filtered data
    const bodyRows = monthlyDriverStats.map((d, i) => `
      <tr>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${i + 1}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${d.month}</td>
        <td style="border:1px solid #ccc;padding:6px">${d.name}</td>
        <td style="border:1px solid #ccc;padding:6px">${d.mobile}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${toNumber(d.totalTrips)}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:right">${toNumber(d.totalRent)}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:right">${toNumber(d.totalExp)}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:right;color:${d.totalProfit >= 0 ? 'green':'red'}">${d.totalProfit}</td>
      </tr>
    `).join("");

    // Calculate totals
    const totalTrips = monthlyDriverStats.reduce((sum, d) => sum + toNumber(d.totalTrips), 0);
    const totalRent = monthlyDriverStats.reduce((sum, d) => sum + toNumber(d.totalRent), 0);
    const totalExp = monthlyDriverStats.reduce((sum, d) => sum + toNumber(d.totalExp), 0);
    const totalProfit = monthlyDriverStats.reduce((sum, d) => sum + toNumber(d.totalProfit), 0);

    const totalRow = `
      <tr style="font-weight:bold;background:#f0f0f0">
        <td colspan="4" style="border:1px solid #ccc;padding:6px;text-align:right">Total:</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${toNumber(totalTrips)}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:right">${toNumber(totalRent)}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:right">${totalExp}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:right;color:${totalProfit >= 0 ? 'green':'red'}">${totalProfit}</td>
      </tr>
    `;

    const html = `
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#11375B;color:white">
          <tr>
            <th style="border:1px solid #ccc;padding:6px">SL</th>
            <th style="border:1px solid #ccc;padding:6px">Month</th>
            <th style="border:1px solid #ccc;padding:6px">Driver</th>
            <th style="border:1px solid #ccc;padding:6px">Mobile</th>
            <th style="border:1px solid #ccc;padding:6px">Trips</th>
            <th style="border:1px solid #ccc;padding:6px">Income</th>
            <th style="border:1px solid #ccc;padding:6px">Expense</th>
            <th style="border:1px solid #ccc;padding:6px">Profit</th>
          </tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
        <tfoot>
          ${totalRow}
        </tfoot>
      </table>
    `;

    const w = window.open("", "", "width=900,height=650");
    w.document.write(`<html><head><title>Driver Monthly Report</title></head><body><h3>Driver Monthly Report</h3>${html}</body></html>`);
    w.document.close();
    w.print();
    w.close();
  };

  // Grand Totals
  const totalTrips = monthlyDriverStats.reduce((sum, d) => sum + toNumber(d.totalTrips), 0);
  const totalRent = monthlyDriverStats.reduce((sum, d) => sum + toNumber(d.totalRent), 0);
  const totalExp = monthlyDriverStats.reduce((sum, d) => sum + toNumber(d.totalExp), 0);
  const totalProfit = monthlyDriverStats.reduce((sum, d) => sum + toNumber(d.totalProfit), 0);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDriverReport = monthlyDriverStats.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(monthlyDriverStats.length / itemsPerPage);

  // Loading state
  if (loading)
    return (
      <div>
        <div className="text-center py-10 text-gray-500">
          <div className="flex justify-center items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent animate-spin rounded-full" />
            Loading Driver report...
          </div>
        </div>
      </div>
    );

  return (
    <div className="md:p-2">
      <div className="p-4 max-w-7xl mx-auto bg-white shadow rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <FaUser className="text-lg" />
          Driver Monthly Performance Report
        </h2>

        {/* Buttons */}
        <div className="flex items-center justify-between my-6">
          <div className="flex flex-wrap md:flex-row gap-3">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel />
              Excel
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf />
              PDF
            </button>
            <button
              onClick={printReport}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint />
              Print
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {/* Filter UI */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="relative w-full">
              <label className="block mb-1 text-sm font-medium">Driver</label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              >
                <option value="">All Drivers</option>
                {drivers.map((driver) => (
                  <option key={driver.driver_name} value={driver.driver_name}>
                    {driver.driver_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full">
              <label className="block mb-1 text-sm font-medium">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              >
                <option value="">All Months</option>
                {availableMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              {(selectedDriver || selectedMonth) && (
                <button
                  onClick={clearFilters}
                  className="mt-7 border border-red-500 text-red-500 px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <FiFilter/> Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Report Table */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table id="driver-report" className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-xs">
              <tr>
                <th className="px-2 py-3">SL</th>
                <th className="px-2 py-3">Month</th>
                <th className="px-2 py-3">Driver</th>
                <th className="px-2 py-3">Mobile</th>
                <th className="px-2 py-3">Trips</th>
                <th className="px-2 py-3">Income</th>
                <th className="px-2 py-3">Expense</th>
                <th className="px-2 py-3">Profit</th>
              </tr>
            </thead>
            <tbody>
              {currentDriverReport.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-10 text-gray-500 italic"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      No report data found.
                    </div>
                  </td>
                </tr>
              ) : (
                currentDriverReport.map((d, i) => (
                  <tr key={`${d.name}-${d.monthKey}`} className="hover:bg-gray-50">
                    <td className="px-2 py-3">{i + 1 + indexOfFirstItem}</td>
                    <td className="px-2 py-3">{d.month}</td>
                    <td className="px-2 py-3">{d.name}</td>
                    <td className="px-2 py-3">{d.mobile}</td>
                    <td className="px-2 py-3">{d.totalTrips}</td>
                    <td className="px-2 py-3">{d.totalRent}</td>
                    <td className="px-2 py-3">{d.totalExp}</td>
                    <td className={d.totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
                      {d.totalProfit}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Total Row */}
            {currentDriverReport.length > 0 && (
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan="4" className="text-right px-4 py-3">Total:</td>
                  <td className="px-4 py-3">{totalTrips}</td>
                  <td className="px-4 py-3">{totalRent}</td>
                  <td className="px-4 py-3">{totalExp}</td>
                  <td className={`px-4 py-3 ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {totalProfit}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {currentDriverReport.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8} 
          />
        )}
      </div>
    </div>
  );
};

export default DriverReport;