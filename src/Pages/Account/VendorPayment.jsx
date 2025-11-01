import axios from "axios";
import { useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrashAlt } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { MdOutlineAirplaneTicket } from "react-icons/md";
import { Link } from "react-router-dom";
import Pagination from "../../components/Shared/Pagination";
import { tableFormatDate } from "../../components/Shared/formatDate";
import useAdmin from "../../hooks/useAdmin";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";

const VendorPayment = () => {
  const [payment, setPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  const isAdmin = useAdmin();
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

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/vendorBill/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete Payment receive");
      }
      // Remove trip from local list
      setPayment((prev) => prev.filter((trip) => trip.id !== id));
      toast.success("Payment receive deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedPaymentId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }

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
                <th className="px-2 py-3">BankName</th>
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
                ) :
                  (currentPayment?.map((dt, index) => (
                    <tr className="hover:bg-gray-50 transition-all border border-gray-200">
                      <td className="p-2 font-bold">{index + 1}.</td>
                      <td className="p-2">{tableFormatDate(dt.date)}</td>
                      <td className="p-2">{dt.vendor_name}</td>
                      <td className="p-2">{tableFormatDate(dt.check_date)}</td>
                      <td className="p-2">{dt.check_no}</td>
                      <td className="p-2">{dt.bill_ref}</td>
                      <td className="p-2">{dt.amount}</td>
                      <td className="p-2">{dt.cash_type}</td>
                      <td className="p-2">{dt.bank_name}</td>
                      <td className="p-2">{dt.status}</td>
                      <td className="px-2 action_column">
                        <div className="flex gap-1">
                          {dt.status === "Unpaid" && <Link to={`/tramessy/account/update-vendor-payment/${dt.id}`}>
                            <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                              <FaPen className="text-[12px]" />
                            </button>
                          </Link>}
                          {isAdmin &&<button
                            onClick={() => {
                              setSelectedPaymentId(dt.id);
                              setIsOpen(true);
                            }}
                            className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                          >
                            <FaTrashAlt className="text-[12px]" />
                          </button>}
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
                Are you sure you want to delete this vendor payment?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedPaymentId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorPayment;