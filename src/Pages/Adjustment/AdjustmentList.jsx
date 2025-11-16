import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaTruck, FaPlus, FaPen, FaTrashAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Pagination from "../../components/Shared/Pagination";
import useAdmin from "../../hooks/useAdmin";

const AdjustmentList = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const toggleModal = () => setIsOpen(!isOpen);
  const isAdmin = useAdmin();

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/adjustment/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setAdjustments(response.data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="text-center mt-16">Loading Adjustment...</p>;

  // DELETE
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/adjustment/delete/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Delete failed");

      setAdjustments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Adjustment deleted successfully");
      setIsOpen(false);
      setSelectedId(null);
    } catch (error) {
      console.log(error);
      toast.error("There was a problem deleting!");
    }
  };

  // SEARCH FIXED
  const filteredAdjustments = adjustments.filter((a) => {
    const t = searchTerm.toLowerCase();
    return (
      a.indentor?.toLowerCase().includes(t) ||
      a.vehicle_no?.toLowerCase().includes(t) ||
      a.vehicle_type?.toLowerCase().includes(t) ||
      a.purpose_of_expenses?.toLowerCase().includes(t) ||
      a.branch_name?.toLowerCase().includes(t) ||
      a.paid_to?.toLowerCase().includes(t) ||
      a.status?.toLowerCase().includes(t)
    );
  });

  // PAGINATION
  const itemsPerPage = 10;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentList = filteredAdjustments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAdjustments.length / itemsPerPage);

  // EXCEL EXPORT FIXED
  const exportToExcel = () => {
    const rows = filteredAdjustments.map((item, index) => ({
      SL: index + 1,
      Date: item.date,
      Indentor: item.indentor,
      VehicleNo: item.vehicle_no,
      VehicleType: item.vehicle_type,
      Purpose: item.purpose_of_expenses,
      Rate: item.rate,
      Quantity: item.quantity,
      Branch: item.branch_name,
      TotalAmount: item.total_amount,
      AdvancePaidDate: item.advance_paid_date,
      AdvanceAmount: item.advance_amount,
      BalanceAmount: item.balance_amount,
      PaidTo: item.paid_to,
      Remarks: item.remarks,
      Status: item.status,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Adjustments");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "adjustments.xlsx"
    );
  };

  // PRINT FIXED
  const printTable = () => {
    const rows = filteredAdjustments
      .map(
        (item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.date}</td>
      <td>${item.indentor}</td>
      <td>${item.vehicle_no}</td>
      <td>${item.vehicle_type}</td>
      <td>${item.purpose_of_expenses}</td>
      <td>${item.rate}</td>
      <td>${item.quantity}</td>
      <td>${item.branch_name}</td>
      <td>${item.total_amount}</td>
      <td>${item.advance_paid_date}</td>
      <td>${item.advance_amount}</td>
      <td>${item.balance_amount}</td>
      <td>${item.paid_to}</td>
      <td>${item.remarks}</td>
      <td>${item.status}</td>
    </tr>`
      )
      .join("");

    const Win = window.open("", "", "width=900,height=650");
    Win.document.write(`
      <html>
        <head>
          <title>Adjustment List</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 6px; font-size: 12px; }
            thead { background: #11375B; color: white; }
          </style>
        </head>
        <body>
          <h3>Adjustment List</h3>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Indentor</th>
                <th>Vehicle No</th>
                <th>Vehicle Type</th>
                <th>Purpose</th>
                <th>Rate</th>
                <th>Qty</th>
                <th>Branch</th>
                <th>Total</th>
                <th>Adv Date</th>
                <th>Adv Amount</th>
                <th>Balance</th>
                <th>Paid To</th>
                <th>Remarks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);

    Win.document.close();
    Win.print();
  };

  return (
    <main className="md:p-2">
      <Toaster />

      <div className="max-w-7xl p-6 mx-auto bg-white shadow rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-2xl" /> Adjustment List
          </h1>

          <Link to="/tramessy/AdjustmentForm">
            <button className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
              <FaPlus /> Add Adjustment
            </button>
          </Link>
        </div>

        <div className="md:flex justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="py-2 px-5 bg-gray-200 text-primary rounded-md hover:bg-primary hover:text-white"
            >
              Excel
            </button>
            <button
              onClick={printTable}
              className="py-2 px-5 bg-gray-200 text-primary rounded-md hover:bg-primary hover:text-white"
            >
              Print
            </button>
          </div>

          <div>
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="border border-gray-300 rounded-md text-xs py-2 px-2"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary text-white text-xs">
              <tr>
                <th className="p-1">SL</th>
                <th className="p-1">Date</th>
                <th className="p-1">Indentor</th>
                <th className="p-1">Vehicle No</th>
                <th className="p-1">Vehicle Type</th>
                <th className="p-1">Purpose</th>
                <th className="p-1">Rate</th>
                <th className="p-1">Qty</th>
                <th className="p-1">Branch</th>
                <th className="p-1">Total</th>
                <th className="p-1">Adv Date</th>
                <th className="p-1">Adv Amt</th>
                <th className="p-1">Balance</th>
                <th className="p-1">Paid To</th>
                <th className="p-1">Remarks</th>
                <th className="p-1">Status</th>
                <th className="p-1">Action</th>
              </tr>
            </thead>

            <tbody className="text-primary">
              {currentList.length === 0 ? (
                <tr>
                  <td colSpan="17" className="text-center p-4 text-gray-500">
                    No Adjustment Found
                  </td>
                </tr>
              ) : (
                currentList.map((item, index) => (
                  <tr
                    key={index}
                    className="border border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    <td className="p-1">{indexOfFirst + index + 1}</td>

                    <td className="p-1">
                      {new Date(item.date).toLocaleDateString("en-GB")}
                    </td>

                    <td className="p-1">{item.indentor}</td>
                    <td className="p-1">{item.vehicle_no}</td>
                    <td className="p-1">{item.vehicle_type}</td>
                    <td className="p-1">{item.purpose_of_expenses}</td>
                    <td className="p-1">{item.rate}</td>
                    <td className="p-1">{item.quantity}</td>
                    <td className="p-1">{item.branch_name}</td>
                    <td className="p-1">{item.total_amount}</td>

                    <td className="p-1">
                      {new Date(item.advance_paid_date).toLocaleDateString(
                        "en-GB"
                      )}
                    </td>

                    <td className="p-1">{item.advance_amount}</td>
                    <td className="p-1">{item.balance_amount}</td>
                    <td className="p-1">{item.paid_to}</td>
                    <td className="p-1">{item.remarks}</td>

                    <td className="p-1">
                      <span
                        className={`text-white px-3 py-1 rounded-md text-xs ${
                          item.status === "Active"
                            ? "bg-green-700"
                            : "bg-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-1">
                      <div className="flex gap-1">
                        <Link to={`/tramessy/updateAdjustment/${item.id}`}>
                          <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md">
                            <FaPen className="text-[12px]" />
                          </button>
                        </Link>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setSelectedId(item.id);
                              setIsOpen(true);
                            }}
                            className="text-red-900 hover:bg-red-900 hover:text-white px-2 py-1 rounded shadow-md"
                          >
                            <FaTrashAlt className="text-[12px]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {currentList.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>

      {/* DELETE MODAL */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-6 rounded-lg relative w-72">
            <button
              onClick={toggleModal}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
            >
              <IoMdClose />
            </button>

            <div className="text-center text-red-500 text-4xl mb-4">
              <FaTrashAlt />
            </div>

            <p className="text-center text-gray-700 mb-6">
              Are you sure you want to delete this Adjustment?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={toggleModal}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                No
              </button>
              <button
                onClick={() => handleDelete(selectedId)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdjustmentList;
