import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { FaFilter, FaFilePdf, FaFileExcel, FaSearch } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import Pagination from "../../components/Shared/Pagination";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { tableFormatDate } from "../../components/Shared/formatDate";
import DatePicker from "react-datepicker";
// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);

export default function FuelReport() {
  const [tripData, setTripData] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const reportRef = useRef();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch trip data
  useEffect(() => {
    fetchTripData();
  }, []);

  const fetchTripData = async () => {
    setLoading(true);
    try {
      const tripRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`);
      setTripData(tripRes.data.data || []);
      generateFuelReport(tripRes.data.data);
    } catch (error) {
      console.error("Error fetching trip data", error);
    }
    setLoading(false);
  };

  // Generate fuel report from trip data
  const generateFuelReport = (trips) => {
    const fuelReport = trips
      .filter(trip => trip.fuel_cost && parseFloat(trip.fuel_cost) > 0)
      .map(trip => ({
        id: trip.id,
        date: trip.date,
        ref_id: trip.ref_id,
        vehicle: trip.vehicle_no || "Unknown",
        driver: trip.driver_name || "N/A",
        customer: trip.customer || "N/A",
        route: `${trip.load_point || ""} to ${trip.unload_point || ""}`,
        fuel_cost: parseFloat(trip.fuel_cost) || 0,
        total_rent: parseFloat(trip.total_rent) || 0,
        fuel_percentage: trip.total_rent > 0
          ? ((parseFloat(trip.fuel_cost) / parseFloat(trip.total_rent)) * 100).toFixed(2)
          : "N/A",
        status: trip.status || "N/A"
      }));

    setReport(fuelReport);
  };

  // Get unique vehicles from trip data
  const getAvailableVehicles = () => {
    const vehicles = new Set();
    tripData.forEach(trip => {
      if (trip.vehicle_no) {
        vehicles.add(trip.vehicle_no);
      }
    });
    return Array.from(vehicles).sort();
  };

  // Filter report by date range, vehicle, and search term
  const filteredReport = report.filter((item) => {
    const dtDate = new Date(item.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return dtDate >= start && dtDate <= end;
    } else if (start) {
      return dtDate.toDateString() === start.toDateString();
    } else {
      return true; // no filter applied
    }

    // Vehicle filter
    if (selectedVehicle && item.vehicle !== selectedVehicle) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.date.toLowerCase().includes(searchLower) ||
        item.vehicle.toLowerCase().includes(searchLower) ||
        item.driver.toLowerCase().includes(searchLower) ||
        item.customer.toLowerCase().includes(searchLower) ||
        item.ref_id.toLowerCase().includes(searchLower) ||
        item.fuel_cost.toString().includes(searchLower)
      );
    }

    return true;
  });

  // Calculate totals for footer
  const totals = filteredReport.reduce((acc, item) => {
    return {
      totalFuelCost: acc.totalFuelCost + item.fuel_cost,
      totalRent: acc.totalRent + item.total_rent
    };
  }, { totalFuelCost: 0, totalRent: 0 });

  // Clear all filters
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedVehicle("");
    setSearchTerm("");
    setCurrentPage(1);
    setShowFilter(false);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReport.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReport.length / itemsPerPage);

  // Handle PDF export
  const handlePdfExport = () => {
    const doc = new jsPDF();
    const title = "Fuel Cost Report from Trips";

    doc.setFontSize(16);
    doc.text(title, 14, 15);

    if (startDate || endDate) {
      doc.setFontSize(10);
      const dateRangeText = `Date Range: ${startDate || ''} ${endDate ? ' to ' + endDate : ''}`;
      doc.text(dateRangeText, 14, 22);
    }

    const headers = [
      ["Date", "Ref ID", "Vehicle", "Driver", "Customer", "Route", "Fuel Cost", "Total Rent", "Fuel %"]
    ];

    const data = filteredReport.map(item => [
      item.date,
      item.ref_id,
      item.vehicle,
      item.driver,
      item.customer,
      item.route,
      item.fuel_cost.toFixed(2),
      item.total_rent.toFixed(2),
      item.fuel_percentage + '%'
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
      headStyles: { fillColor: [17, 55, 91], textColor: 255, fontStyle: 'bold' },
      foot: [
        ['', '', '', '', '', 'Total:', totals.totalFuelCost.toFixed(2), totals.totalRent.toFixed(2), '']
      ],
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
    });

    doc.save('fuel_trip_report.pdf');
  };
  // Handle Excel export
  const handleExcelExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Headers
    csvContent += "Date,Ref ID,Vehicle,Driver,Customer,Route,Fuel Cost,Total Rent,Fuel %\n";

    // Data
    filteredReport.forEach(item => {
      csvContent += `${item.date},${item.ref_id},${item.vehicle},${item.driver},${item.customer},"${item.route}",${item.fuel_cost.toFixed(2)},${item.total_rent.toFixed(2)},${item.fuel_percentage}%\n`;
    });

    // Add totals row
    csvContent += `,,,,,Total,${totals.totalFuelCost.toFixed(2)},${totals.totalRent.toFixed(2)},\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fuel_trip_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple print function
  const handlePrint = () => {
    // Generate table rows for all filtered data
    const rowsHtml = filteredReport.map(item => `
    <tr>
      <td style="border:1px solid #ddd;padding:6px;text-align:center">${item.date}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:center">${item.ref_id}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:center">${item.vehicle}</td>
      <td style="border:1px solid #ddd;padding:6px">${item.driver}</td>
      <td style="border:1px solid #ddd;padding:6px">${item.customer}</td>
      <td style="border:1px solid #ddd;padding:6px">${item.route}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:right">${item.fuel_cost.toFixed(2)}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:right">${item.total_rent.toFixed(2)}</td>
    </tr>
  `).join("");

    // Totals row
    const totalsRow = `
    <tr style="font-weight:bold;background:#f0f0f0">
      <td colspan="6" style="border:1px solid #ddd;padding:6px;text-align:right">Total:</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:right">${totals.totalFuelCost.toFixed(2)}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:right">${totals.totalRent.toFixed(2)}</td>
    </tr>
  `;

    const html = `
    <table style="width:100%;border-collapse:collapse">
      <thead style="background:#11375B;color:white">
        <tr>
          <th style="border:1px solid #ddd;padding:6px">Date</th>
          <th style="border:1px solid #ddd;padding:6px">Ref ID</th>
          <th style="border:1px solid #ddd;padding:6px">Vehicle</th>
          <th style="border:1px solid #ddd;padding:6px">Driver</th>
          <th style="border:1px solid #ddd;padding:6px">Customer</th>
          <th style="border:1px solid #ddd;padding:6px">Route</th>
          <th style="border:1px solid #ddd;padding:6px">Fuel Cost</th>
          <th style="border:1px solid #ddd;padding:6px">Total Rent</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        ${totalsRow}
      </tfoot>
    </table>
  `;

    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
    <html>
      <head>
        <title>Fuel Trip Report</title>
      </head>
      <body>
        <h2>Fuel Trip Report</h2>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        ${html}
      </body>
    </html>
  `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };


  return (
    <div className="md:p-2">
      <div
        ref={reportRef}
        className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-8 border border-gray-200"
      >
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            Fuel Cost Report from Trips
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter(prev => !prev)}
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {/* Export and Search */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={handleExcelExport}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={handlePdfExport}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <FaFilePdf /> PDF
            </button>
            <button
              onClick={handlePrint}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              Print
            </button>
          </div>

          <div className="mt-3 md:mt-0 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md outline-none text-sm py-2 pl-10 pr-5 w-full md:w-64"
            />
          </div>
          {/*  Clear button */}
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-9 top-[6.7rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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

            <div className="flex-1 min-w-0">
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label> */}
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className=" w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              >
                <option value="">All Vehicles</option>
                {getAvailableVehicles().map(vehicle => (
                  <option key={vehicle} value={vehicle}>{vehicle}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="bg-primary text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FiFilter />Clear
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#11375B]"></div>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div id="fuelReport" className="mt-5 overflow-x-auto rounded-xl">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-primary text-white capitalize text-xs">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Driver</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Fuel Cost</th>
                  <th className="p-3">Total Rent</th>
                  {/* <th className="p-3">Fuel %</th> */}
                </tr>
              </thead>
              <tbody className="text-primary">
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-all border border-gray-200">
                      <td className="p-3">{tableFormatDate(item.date)}</td>
                      <td className="p-3">{item.ref_id}</td>
                      <td className="p-3">{item.vehicle}</td>
                      <td className="p-3">{item.driver}</td>
                      <td className="p-3">{item.customer}</td>
                      <td className="p-3">{item.route}</td>
                      <td className="p-3">{item.fuel_cost}</td>
                      <td className="p-3">{item.total_rent}</td>
                      {/* <td className="p-3">{item.fuel_percentage}%</td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-gray-500">
                      No fuel cost data found in trips
                    </td>
                  </tr>
                )}
              </tbody>
              {/* Footer with totals */}
              {filteredReport.length > 0 && (
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td colSpan={6} className="p-3 text-right">Total:</td>
                    <td className="p-3">{totals.totalFuelCost}</td>
                    <td className="p-3">{totals.totalRent}</td>
                    {/* <td className="p-3"></td> */}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* Pagination */}
        {currentItems.length > 0 && totalPages >= 1 && (
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
}