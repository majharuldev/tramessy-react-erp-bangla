import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPlus, FaFilter, FaPen, FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
// export
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
//
import toast, { Toaster } from "react-hot-toast";
import { IoIosRemoveCircle, IoMdClose } from "react-icons/io";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaTruck } from "react-icons/fa6";
import Pagination from "../components/Shared/Pagination";

const RentList = () => {
  const [fuel, setFuel] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFuelId, setselectedFuelId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // search
  const [searchTerm, setSearchTerm] = useState("");
  // Fetch rent vehicle data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/rent/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setFuel(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching rent vehicle data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-16">Loading data...</p>;

  // export
  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, "Fuel Data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "fuel_data.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "#",
      "ড্রাইভারের নাম",
      "গাড়ির নাম",
      "ফুয়েলের ধরন",
      "ফুয়েলিং তারিখ",
      "গ্যালন/লিটার",
      "লিটার প্রতি খরচ",
      "সকল খরচ",
    ];

    const tableRows = fuel.map((dt, index) => [
      index + 1,
      dt.driver_name,
      dt.driver_name,
      dt.type,
      dt.date_time,
      dt.quantity,
      dt.price,
      dt.quantity * dt.price,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("fuel_data.pdf");
  };
  const printTable = () => {
    // hide specific column
    const actionColumns = document.querySelectorAll(".action_column");
    actionColumns.forEach((col) => {
      col.style.display = "none";
    });
    const printContent = document.querySelector("table").outerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
    <html>
        <head>
          <title>Print</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
  `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
    // fallback: just in case (immediate reset)
  actionColumns.forEach((col) => {
    col.style.display = "";
  });
  };
  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/rent/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete trip");
      }
      // Remove fuel from local list
      setFuel((prev) => prev.filter((driver) => driver.id !== id));
      toast.success("Rent list deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setselectedFuelId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("There was a problem deleting.!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  // search
  const filteredFuel = fuel.filter((dt) => {
    const term = searchTerm.toLowerCase();
    const fuelDate = dt.date_time;
    const matchesSearch =
      dt.vendor_name?.toLowerCase().includes(term) ||
    dt.vehicle_name_model?.toLowerCase().includes(term) ||
    dt.vehicle_category?.toLowerCase().includes(term) ||
    dt.vehicle_size_capacity?.toLowerCase().includes(term) ||
    dt.registration_number?.toLowerCase().includes(term) ||
    dt.status?.toLowerCase().includes(term)
    const matchesDateRange =
      (!startDate || new Date(fuelDate) >= new Date(startDate)) &&
      (!endDate || new Date(fuelDate) <= new Date(endDate));

    return matchesSearch && matchesDateRange;
  });
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFuel = filteredFuel.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(fuel.length / itemsPerPage);
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages)
      setCurrentPage((currentPage) => currentPage + 1);
  };

  const handlePageClick = (number) => {
    setCurrentPage(number);
  };
  return (
    <main className=" md:p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-2 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            All Rent Vehicle
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            {/* <button
              onClick={() => setShowFilter((prev) => !prev)} // Toggle filter
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button> */}
            <Link to="/tramessy/AddRentVehicleForm">
              <button className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Add
              </button>
            </Link>
          </div>
        </div>
        {/* export */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={exportExcel}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            <button
              onClick={exportPDF}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              PDF
            </button>
            <button
              onClick={printTable}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
          {/*  */}
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
          <div className="md:flex items-center justify-between gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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
            <div className="w-xs">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setShowFilter(false);
                }}
                className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <IoIosRemoveCircle /> Clear Filter
              </button>
            </div>
          </div>
        )}
        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary text-white capitalize text-sm">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Vendor/Driver Name</th>
                <th className="p-2">Vehicle Name/Model</th>
                <th className="p-2">Vehicle Category</th>
                <th className="p-2">Vehicle Size/Capacity</th>
                <th className="p-2">Regi.No</th>
                <th className="p-2">Status</th>
                <th className="p-2 action_column">Action</th>
              </tr>
            </thead>
            <tbody className="text-primary">
              {
                currentFuel.length === 0 ? (
                  <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No Rent Vehicle found
                  </td>
                  </tr>)
              :(currentFuel?.map((dt, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-all border border-gray-200"
                >
                  <td className="p-2 font-bold">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="p-2">{dt.vendor_name}</td>
                  <td className="p-2">{dt.vehicle_name_model}</td>
                  <td className="p-2">{dt.vehicle_category}</td>
                  <td className="p-2">{dt.vehicle_size_capacity}</td>
                  <td className="p-2">{dt.registration_number}</td>
                  <td className="p-2">{dt.status}</td>
                  <td className="p-2 action_column">
                    <div className="flex gap-2">
                      <Link to={`/tramessy/UpdateRentVehicleForm/${dt.id}`}>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setselectedFuelId(dt.id);
                          setIsOpen(true);
                        }}
                        className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))
              }
            </tbody>
          </table>
        </div>
        {/* pagination */}
        {currentFuel.length > 0 && totalPages >= 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          maxVisible={8} 
        />
      )}
      </div>
      {/* Delete modal */}
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
                Are you sure you want to delete this data?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedFuelId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default RentList;
