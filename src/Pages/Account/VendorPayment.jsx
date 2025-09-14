import axios from "axios";
import { useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrashAlt } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { MdOutlineAirplaneTicket } from "react-icons/md";
import { Link } from "react-router-dom";
import Pagination from "../../components/Shared/Pagination";

const VendorPayment = () => {
  const [payment, setPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  // Fetch payment data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/vendorBill/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setPayment(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
        setLoading(false);
      });
  }, []);

  // মোট যোগফল বের করা
const totalAmount = payment.reduce(
  (sum, item) => sum + Number(item.amount || 0),
  0
);

  // pagination
  const [currentPage, setCurrentPage] = useState([1]);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayment = payment.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(payment.length / itemsPerPage);
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

  if (loading) return <p className="text-center mt-16">Loading payment...</p>;
  return (
    <div className="md:p-2 ">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2 ">
                          <MdOutlineAirplaneTicket className="text-[#11375B] text-2xl" />
                          Vendor Payment
                        </h2>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/account/add-vendor-payment">
              <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Add
              </button>
            </Link>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-xs">
              <tr>
                <th className="px-2 py-3">SL.</th>
                <th className="px-2 py-3">Date</th>
                <th className="px-2 py-3">VendorName</th>
                <th className="px-2 py-3">CheckDate</th>
                <th className="px-2 py-3">CheckNo</th>
                <th className="px-2 py-3">BillRef</th>
                <th className="px-2 py-3">Amount</th>
                <th className="px-2 py-3">CashType</th>
                {/* <th className="px-2 py-3">Created By</th> */}
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {
                currentPayment.length === 0 ? (
    <tr>
      <td colSpan="8" className="text-center py-10 text-gray-500 italic">
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
          No vehicle data found.
        </div>
      </td>
    </tr>
  )  :
              (currentPayment?.map((dt, index) => (
                <tr className="hover:bg-gray-50 transition-all border border-gray-200">
                  <td className="p-2 font-bold">{index + 1}.</td>
                  <td className="p-2">{dt.date}</td>
                  <td className="p-2">{dt.vendor_name}</td>
                  <td className="p-2">{dt.check_date}</td>
                  <td className="p-2">{dt.check_no}</td>
                  <td className="p-2">{dt.bill_ref}</td>
                  <td className="p-2">{dt.amount}</td>
                  <td className="p-2">{dt.cash_type}</td>
                  {/* <td className="p-2">{dt.created_by}</td> */}
                  <td className="p-2">{dt.status}</td>
                  <td className="px-2 action_column">
                    <div className="flex gap-1">
                      {dt.status === "Unpaid" && <Link to={`/tramessy/account/update-vendor-payment/${dt.id}`}>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>}
                      {/* <button
                        // onClick={() => {
                        //   setSelectedEmployeeId(dt.id);
                        //   setIsOpen(true);
                        // }}
                        className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              )))
              }
            </tbody>
            {/* ✅ মোট যোগফল row */}
    {currentPayment.length > 0 && (
      <tfoot className="bg-gray-100 font-bold">
        <tr>
          <td colSpan="4" className="text-right p-2">Total:</td>
          <td className="p-2">{totalAmount}</td>
          <td colSpan="3"></td>
        </tr>
      </tfoot>
    )}
          </table>
        </div>
        {/* pagination */}
                  {currentPayment.length > 0 && totalPages >= 1 && (
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

export default VendorPayment;