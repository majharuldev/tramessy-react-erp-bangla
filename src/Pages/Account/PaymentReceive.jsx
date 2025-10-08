
import axios from "axios";
import { format, isAfter, isBefore, isEqual, isSameDay, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { FaFilter, FaPen, FaPlus, FaTrashAlt } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { Link } from "react-router-dom";
import Pagination from "../../components/Shared/Pagination";
import DatePicker from "react-datepicker";
import { tableFormatDate } from "../../components/Shared/formatDate";

const PaymentReceive = () => {
  const [payment, setPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filteredPayment, setFilteredPayment] = useState([]);

  // Fetch payment data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/paymentRecived/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setPayment(response.data.data);
          setFilteredPayment(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
        setLoading(false);
      });
  }, []);

  const sortedPayment = [...payment].sort((a, b) => new Date(b.date) - new Date(a.date));
  // filter logic
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredPayment(payment);
      return;
    }

    const result = sortedPayment.filter((item) => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
// যদি শুধু startDate দেওয়া হয় → সেই দিনের ডেটা
    if (startDate && !endDate) {
      return isSameDay(itemDate, startDate);
    }

    // যদি শুধু endDate দেওয়া হয় → সেই দিনের ডেটা
    if (endDate && !startDate) {
      return isSameDay(itemDate, endDate);
    }

    // যদি দুইটাই দেওয়া হয় → range এর মধ্যে
   if (startDate && endDate) {
  return (
    (isAfter(itemDate, startDate) || isSameDay(itemDate, startDate)) &&
    (isBefore(itemDate, endDate) || isSameDay(itemDate, endDate))
  );
}

      return true;
    });

    setFilteredPayment(result);
  }, [startDate, endDate, payment]);
  // total amount footer
  const totalAmount = filteredPayment.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayment.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayment.length / itemsPerPage);



  // filter clear func
  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setShowFilter(false);
    setFilteredPayment(payment);
    setCurrentPage(1);
  };

  if (loading) return <p className="text-center mt-16">Loading payment...</p>;

  return (
    <div className="md:p-2">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            Payment Receive
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => setShowFilter((prev) => !prev)}
                className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> Filter
              </button>
            </div>
            <Link to="/tramessy/account/PaymentReceiveForm">
              <button className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Recieve
              </button>
            </Link>
          </div>
        </div>
        {/* filter */}
        {showFilter && (
          <div className="md:flex items-center gap-5 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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
            <div className=" ">
              <button
                onClick={handleClearFilter}
                className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FiFilter /> Clear
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-sm">
              <tr>
                <th className="p-2">SL.</th>
                <th className="p-2">Date</th>
                <th className="p-2">CustomerName</th>
                <th className="p-2">BranchName</th>
                <th className="p-2">BillRef</th>
                <th className="p-2">Amount</th>
                <th className="p-2">CashType</th>
                <th className="p-2">Note</th>
                <th className="p-2">CreatedBy</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-primary">
              {currentPayments?.map((dt, index) => (
                <tr key={dt.id} className="hover:bg-gray-50 transition-all border border-gray-200">
                  <td className="px-2 py-1 font-bold">{indexOfFirstItem + index + 1}.</td>
                  <td className="px-2 py-1">{dt.date ? tableFormatDate(dt.date) : ""}</td>
                  <td className="px-2 py-1">{dt.customer_name}</td>
                  <td className="px-2 py-1">{dt.branch_name}</td>
                  <td className="px-2 py-1">{dt.bill_ref}</td>
                  <td className="px-2 py-1">{dt.amount}</td>
                  <td className="px-2 py-1">{dt.cash_type}</td>
                  <td className="px-2 py-1">{dt.remarks}</td>
                  <td className="px-2 py-1">{dt.created_by}</td>
                  <td className="px-2 py-1">{dt.status}</td>
                  <td className="px-2 action_column">
                    <div className="flex gap-1">
                      <Link to={`/tramessy/account/update-PaymentReceiveForm/${dt.id}`}>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      {/* <button
                        className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* ✅ মোট যোগফল row */}
            {currentPayments.length > 0 && (
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan="5" className="text-right p-2">Total:</td>
                  <td className="p-2">{totalAmount}</td>
                  <td colSpan="5"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {/* pagination */}
        {currentPayments.length > 0 && totalPages >= 1 && (
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

export default PaymentReceive;