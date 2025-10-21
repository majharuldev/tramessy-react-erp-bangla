
import { useEffect, useState } from "react"
import axios from "axios"
import { FaTruck, FaFilter, FaPen, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa"
import { GrFormNext, GrFormPrevious } from "react-icons/gr"
import { Link } from "react-router-dom"
// export
import { CSVLink } from "react-csv"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { saveAs } from "file-saver"
import Pagination from "../components/Shared/Pagination"
import { tableFormatDate } from "../components/Shared/formatDate"
import DatePicker from "react-datepicker"

const DailyIncome = () => {
  const [trips, setTrips] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  // Date filter state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  // search
  const [searchTerm, setSearchTerm] = useState("")
  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedVehicle, setSelectedVehicle] = useState("");


  // Fetch data
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
        const sorted = res.data.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date), // Changed trip_date to date
        )
        setTrips(sorted)
      } catch (err) {
        console.error("Error fetching trips:", err)
      }
    }
    fetchTrips()
  }, [])

  // customers data   
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

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

  // search and filter
  // search off, only filter by date + customer + vehicle
  const filteredIncome = trips.filter((dt) => {
    const tripDate = new Date(dt.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchesDate =
      (start && end && tripDate >= start && tripDate <= end) ||
      (start && tripDate.toDateString() === start.toDateString()) ||
      (!start && !end);

    const matchesCustomer =
      !selectedCustomer || dt.customer?.toLowerCase() === selectedCustomer.toLowerCase()

    // vehicle filter (dropdown বা input field নিলে সেভাবে handle করতে হবে)
    const matchesVehicle =
      !selectedVehicle || dt.vehicle_no?.toLowerCase() === selectedVehicle.toLowerCase();

    return matchesDate && matchesCustomer && matchesVehicle;
  });


  // Correct headers matching your table
  const headers = [
    { label: "#", key: "index" },
    { label: "Date", key: "date" },
    { label: "Customer", key: "customer" },
    { label: "Vehicle", key: "vehicle_no" },
    { label: "Load", key: "load_point" },
    { label: "Unload", key: "unload_point" },
    { label: "Trip Rent", key: "total_rent" },
    { label: "Expense", key: "total_exp" },
    { label: "Profit", key: "profit" },
  ]

  // Correct CSV data mapping
  // CSV data for export
  const csvData = filteredIncome.map((dt, index) => {
    const totalRent = Number.parseFloat(dt.total_rent ?? "0") || 0
    const totalExp = Number.parseFloat(dt.total_exp ?? "0") || 0
    const profit = (totalRent - totalExp)

    return {
      index: index + 1,
      date: new Date(dt.date).toLocaleDateString("en-GB"),
      customer: dt.customer,
      vehicle_no: dt.vehicle_no,
      load_point: dt.load_point,
      unload_point: dt.unload_point,
      total_rent: totalRent,
      total_exp: totalExp,
      profit: profit,
    }
  })


  // Export Excel function
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "FilteredTrips")
    XLSX.writeFile(workbook, "filtered_trips.xlsx")
  }
//   const exportExcel = () => {
//   const workbook = XLSX.utils.book_new()

//   // Create worksheet from csvData
//   const worksheet = XLSX.utils.json_to_sheet(csvData)

//   // Calculate last row number (header row is 1)
//   const lastRow = csvData.length + 2 // 1 for header, +1 to point to next row

//   // Add formulas for totals
//   worksheet[`G${lastRow}`] = { f: `SUM(G2:G${lastRow - 1})` } // Trip Rent
//   worksheet[`H${lastRow}`] = { f: `SUM(H2:H${lastRow - 1})` } // Expense
//   worksheet[`I${lastRow}`] = { f: `SUM(I2:I${lastRow - 1})` } // Profit

//   // Optional: label in first column
//   worksheet[`A${lastRow}`] = { v: "Total" }

//   XLSX.utils.book_append_sheet(workbook, worksheet, "FilteredTrips")
//   XLSX.writeFile(workbook, "filtered_trips.xlsx")
// }

  // Export PDF function
  const exportPDF = () => {
    const doc = new jsPDF()
    const tableColumn = headers.map((h) => h.label)
    const tableRows = csvData.map((row) => headers.map((h) => row[h.key]))

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { font: "helvetica", fontSize: 8 },
    })

    doc.save("filtered_trips.pdf")
  }

  // Print function
  const printTable = () => {
    const doc = new jsPDF()
    const tableColumn = headers.map((h) => h.label)
    const tableRows = csvData.map((row) => headers.map((h) => row[h.key]))

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { font: "helvetica", fontSize: 8 },
    })

    doc.autoPrint()
    window.open(doc.output("bloburl"), "_blank")
  }

  // মোট যোগফল বের করা
  const totalRent = filteredIncome.reduce(
    (sum, trip) => sum + Number(trip.total_rent || 0),
    0
  );

  const totalExpense = filteredIncome.reduce(
    (sum, trip) => sum + Number(trip.total_exp || 0),
    0
  );

  const totalProfit = totalRent - totalExpense;

  // pagination
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTrips = filteredIncome.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredIncome.length / itemsPerPage)

  return (
    <main className="md:p-2">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            Income List
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>
        {/* Export & Search */}
        <div className="md:flex justify-between items-center">
          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <CSVLink
              data={csvData}
              headers={headers}
              filename={"dailyincome_data.csv"}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-cyan-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              CSV
            </CSVLink>
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              Excel
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              PDF
            </button>
            <button
              onClick={printTable}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              Print
            </button>
          </div>
          {/* search */}
          {/* <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
          </div> */}
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
            <select
              value={selectedCustomer}
              onChange={(e) => {
                setSelectedCustomer(e.target.value)
                setCurrentPage(1);
              }}
              className=" flex-1 min-w-0 text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.customer_name}>
                  {c.customer_name}
                </option>
              ))}
            </select>
            <select
              value={selectedVehicle}
              onChange={(e) => {
                setSelectedVehicle(e.target.value);
                setCurrentPage(1);
              }}
              className=" flex-1 min-w-0 text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value="">Select Vehicle</option>
              {trips.map((t, i) => (
                <option key={i} value={t.vehicle_no}>
                  {t.vehicle_no}
                </option>
              ))}
            </select>

            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setStartDate("");
                  setEndDate("");
                  setSelectedCustomer("");
                  setShowFilter(false);
                  setSelectedVehicle("");
                }
                }
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> Clear
              </button>
            </div>
          </div>
        )}
        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-xs">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Load</th>
                <th className="px-4 py-3">Unload</th>
                {/* <th className="px-4 py-3">Customer</th> */}
                <th className="px-4 py-3">Trip Price</th>
                {/* <th className="px-4 py-3">Fine</th> */}
                <th className="px-4 py-3">Ongoing Expense</th>
                <th className="px-4 py-3">Profit</th>
                {/* <th className="px-4 py-3 action_column">Action</th> */}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentTrips.length === 0 ? (
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
                      No Income data found.
                    </div>
                  </td>
                </tr>
              ) : (
                currentTrips.map((trip, index) => (
                  <tr key={trip.id || index} className="hover:bg-gray-50 transition-all">
                    <td className="px-4 py-4 font-bold">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-4">
                      {tableFormatDate(trip.date)}
                    </td>
                    <td className="px-4 py-4">{trip.customer}</td>
                    <td className="px-4 py-4">{trip.vehicle_no}</td>
                    <td className="px-4 py-4">{trip.load_point}</td>
                    <td className="px-4 py-4">{trip.unload_point}</td>
                    <td className="px-4 py-4">{trip.total_rent}</td>
                    <td className="px-4 py-4">
                      {Number(trip.total_exp || 0)}
                    </td>
                    <td className="px-4 py-4">
                      {(Number(trip.total_rent || 0) - Number(trip.total_exp || 0))}{" "}
                      {/* Corrected profit calculation */}
                    </td>
                    {/* <td className="action_column">
                      <div className="flex justify-center">
                        <Link to={`/UpdateDailyIncomeForm/${trip.id}`}>
                          <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                            <FaPen className="text-[12px]" />
                          </button>
                        </Link>
                      </div>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
            {/* ✅ মোট যোগফল row */}
            {currentTrips.length > 0 && (
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan="6" className="text-right px-4 py-3">Total:</td>
                  <td className="px-4 py-3">{totalRent}</td>
                  <td className="px-4 py-3">{totalExpense}</td>
                  <td className="px-4 py-3">{totalProfit}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {/* pagination */}
        {currentTrips.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>
    </main>
  )
}

export default DailyIncome