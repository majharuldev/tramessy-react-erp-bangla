import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { FaEye, FaFilter, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { FiFilter } from "react-icons/fi";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { HiCurrencyBangladeshi } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { format, parseISO, isAfter, isBefore, isEqual, isSameDay } from "date-fns";
import Pagination from "../../components/Shared/Pagination";
import DatePicker from "react-datepicker";
import { tableFormatDate } from "../../components/Shared/formatDate";

const CashDispatch = () => {
  const [account, setAccount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [branch, setBranch] = useState([])
  const [selectedPerson, setSelectedPerson] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
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
  // unique person list banano
  const personOptions = useMemo(() => {
    const persons = account.map((a) => a.person_name).filter(Boolean);
    return [...new Set(persons)]; // unique persons
  }, [account]);
const sortedAccount = [...account].sort((a, b) => new Date(b.date) - new Date(a.date));
  //  filter accounts by date range
  const filteredAccounts = useMemo(() => {
    return sortedAccount.filter((item) => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);

      // If only startDate is set, match exactly that date
      if (startDate && !endDate) {
        return isSameDay(itemDate, startDate);
      }

      // If only endDate is set, match exactly that date
      if (!startDate && endDate) {
        return isSameDay(itemDate, endDate);
      }

      // If both startDate and endDate are set, filter range
      if (startDate && endDate) {
      return (
        (isAfter(itemDate, startDate) || isSameDay(itemDate, startDate)) &&
        (isBefore(itemDate, endDate) || isSameDay(itemDate, endDate))
      );
    }
      // branch filter
      if (selectedBranch && item.branch_name !== selectedBranch) {
        return false;
      }
      // person filter
      if (selectedPerson && item.person_name !== selectedPerson) {
        return false;
      }

      // 🔎 search filter (check all fields)
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const values = Object.values(item).join(" ").toLowerCase();
        return values.includes(lowerSearch);
      }

      return true;
    });
  }, [account, startDate, endDate, selectedPerson, selectedBranch, searchTerm]);


  const totalAmount = useMemo(() => {
    return filteredAccounts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredAccounts]);

  // select branch from api
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => response.json())
      .then((data) => setBranch(data.data))
      .catch((error) => console.error("Error fetching branch name:", error))
  }, [])

  const branchOptions = branch.map((dt) => ({
    value: dt.branch_name,
    label: dt.branch_name,
  }))

  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCash = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

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
        {/* search */}
        <div className="flex justify-end">
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Product ..."
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
        {/* filter */}
        {showFilter && (
          <div className="md:flex items-center gap-5 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="flex-1 min-w-0">
              <label className="block mb-1 text-sm font-medium">
                Start Date
              </label>
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
              <label className="block mb-1 text-sm font-medium">End Date</label>
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
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value)
                  setCurrentPage(1);
                }}
                className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                <option value="">Select Branch</option>
                {branchOptions.map((c) => (
                  <option key={c.id} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium">Person</label>
              <select
                value={selectedPerson}
                onChange={(e) => {
                  setSelectedPerson(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                <option value="">Select Person</option>
                {personOptions.map((p, i) => (
                  <option key={i} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className=" mt-5">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setShowFilter(false);
                  setSelectedBranch("");
                  setSelectedPerson("")
                }}
                className="bg-gradient-to-r from-primary to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FiFilter /> Clear
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
                <th className="p-2">VehicleNo</th>
                <th className="p-2">VehicleCategory</th>
                <th className="p-2">PersonName</th>
                <th className="p-2">Type</th>
                <th className="p-2">CheckDate</th>
                <th className="p-2">CheckNo</th>
                <th className="p-2">Amount</th>
                <th className="p-2">BankName</th>
                <th className="p-2">Purpose</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-primary ">
              {currentCash.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-4 text-gray-500">
                    No cash found
                  </td>
                </tr>
              )
                : (currentCash?.map((dt, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <td className="p-2 font-bold">{indexOfFirstItem + i + 1}</td>
                    {tableFormatDate(dt.date)}
                    <td className="p-2">{dt.branch_name}</td>
                    <td className="p-2">{dt.vehicle_no}</td>
                    <td className="p-2">{dt.vehicle_category}</td>
                    <td className="p-2">{dt.person_name}</td>
                    <td className="p-2">{dt.type}</td>
                    <td className="p-2">{dt.check_date}</td>
                    <td className="p-2">{dt.check_no}</td>
                    <td className="p-2">{dt.amount}</td>
                    <td className="p-2">{dt.bank_name}</td>
                    <td className="p-2">{dt.purpose}</td>
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
