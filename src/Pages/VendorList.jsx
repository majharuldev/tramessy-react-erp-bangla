import axios from "axios";
import { useEffect, useState } from "react";
import { FaPlus, FaFilter, FaPen, FaTrashAlt, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";
// export
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
//
import toast, { Toaster } from "react-hot-toast";
import { IoIosRemoveCircle, IoMdClose } from "react-icons/io";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Pagination from "../components/Shared/Pagination";
import { tableFormatDate } from "../components/Shared/formatDate";
import DatePicker from "react-datepicker";
import useAdmin from "../hooks/useAdmin";

const VendorList = () => {
  const [vendor, setVendor] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedvendorId, setselectedvendorId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  const isAdmin = useAdmin()
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // search
  const [searchTerm, setSearchTerm] = useState("");
  // Fetch vendor data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/vendor/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setVendor(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-16">Loading vendor...</p>;
  // Export Excel
  const exportExcel = () => {
    const exportData = filteredvendor.map(
      ({ date, vendor_name, mobile, rent_category, work_area, status }) => ({
        Date: date,
        Name: vendor_name,
        Mobile: mobile,
        RentCategory: rent_category,
        WorkArea: work_area,
        Status: status,
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Vendor_List_${new Date().toISOString()}.xlsx`);
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "Date",
      "Name",
      "Mobile",
      "RentCategory",
      "WorkArea",
      "Status",
    ];
    const tableRows = filteredvendor.map(
      ({ date, vendor_name, mobile, rent_category, work_area, status }) => [
        date,
        vendor_name,
        mobile,
        rent_category,
        work_area,
        status,
      ]
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [17, 55, 91] },
    });

    doc.save(`Vendor_List_${new Date().toISOString()}.pdf`);
  };

  // Print Table
  const printTable = () => {
    const printableContent = `
    <html>
      <head>
        <title>Vendor List</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            font-size: 12px;
            text-align: left;
          }
          th {
            background-color: #11375B;
            color: white;
          }
        </style>
      </head>
      <body>
        <h2 style="text-align:center;">Vendor List</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>RentCategory</th>
              <th>WorkArea</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredvendor
        .map(
          (dt, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${dt.date}</td>
                <td>${dt.vendor_name}</td>
                <td>${dt.mobile}</td>
                <td>${dt.rent_category}</td>
                <td>${dt.work_area}</td>
                <td>${dt.status}</td>
              </tr>`
        )
        .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printableContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/vendor/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete trip");
      }
      // Remove vendor from local list
      setVendor((prev) => prev.filter((driver) => driver.id !== id));
      toast.success("Vendor deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setselectedvendorId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete vendor!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  // search
  const filteredvendor = vendor.filter((dt) => {
    const term = searchTerm.toLowerCase();
    const vendorDate = dt.date;
    const matchesSearch =
      dt.vendor_name?.toLowerCase().includes(term) ||
      dt.vehicle_number?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term) ||
      dt.trip_id_invoice_no?.toLowerCase().includes(term) ||
      dt.pump_name_address?.toLowerCase().includes(term) ||
      String(dt.capacity).includes(term) ||
      dt.type?.toLowerCase().includes(term) ||
      String(dt.quantity).includes(term) ||
      dt.price?.toLowerCase().includes(term) ||
      dt.total_price?.toLowerCase().includes(term);
    const matchesDateRange =
      (!startDate || new Date(vendorDate) >= new Date(startDate)) &&
      (!endDate || new Date(vendorDate) <= new Date(endDate));

    return matchesSearch && matchesDateRange;
  });
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendor = filteredvendor.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(vendor.length / itemsPerPage);

  return (
    <main className=" md:p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-2 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaUsers className="text-[#11375B] text-2xl" />
            All vender information
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
            <Link to="/tramessy/AddVendorForm">
              <button className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Add Vendor
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
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  setStartDate("")
                  setEndDate("")
                  setShowFilter(false)
                }}
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> Clear
              </button>
            </div>
          </div>
        )}
        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary text-white capitalize text-xs">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Date</th>
                <th className="p-2">Name</th>
                <th className="p-2">Mobile</th>
                <th className="p-2">RentCate</th>
                <th className="p-2">Work Area</th>
                <th className="p-2">Status</th>
                <th className="p-2 action_column">Action</th>
              </tr>
            </thead>
            <tbody className="text-primary ">
              {
                currentVendor.length === 0 ? (<tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No Vendor found
                  </td>
                </tr>)
                  : (currentVendor?.map((dt, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-all border border-gray-200"
                    >
                      <td className="p-2 font-bold">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="p-2">{tableFormatDate(dt.date)}</td>
                      <td className="p-2">{dt.vendor_name}</td>
                      <td className="p-2">{dt.mobile}</td>
                      <td className="p-2">{dt.rent_category}</td>
                      <td className="p-2">{dt.work_area}</td>
                      <td className="p-2">{dt.status}</td>
                      <td className="p-2 action_column">
                        <div className="flex gap-2">
                          <Link to={`/tramessy/UpdateVendorForm/${dt.id}`}>
                            <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                              <FaPen className="text-[12px]" />
                            </button>
                          </Link>
                          {isAdmin && <button
                            onClick={() => {
                              setselectedvendorId(dt.id);
                              setIsOpen(true);
                            }}
                            className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                          >
                            <FaTrashAlt className="text-[12px]" />
                          </button>}
                        </div>
                      </td>
                    </tr>
                  )))
              }
            </tbody>
          </table>
        </div>
        {/* pagination */}
        {currentVendor.length > 0 && totalPages >= 1 && (
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
                Are you sure you want to delete this Vendor?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedvendorId)}
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

export default VendorList;
