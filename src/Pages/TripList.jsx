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
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Pagination from "../components/Shared/Pagination";
const TripList = () => {
  const [trip, setTrip] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
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

  // excel
  const exportTripsToExcel = () => {
    const tableData = filteredTrips.map((dt, index) => ({
      "SL.": index + 1,
      Date: dt.date,
      "Driver Name": dt.driver_name || "N/A",
      "Driver Mobile": dt.driver_mobile || "N/A",
      Commission: dt.driver_commission || "0",
      "Load Point": dt.load_point,
      "Unload Point": dt.unload_point,
      "Trip Cost": dt.total_exp || 0,
      "Trip Fare": dt.total_rent || 0,
      "Total Profit":
        parseFloat(dt.total_rent || 0) - parseFloat(dt.total_exp || 0),
    }));

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "trip_report.xlsx");
  };
  // pdf
  const exportTripsToPDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.",
      "Date",
      "Driver Name",
      "Mobile",
      "Commission",
      "Load Point",
      "Unload Point",
      "Trip Cost",
      "Trip Fare",
      "Profit",
    ];

    const tableRows = filteredTrips.map((dt, index) => [
      index + 1,
      dt.date,
      dt.driver_name || "N/A",
      dt.driver_mobile || "N/A",
      dt.driver_commission || "0",
      dt.load_point,
      dt.unload_point,
      dt.total_exp || "0",
      dt.total_rent || "0",
      parseFloat(dt.total_rent || 0) - parseFloat(dt.total_exp || 0),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      theme: "grid",
    });

    doc.save("trip_report.pdf");
  };
  // print
  const printTripsTable = () => {
    const actionColumns = document.querySelectorAll(".action_column");
    actionColumns.forEach((col) => (col.style.display = "none"));

    const printContent = document.querySelector("table").outerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");

    WinPrint.document.write(`
    <html>
    <head>
      <title>Print</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        thead { background-color: #11375B; color: white; }
        tbody tr:nth-child(even) { background-color: #f3f4f6; }
      </style>
    </head>
    <body>
      <h3>Trip Report</h3>
      ${printContent}
    </body>
    </html>
  `);

    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();

    actionColumns.forEach((col) => (col.style.display = ""));
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
      dt.vehicle_no?.toLowerCase().includes(term) ||
      dt.registration_number?.toLowerCase().includes(term) ||
      dt.registration_serial?.toLowerCase().includes(term) ||
      dt.registration_zone?.toLowerCase().includes(term) ||
      dt.registration_date?.toLowerCase().includes(term) ||
      dt.text_date?.toLowerCase().includes(term) ||
      dt.road_permit_date?.toLowerCase().includes(term) ||
      dt.fitness_date?.toLowerCase().includes(term)
    );
  });

  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrip = filteredTripList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTripList.length / itemsPerPage);

  return (
    <main className=" md:p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-2 border border-gray-200">
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
          <div className="md:flex items-center gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="relative w-full">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start date"
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>

            <div className="relative w-full">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End date"
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <select
              value={selectedCustomer}
              onChange={(e) => {
                setSelectedCustomer(e.target.value)
                setCurrentPage(1);
              }}
              className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.customer_name}>
                  {c.customer_name}
                </option>
              ))}
            </select>
            <select
              value={transportType}
              onChange={(e) => {
                setTransportType(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value="">All Transport</option>
              <option value="own_transport">Own Transport</option>
              <option value="vendor_transport">Vendor Transport</option>
            </select>

            <div className="w-xs">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedCustomer("");
                  setShowFilter(false);
                  setTransportType("")
                }}
                className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                Clear
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
                <th className="p-2">TripId</th>
                <th className="p-2">Customer</th>
                <th className="p-2">TransportType</th>
                <th className="p-2">VehicleNo</th>
                <th className="p-2">Vendor</th>
                <th className="p-2">Trip&Destination</th>
                <th className="p-2">TripRent</th>
                <th className="p-2">TripCost</th>
                <th className="p-2">Profit</th>
                <th className="p-2 action_column">Action</th>
              </tr>
            </thead>
            <tbody className="text-primary">
              {
                currentTrip.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-4 text-gray-500">
                      No trip found
                    </td>
                  </tr>)
                  : (currentTrip?.map((dt, index) => {
                    const totalRent = parseFloat(dt.total_rent || 0);
                    const demurrage = parseFloat(dt.d_total || 0);
                    const totalExpenses = parseFloat(dt.total_exp || 0);
                    const totalProfit = (totalRent + demurrage) - totalExpenses;
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-all border-b border-gray-300"
                      >
                        <td className="p-2 font-bold">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="p-2">{dt?.date}</td>
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
                          <p>{dt.vendor_name? dt.vendor_name: "N/A"}</p>
                        </td>
                        <td className="p-2">
                          <p>Load: {dt.load_point}</p>
                          <p>Unload: {dt.unload_point}</p>
                        </td>

                        <td className="p-2">{dt.total_rent}</td>
                        <td className="p-2">{dt.total_exp}</td>
                        {/* <td className="p-2">
                      {parseFloat(dt.total_rent || 0) -
                        parseFloat(dt.total_exp || 0)}
                    </td> */}
                        <td className="p-2">{totalProfit}</td>
                        <td className="p-2 action_column">
                          <div className="flex gap-1">
                            <Link to={`/tramessy/UpdateTripForm/${dt.id}`}>
                              <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                                <FaPen className="text-[12px]" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleView(dt.id)}
                              className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                            >
                              <FaEye className="text-[12px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
            </tbody>
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
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#000000ad] z-50">
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
                  <p className="w-48">Additional Load</p> <p>{selectedTrip.additional_load? selectedTrip.additional_load: "N/A"}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Driver Name</p>{" "}
                  <p>{selectedTrip.driver_name}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2">
                  <p className="w-48">Driver Mobile</p>{" "}
                  <p>{selectedTrip.driver_mobile? selectedTrip.driver_mobile: "N/A"}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Driver Advance</p>{" "}
                  <p>{selectedTrip.driver_advance? selectedTrip.driver_advance:0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Driver Commission</p>{" "}
                  <p>{selectedTrip.driver_commission? selectedTrip.driver_commission:0}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Fuel Cost</p>{" "}
                  <p>{selectedTrip.fuel_cost? selectedTrip.fuel_cost:0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Callan cost</p>{" "}
                  <p>{selectedTrip.callan_cost ? selectedTrip.callan_cost: 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Others Cost</p>{" "}
                  <p>{selectedTrip.others_cost? selectedTrip.others_cost: 0}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Vendor Name</p>{" "}
                  <p>{selectedTrip.vendor_name? selectedTrip.vendor_name: "N/A"}</p>
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
                  <p className="w-48">Trip Id</p>{" "}
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
                  <p>{selectedTrip.due_amount? selectedTrip.due_amount:"N/A"}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Additional Cost</p> <p>{selectedTrip.additional_cost? selectedTrip.additional_cost: 0}</p>
                </li>
                <li className="w-[428px] flex text-primary text-sm font-semibold px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Advance</p> <p>{selectedTrip.advance? selectedTrip.advance: 0}</p>
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
