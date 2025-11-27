import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FaTruck,
  FaPlus,
  FaFilter,
  FaEye,
  FaTrashAlt,
  FaPen,
} from "react-icons/fa";
import { IoIosRemoveCircle, IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../components/Shared/Pagination";
import { tableFormatDate } from "../components/Shared/formatDate";
import DatePicker from "react-datepicker";
import toNumber from "../hooks/toNumber";
import useAdmin from "../hooks/useAdmin";
const TripList = () => {
  const [trip, setTrip] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const isAdmin = useAdmin();
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTripId, setselectedTripId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // get single trip info by id
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTrip, setselectedTrip] = useState(null);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // search
  const [searchTerm, setSearchTerm] = useState("");

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  // Transport type filter
  const [transportType, setTransportType] = useState("");


  useEffect(() => {
    // Fetch customers data
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setCustomers(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
      });
  }, []);

  // Fetch trips data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setTrip(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
        setLoading(false);
      });
  }, []);
  if (loading) return <p className="text-center mt-16">Loading trip...</p>;

  // Excel Export
  const exportTripsToExcel = () => {
    const tableData = filteredTrips.map((dt, index) => ({
      "SL.": index + 1,
      Date: tableFormatDate(dt.date),
      TripId: dt.trip_id,
      Customer: dt.customer || "N/A",
      TransportType: dt.transport_type?.replace("_", " ") || "N/A",
      VehicleNo: dt.vehicle_no || "N/A",
      Driver: dt.driver_name || "N/A",
      Vendor: dt.vendor_name || "N/A",
      TripType: dt.trip_type || "N/A",
      AdditionalLoadPoint: dt.additional_load || "N/A",
      "Trip & Destination": `Load: ${dt.load_point || "N/A"} | Unload: ${dt.unload_point || "N/A"}`,
      TripRent: toNumber(dt.total_rent),
      Demurrage: toNumber(dt.d_total),
      DriverAdvance: toNumber(dt.driver_advance),
      DriverCommission: toNumber(dt.driver_commission),
      FuelCost: toNumber(dt.fuel_cost),
      DepoCost: toNumber(dt.depo_cost),
      LaborCost: toNumber(dt.labor),
      ParkingCost: toNumber(dt.parking_cost),
      FeriCost: toNumber(dt.feri_cost),
      TollCost: toNumber(dt.toll_cost),
      NightGaurd: toNumber(dt.night_guard),
      FoodCost: toNumber(dt.food_cost),
      PoliceCost: toNumber(dt.police_cost),
      ChadaCost: toNumber(dt.chada),
      ChalanCost: toNumber(dt.chalan_cost),
      AdditionalUnloadCharge: toNumber(dt.additional_unload_charge),
      OtherCost: toNumber(dt.other_cost),
      // TripCost: toNumber(dt.total_exp),
      // Profit: (toNumber(dt.total_rent || 0) + toNumber(dt.d_total || 0)) - toNumber(dt.total_exp || 0),
      TripCost: toNumber(dt.total_exp || 0) + toNumber(dt.v_d_total || 0),
Profit: (toNumber(dt.total_rent || 0) + toNumber(dt.d_total || 0)) - (toNumber(dt.total_exp || 0) + toNumber(dt.v_d_total || 0)),
    }));

    // 👉 Total Row Calculation
    // -------------------------
    const totalRow = {
      "SL.": "",
      Date: "",
      TripId: "",
      Customer: "",
      TransportType: "",
      VehicleNo: "",
      Driver: "",
      Vendor: "",
      TripType: "TOTAL",
      AdditionalLoadPoint: "",
      "Trip & Destination": "",

      TripRent: tableData.reduce((sum, row) => sum + row.TripRent, 0),
      Demurrage: tableData.reduce((sum, row) => sum + row.Demurrage, 0),
      DriverAdvance: tableData.reduce((sum, row) => sum + row.DriverAdvance, 0),
      DriverCommission: tableData.reduce((sum, row) => sum + row.DriverCommission, 0),
      FuelCost: tableData.reduce((sum, row) => sum + row.FuelCost, 0),
      DepoCost: tableData.reduce((sum, row) => sum + row.DepoCost, 0),
      LaborCost: tableData.reduce((sum, row) => sum + row.LaborCost, 0),
      ParkingCost: tableData.reduce((sum, row) => sum + row.ParkingCost, 0),
      FeriCost: tableData.reduce((sum, row) => sum + row.FeriCost, 0),
      TollCost: tableData.reduce((sum, row) => sum + row.TollCost, 0),
      NightGaurd: tableData.reduce((sum, row) => sum + row.NightGaurd, 0),
      FoodCost: tableData.reduce((sum, row) => sum + row.FoodCost, 0),
      PoliceCost: tableData.reduce((sum, row) => sum + row.PoliceCost, 0),
      ChadaCost: tableData.reduce((sum, row) => sum + row.ChadaCost, 0),
      ChalanCost: tableData.reduce((sum, row) => sum + row.ChalanCost, 0),
      AdditionalUnloadCharge: tableData.reduce((sum, row) => sum + row.AdditionalUnloadCharge, 0),
      OtherCost: tableData.reduce((sum, row) => sum + row.OtherCost, 0),
      TripCost: tableData.reduce((sum, row) => sum + row.TripCost, 0),
      Profit: tableData.reduce((sum, row) => sum + row.Profit, 0),
      
    };

    // 👉 add TOTAL row to sheet
    tableData.push(totalRow);

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "trip_report.xlsx");
  };

  // PDF Export
  const exportTripsToPDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.",
      "Date",
      "TripId",
      "Customer",
      "TransportType",
      "VehicleNo",
      "Vendor",
      "Trip & Destination",
      "TripRent",
      "Demurrage",
      "TripCost",
      "Profit",
    ];

    const tableRows = filteredTrips.map((dt, index) => [
      index + 1,
      tableFormatDate(dt.date),
      dt.trip_id,
      dt.customer || "N/A",
      dt.transport_type?.replace("_", " ") || "N/A",
      dt.vehicle_no || "N/A",
      dt.vendor_name || "N/A",
      `Load: ${dt.load_point || "N/A"} | Unload: ${dt.unload_point || "N/A"}`,
      toNumber(dt.total_rent) || 0,
      toNumber(dt.d_total) || 0,
      (toNumber(dt.total_exp) || 0) + (toNumber(dt.v_d_total) || 0),
      (toNumber(dt.total_rent || 0) + toNumber(dt.d_total || 0)) - (toNumber(dt.total_exp || 0) + toNumber(dt.v_d_total) || 0),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [17, 55, 91], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      theme: "grid",
    });

    doc.save("trip_report.pdf");
  };

  // Print Function
  const printTripsTable = () => {
    // Generate table HTML from filteredTrips (ignore pagination)
    let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>SL.</th>
          <th>Date</th>
          <th>TripId</th>
          <th>Customer</th>
          <th>TransportType</th>
          <th>VehicleNo</th>
          <th>Vendor</th>
          <th>Trip & Destination</th>
          <th>TripRent</th>
          <th>Demurrage</th>
          <th>TripCost</th>
          <th>Profit</th>
        </tr>
      </thead>
      <tbody>
  `;

    filteredTrips.forEach((dt, index) => {
      const totalProfit = (toNumber(dt.total_rent || 0) + toNumber(dt.d_total || 0)) - (toNumber(dt.total_exp || 0)+ toNumber(dt.v_d_total || 0));
      const tripDestination = `Load: ${dt.load_point || "N/A"} | Unload: ${dt.unload_point || "N/A"}`;

      tableHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${tableFormatDate(dt.date)}</td>
        <td>${dt.trip_id}</td>
        <td>${dt.customer || "N/A"}</td>
        <td>${dt.transport_type?.replace("_", " ") || "N/A"}</td>
        <td>${dt.vehicle_no || "N/A"}</td>
        <td>${dt.vendor_name || "N/A"}</td>
        <td>${tripDestination}</td>
        <td>${dt.total_rent || 0}</td>
        <td>${dt.d_total || 0}</td>
        <td>${toNumber(dt.total_exp || 0) + toNumber(dt.v_d_total ||0)}</td>
        <td>${totalProfit}</td>
      </tr>
    `;
    });

    tableHTML += `</tbody></table>`;

    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          thead { background-color: #11375B; color: black; }
          tbody tr:nth-child(even) { background-color: #f3f4f6; }
        </style>
      </head>
      <body>
        <h3>Trip Report</h3>
        ${tableHTML}
      </body>
    </html>
  `);

    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };


  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/trip/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete driver");
      }
      // Remove trip from local list
      setTrip((prev) => prev.filter((trip) => trip.id !== id));
      toast.success("Trip deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setselectedTripId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  // view trip by id
  const handleView = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/trip/show/${id}`
      );
      if (response.data.status === "Success") {
        setselectedTrip(response.data.data);
        setViewModalOpen(true);
      } else {
        toast.error("Can't get trip details");
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("Can't get trip details");
    }
  };


  // Sort trips by date descending (latest first)
  const sortedTrips = [...trip].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredTrips = sortedTrips.filter((trip) => {
    const tripDate = new Date(trip.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchesDate =
      (start && end && tripDate >= start && tripDate <= end) ||
      (start && tripDate.toDateString() === start.toDateString()) ||
      (!start && !end);

    const matchesCustomer =
      !selectedCustomer || trip.customer?.toLowerCase() === selectedCustomer.toLowerCase();
    const matchesTransportType =
      !transportType || trip.transport_type === transportType;

    return matchesDate && matchesCustomer && matchesTransportType;
  });

  // search
  const filteredTripList = filteredTrips.filter((dt) => {
    const term = searchTerm.toLowerCase();
    return (
      dt.customer?.toLowerCase().includes(term) ||
      dt.trip_id?.toLowerCase().includes(term) ||
      dt.date?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term) ||
      dt.driver_mobile?.toLowerCase().includes(term) ||
      dt.vehicle_no?.toLowerCase().includes(term)
    );
  });


  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrip = filteredTripList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTripList.length / itemsPerPage);

  // Filtered & paginated trips
  const totalTripRent = currentTrip.reduce((sum, dt) => sum + toNumber(dt.total_rent || 0), 0);
  const totalDemurrage = currentTrip.reduce((sum, dt) => sum + toNumber(dt.d_total || 0), 0);
  // const totalTripCost = currentTrip.reduce((sum, dt) => sum + toNumber(dt.total_exp || 0), 0);
  const totalTripCost = (currentTrip || []).reduce(
  (sum, dt) => sum + Number(dt.total_exp || 0) + Number(dt.v_d_total || 0),
  0
);
  const totalProfit = currentTrip.reduce((sum, dt) => {
    const rent = toNumber(dt.total_rent || 0);
    const demurrage = toNumber(dt.d_total || 0);
    const exp = toNumber(dt.total_exp || 0) + toNumber(dt.v_d_total || 0);
    return sum + (rent + demurrage - exp);
  }, 0);

  return (
    <main className=" md:p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto  mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-2 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            Trip Records
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
            <Link to="/tramessy/AddTripForm">
              <button className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Trip
              </button>
            </Link>
          </div>
        </div>
        {/* export and search */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={exportTripsToExcel}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            <button
              onClick={exportTripsToPDF}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              PDF
            </button>
            <button
              onClick={printTripsTable}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-5 top-[5.3rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="flex flex-col md:flex-row items-stretch gap-4 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300">
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
            {/* customer select */}
            <select
              value={selectedCustomer}
              onChange={(e) => {
                setSelectedCustomer(e.target.value)
                setCurrentPage(1);
              }}
              className=" flex-1 min-w-0 p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.customer_name}>
                  {c.customer_name}
                </option>
              ))}
            </select>

            {/* transport select */}
            <select
              value={transportType}
              onChange={(e) => {
                setTransportType(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 min-w-0 p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
            >
              <option value="">All Transport</option>
              <option value="own_transport">Own Transport</option>
              <option value="vendor_transport">Vendor Transport</option>
            </select>

            <div className="md:w-28 flex-shrink-0">
              <button
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setSelectedCustomer("");
                  setTransportType("");
                  setShowFilter(false);
                }}
                className="w-full bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-2 py-2 rounded-md shadow flex items-center justify-center gap-2 transition-all duration-300"
              >
                <IoIosRemoveCircle /> Clear
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary text-white capitalize text-xs">
              <tr>
                <th className="p-2">SL.</th>
                <th className="p-2">Date</th>
                <th className="p-2">TripNo</th>
                <th className="p-2">Customer</th>
                <th className="p-2">TransportType</th>
                <th className="p-2">VehicleNo</th>
                <th className="p-2">Vendor</th>
                <th className="p-2">Trip&Destination</th>
                <th className="p-2">TripRent</th>
                <th className="p-2">C.Demurrage</th>
                <th className="p-2">TripCost</th>
                <th className="p-2">Profit</th>
                <th className="p-2 action_column">Action</th>
              </tr>
            </thead>
            <tbody className="text-primary">
              {
                currentTrip.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center p-4 text-gray-500">
                      No trip found
                    </td>
                  </tr>)
                  : (currentTrip?.map((dt, index) => {
                    const totalRent = toNumber(dt.total_rent || 0);
                    const demurrage = toNumber(dt.d_total || 0);
                    const vendorDemurrage = toNumber(dt.v_d_total || 0);
                    const totalExpenses = toNumber(dt.total_exp || 0) + toNumber(dt.v_d_total || 0);
                    const totalProfit = (totalRent + demurrage) - totalExpenses;
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-all border-b border-gray-300"
                      >
                        <td className="p-2 font-bold">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="p-2">{tableFormatDate(dt?.date)}</td>
                        <td className="p-2">{dt?.trip_id}</td>
                        <td className="p-2">
                          <p>{dt.customer}</p>
                          {/* <p>Mobile: {dt.driver_mobile}</p>
                      <p>Commission: {dt.driver_commission}</p> */}
                        </td>
                        <td className="p-2 capitalize">
                          {dt.transport_type?.replace("_", " ")}
                        </td>
                        <td className="p-2">
                          <p>{dt?.vehicle_no}</p>
                        </td>
                        <td className="p-2">
                          <p>{dt.vendor_name ? dt.vendor_name : "N/A"}</p>
                        </td>
                        <td className="p-2">
                          <p>Load: {dt.load_point}</p>
                          <p>Unload: {dt.unload_point}</p>
                        </td>

                        <td className="p-2">{dt.total_rent}</td>
                        <td className="p-2">{dt.d_total}</td>
                        <td className="p-2">
                          {dt.transport_type === "vendor_transport"
                            ? totalExpenses 
                            : toNumber(dt.total_exp) // own transport: just total_exp
                          }
                        </td>
                        {/* <td className="p-2">
                      {parseFloat(dt.total_rent || 0) -
                        parseFloat(dt.total_exp || 0)}
                    </td> */}
                        <td className="p-2">{totalProfit}</td>
                        <td className="p-2 action_column">
                          <div className="flex gap-1">
                            <Link to={`/tramessy/UpdateTripForm/${dt.id}`}>
                              <button className="text-primary hover:bg-primary hover:text-white px-2 py-2 rounded shadow-md transition-all cursor-pointer">
                                <FaPen className="text-[12px]" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleView(dt.id)}
                              className="text-primary hover:bg-primary hover:text-white px-2 py-2 rounded shadow-md transition-all cursor-pointer"
                            >
                              <FaEye className="text-[12px]" />
                            </button>
                            {isAdmin && <button
                              onClick={() => {
                                setselectedTripId(dt.id);
                                setIsOpen(true);
                              }}
                              className="flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-primary shadow-md rounded"                                >
                              <FaTrashAlt className=" h-4 w-3 text-red-500" />
                            </button>}
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
            </tbody>
            <tfoot className="bg-gray-100 font-bold text-sm">
              <tr>
                <td className="p-2 text-center" colSpan="8">Total</td>
                <td className="p-2">{totalTripRent}</td>
                <td className="p-2">{totalDemurrage}</td>
                <td className="p-2">{totalTripCost}</td>
                <td className="p-2">{totalProfit}</td>
                <td className="p-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* pagination */}
        {currentTrip.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>

      {/* Delete Modal */}
      <div className="flex justify-center items-center">
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-72 max-w-sm border border-gray-300">
              <button
                onClick={toggleModal}
                className="text-2xl absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 cursor-pointer rounded-sm"
              >
                <IoMdClose />
              </button>
              <div className="flex justify-center mb-4 text-red-500 text-4xl">
                <FaTrashAlt />
              </div>
              <p className="text-center text-gray-700 font-medium mb-6">
                Are you sure you want to delete this trip?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedTripId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* get trip information by id */}
      {viewModalOpen && selectedTrip && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#000000ad] z-50 overflow-auto scroll-hidden">
          <div className="w-4xl p-5 bg-gray-100 rounded-xl mt-10">
            <h3 className="text-primary font-semibold">Trip Info</h3>
            <div className="mt-5">
              <ul className="flex border border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Customer</p>{" "}
                  <p>{selectedTrip.customer}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2">
                  <p className="w-48">Trip Date</p> <p>{selectedTrip.date}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Load Point</p>{" "}
                  <p>{selectedTrip.load_point}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2">
                  <p className="w-48">Unload Point</p>{" "}
                  <p>{selectedTrip.unload_point}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Trip type</p> <p>{selectedTrip.trip_type}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Additional Load</p> <p>{selectedTrip.additional_load ? selectedTrip.additional_load : "N/A"}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Driver Name</p>{" "}
                  <p>{selectedTrip.driver_name}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2">
                  <p className="w-48">Driver Mobile</p>{" "}
                  <p>{selectedTrip.driver_mobile ? selectedTrip.driver_mobile : "N/A"}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Driver Advance</p>{" "}
                  <p>{selectedTrip.driver_advance ? selectedTrip.driver_advance : 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Driver Commission</p>{" "}
                  <p>{selectedTrip.driver_commission ? selectedTrip.driver_commission : 0}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Demurrage Day</p>{" "}
                  <p>{selectedTrip.d_day ? selectedTrip.d_day : 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Demurrage Rate</p>{" "}
                  <p>{selectedTrip.d_amount ? selectedTrip.d_amount : 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Demurrage Total</p>{" "}
                  <p>{selectedTrip.d_total ? selectedTrip.d_total : 0}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Additional Load Cost</p> <p>{selectedTrip.additional_cost ? selectedTrip.additional_cost : 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Additional Unload Cost</p> <p>{selectedTrip.additional_unload_charge ? selectedTrip.additional_unload_charge : 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Depo Cost</p> <p>{selectedTrip.depo_cost ? selectedTrip.depo_cost : 0}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Food Cost</p> <p>{selectedTrip.food_cost ? selectedTrip.food_cost : 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Parking Cost</p> <p>{selectedTrip.parking_cost ? selectedTrip.parking_cost : 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Police Cost</p> <p>{selectedTrip.police_cost ? selectedTrip.police_cost : 0}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Fuel Cost</p>{" "}
                  <p>{selectedTrip.fuel_cost ? selectedTrip.fuel_cost : 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Callan cost</p>{" "}
                  <p>{selectedTrip.callan_cost ? selectedTrip.callan_cost : 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Others Cost</p>{" "}
                  <p>{selectedTrip.others_cost ? selectedTrip.others_cost : 0}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Night Guard</p>{" "}
                  <p>{selectedTrip.night_guard ? selectedTrip.night_guard : 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Toll cost</p>{" "}
                  <p>{selectedTrip.toll_cost ? selectedTrip.toll_cost : 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Feri Cost</p>{" "}
                  <p>{selectedTrip.feri_cost ? selectedTrip.feri_cost : 0}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Vendor Name</p>{" "}
                  <p>{selectedTrip.vendor_name ? selectedTrip.vendor_name : "N/A"}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Vehicle Number</p>{" "}
                  <p>{selectedTrip.vehicle_no}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Transport type</p>{" "}
                  <p>{selectedTrip.transport_type}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Trip No</p>{" "}
                  <p>{selectedTrip.trip_id} </p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Total Rent/Bill Amount</p>{" "}
                  <p>{selectedTrip.total_rent}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Due Amount</p>{" "}
                  <p>{selectedTrip.due_amount ? selectedTrip.due_amount : "N/A"}</p>
                </li>
              </ul>

              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Additional Unload Point</p> <p>{selectedTrip.additional_unload ? selectedTrip.additional_unload : 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Advance</p> <p>{selectedTrip.advance ? selectedTrip.advance : 0}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Remarks</p> <p>{selectedTrip.remarks ? selectedTrip.remarks : 0}</p>
                </li>
              </ul>
              <div className="flex justify-end mt-10">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-white bg-primary py-1 px-2 rounded-md cursor-pointer hover:bg-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TripList;
