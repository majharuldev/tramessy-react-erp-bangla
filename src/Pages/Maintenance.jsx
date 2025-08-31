import axios from "axios";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaTruck, FaPlus, FaFilter, FaPen, FaTrashAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
// export
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
const Maintenance = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMaintenanceId, setselectedMaintenanceId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // search
  const [searchTerm, setSearchTerm] = useState("");
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // Fetch maintenance data
  useEffect(() => {
    axios
      .get("https://api.tramessy.com/api/maintenance")
      .then((response) => {
        if (response.data.status === "success") {
          setMaintenance(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);
  if (loading)
    return <p className="text-center mt-16">Loading maintenance...</p>;
  console.log("maintenance", maintenance);
  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `https://api.tramessy.com/api/maintenance/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete trip");
      }
      // Remove fuel from local list
      setMaintenance((prev) => prev.filter((driver) => driver.id !== id));
      toast.success("সফলভাবে ডিলিট হয়েছে", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setselectedMaintenanceId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("ডিলিট করতে সমস্যা হয়েছে!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  // export
  const headers = [
    { label: "#", key: "index" },
    { label: "সার্ভিসের ধরন", key: "service_type" },
    { label: "গাড়ির নাম", key: "vehicle_name" },
    { label: "মেইনটেনেন্সের ধরন", key: "service_for" },
    { label: "পার্টস এন্ড স্পায়ারস", key: "parts_and_spairs" },
    { label: "মেইনটেনেন্সের তারিখ", key: "time" },
    { label: "অগ্রাধিকার", key: "dignifies" },
    { label: "টোটাল খরচ", key: "total_cost" },
  ];
  const csvData = maintenance?.map((dt, index) => ({
    index: index + 1,
    service_type: dt.service_type,
    vehicle_no: dt.vehicle_no,
    service_for: dt.service_for,
    parts_and_spairs: dt.parts_and_spairs,
    time: dt.time,
    dignifies: dt.dignifies,
    total_cost: dt.total_cost,
  }));
  // excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenance");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "maintenance.xlsx");
  };
  // pdf
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = headers.map((h) => h.label);
    const tableRows = csvData.map((row) => headers.map((h) => row[h.key]));
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { font: "helvetica", fontSize: 8 },
    });

    doc.save("maintenance.pdf");
  };
  // print
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
  };
  // search
  const filteredMaintenance = maintenance.filter((dt) => {
    const term = searchTerm.toLowerCase();
    const maintenanceDate = dt.date;
    const matchesSearch =
      dt.date?.toLowerCase().includes(term) ||
      dt.service_type?.toLowerCase().includes(term) ||
      dt.parts_and_spairs?.toLowerCase().includes(term) ||
      dt.maintenance_type?.toLowerCase().includes(term) ||
      dt.cost?.toLowerCase().includes(term) ||
      dt.vehicle_no?.toLowerCase().includes(term) ||
      dt.cost_by?.toLowerCase().includes(term) ||
      dt.total_cost?.toLowerCase().includes(term) ||
      dt.dignifies?.toLowerCase().includes(term) ||
      dt.service_for?.toLowerCase().includes(term) ||
      dt.receipt?.toLowerCase().includes(term);
    const matchesDateRange =
      (!startDate || new Date(maintenanceDate) >= new Date(startDate)) &&
      (!endDate || new Date(maintenanceDate) <= new Date(endDate));

    return matchesSearch && matchesDateRange;
  });

  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMaintenance = filteredMaintenance.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(maintenance.length / itemsPerPage);
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
    <main className="bg-gradient-to-br from-gray-100 to-white md:p-6">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-8 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            Maintenance
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/MaintenanceForm">
              <button className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Maintenance
              </button>
            </Link>
            <button
              onClick={() => setShowFilter((prev) => !prev)} // Toggle filter
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>
        {/* Export */}
        <div className="md:flex justify-between mb-4">
          <div className="flex gap-1 md:gap-3 flex-wrap">
            <button
              onClick={exportExcel}
              className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              Excel
            </button>
            <button
              onClick={exportPDF}
              className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              PDF
            </button>
            <button
              onClick={printTable}
              className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              Print
            </button>
          </div>
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
        className="absolute right-7 top-[rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
      >
        ✕
      </button>
    )}
          </div>
        </div>

        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex justify-between gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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
          </div>
        )}
        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-sm">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Service Type</th>
                <th className="p-2">Vehicle No</th>
                <th className="p-2">Maintenance Type</th>
                <th className="p-2">Parts and Spares</th>
                <th className="p-2">Maintenance Date</th>
                <th className="p-2">Priority</th>
                <th className="p-2">Total Cost</th>
                <th className="p-2 action_column">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[#11375B] font-semibold bg-gray-100">
              {currentMaintenance?.map((dt, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-all border border-gray-200"
                >
                  <td className="p-2 font-bold">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="p-2">{dt.service_type}</td>
                  <td className="p-2">{dt.vehicle_no}</td>
                  <td className="p-2">{dt.service_for}</td>
                  <td className="p-2">{dt.parts_and_spairs}</td>
                  <td className="p-2">{dt.date}</td>
                  <td className="p-2">{dt.dignifies}</td>
                  <td className="p-2">{dt.total_cost}</td>
                  <td className="action_column">
                    <div className="flex gap-2">
                      <Link to={`/UpdateMaintenanceForm/${dt.id}`}>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                        <FaTrashAlt
                          onClick={() => {
                            setselectedMaintenanceId(dt.id);
                            setIsOpen(true);
                          }}
                          className="text-[12px]"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="mt-10 flex justify-center">
          <div className="space-x-2 flex items-center">
            <button
              onClick={handlePrevPage}
              className={`p-2 ${
                currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
              } rounded-sm`}
              disabled={currentPage === 1}
            >
              <GrFormPrevious />
            </button>
            {[...Array(totalPages).keys()].map((number) => (
              <button
                key={number + 1}
                onClick={() => handlePageClick(number + 1)}
                className={`px-3 py-1 rounded-sm ${
                  currentPage === number + 1
                    ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
                    : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
                }`}
              >
                {number + 1}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              className={`p-2 ${
                currentPage === totalPages
                  ? "bg-gray-300"
                  : "bg-primary text-white"
              } rounded-sm`}
              disabled={currentPage === totalPages}
            >
              <GrFormNext />
            </button>
          </div>
        </div>
      </div>
      {/* Delete modal */}
      <td className="flex justify-center items-center">
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
                Do you want to delete?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedMaintenanceId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </td>
    </main>
  );
};

export default Maintenance;
