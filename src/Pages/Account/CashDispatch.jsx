import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { FaEye, FaFilter, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { FiFilter } from "react-icons/fi";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { HiCurrencyBangladeshi } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";
import Pagination from "../../components/Shared/Pagination";

const CashDispatch = () => {
  const [account, setAccount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // Fetch office data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/account/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          const data = response.data.data;
          setAccount(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching account data:", error);
        setLoading(false);
      });
  }, []);

  //  filter accounts by date range
  const filteredAccounts = useMemo(() => {
    return account.filter((item) => {
      if (!item.date) return false;
      const itemDate = parseISO(item.date); // api theke "2025-08-02" type string ashle ok

      // start & end date thakle check kora
      const afterStart =
        startDate === "" || isAfter(itemDate, parseISO(startDate)) || isEqual(itemDate, parseISO(startDate));
      const beforeEnd =
        endDate === "" || isBefore(itemDate, parseISO(endDate)) || isEqual(itemDate, parseISO(endDate));

      return afterStart && beforeEnd;
    });
  }, [account, startDate, endDate]);

  const totalAmount = useMemo(() => {
  return filteredAccounts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}, [filteredAccounts]);

  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCash = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
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
  if (loading) return <p className="text-center mt-16">Loading...</p>;
  return (
    <div className=" md:p-2">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-primary flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-primary text-2xl" />
            Fund Transfer
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
            <Link to="/tramessy/account/CashDispatchForm">
              <button className="bg-gradient-to-r from-primary to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Dispatch
              </button>
            </Link>
          </div>
        </div>
        {/* filter */}
        {showFilter && (
                  <div className="md:flex items-center gap-5 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
                    <div className="relative w-full">
                      <label className="block mb-1 text-sm font-medium">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
                      />
                    </div>
                    <div className="relative w-full">
                      <label className="block mb-1 text-sm font-medium">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
                      />
                    </div>
                    <div className=" mt-5">
                      <button
                        onClick={() => {
                          setStartDate("");
                          setEndDate("");
                          setShowFilter(false);
                        }}
                        className="bg-gradient-to-r from-primary to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
                      >
                        <FiFilter/> Clear
                      </button>
                    </div>
                  </div>
                )}

        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary text-white capitalize text-xs">
              <tr>
                <th className="p-2">SL</th>
                <th className="p-2">Date</th>
                <th className="p-2">Branch</th>
                <th className="p-2">PersonName</th>
                <th className="p-2">Type</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Bank Name</th>
                {/* <th className="p-2">Ref</th> */}
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-primary ">
              { currentCash.length === 0?(
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No cash found
                  </td>
                  </tr>
              )
              :(currentCash?.map((dt, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition-all border border-gray-200"
                >
                  <td className="p-2 font-bold">{indexOfFirstItem + i + 1}</td>
                  {dt.date ? format(parseISO(dt.date), "dd-MMMM-yyyy") : ""}
                  <td className="p-2">{dt.branch_name}</td>
                  <td className="p-2">{dt.person_name}</td>
                  <td className="p-2">{dt.type}</td>
                  <td className="p-2">{dt.amount}</td>
                  <td className="p-2">{dt.bank_name}</td>
                  {/* <td className="p-2">{dt.ref}</td> */}
                  <td className="p-2 action_column">
                    <div className="flex gap-1">
                      <Link to={`/tramessy/account/update-CashDispatch/${dt.id}`}>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      {/* <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                        <FaEye className="text-[12px]" />
                      </button>
                      <button className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                        <FaTrashAlt className="text-[12px]" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              )))
              }
            </tbody>
            {currentCash.length > 0 && (
      <tfoot className="bg-gray-100 font-bold">
        <tr>
          <td colSpan="5" className="p-2 text-right">Total:</td>
          <td className="p-2">{totalAmount}</td>
          <td colSpan="2"></td>
        </tr>
      </tfoot>
    )}
          </table>
        </div>
        {/* pagination */}
        {currentCash.length > 0 && totalPages >= 1 && (
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

export default CashDispatch;
