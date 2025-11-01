
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

const DailyTripExpense = () => {
  const [showFilter, setShowFilter] = useState(false)
  // Date filter state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [trip, setTrip] = useState([])
  const [loading, setLoading] = useState(true)
  // search
  const [searchTerm, setSearchTerm] = useState("")
  // pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          // Sort by date, assuming 'date' is the correct property
          const sorted = response.data.data.sort((a, b) => new Date(b.date) - new Date(a.date))
          setTrip(sorted)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error)
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="text-center mt-16">Loading trip...</p>


  // Correct headers matching your table
  const headers = [
    { label: "#", key: "index" },
    { label: "Date", key: "date" }, // Changed trip_date to date
    { label: "vehicle no", key: "vehicle_no" }, // Changed vehicle_number to vehicle_no
    { label: "Driver", key: "driver_name" },
    { label: "Rent", key: "total_rent" }, // Changed trip_price to total_rent
    { label: "Expense", key: "total_exp" }, // Changed totalCost to total_exp
    { label: "total Expense", key: "totalTripCost" },
  ]

  // Correct CSV data mapping
  const csvData = trip.map((item, index) => {
    const totalRent = Number.parseFloat(item.total_rent ?? "0") || 0 // Changed trip_price to total_rent
    const totalExp = Number.parseFloat(item.total_exp ?? "0") || 0 // Using total_exp directly
    const totalTripCost = (totalRent + totalExp)

    return {
      index: index + 1,
      date: new Date(item.date).toLocaleDateString("en-GB"), // Changed trip_date to date
      vehicle_no: item.vehicle_no, // Changed vehicle_number to vehicle_no
      driver_name: item.driver_name,
      total_rent: totalRent, // Changed trip_price to total_rent
      total_exp: totalExp, // Using total_exp directly
      totalTripCost,
    }
  })

  // export functions
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expense Data")
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })
    const data = new Blob([excelBuffer], { type: "application/octet-stream" })
    saveAs(data, "expense_data.xlsx")
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    const tableColumn = headers.map((h) => h.label)
    const tableRows = csvData.map((row) => headers.map((h) => row[h.key]))
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { font: "helvetica", fontSize: 8 },
    })
    doc.save("expense_data.pdf")
  }

  const printTable = () => {
    // hide specific column
    const actionColumns = document.querySelectorAll(".action_column")
    actionColumns.forEach((col) => {
      col.style.display = "none"
    })
    const printContent = document.querySelector("table").outerHTML
    const WinPrint = window.open("", "", "width=900,height=650")
    WinPrint.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `)
    WinPrint.document.close()
    WinPrint.focus()
    WinPrint.print()
    WinPrint.close()
  }

  // search and filter
  const filteredExpense = trip.filter((dt) => {
    const term = searchTerm.toLowerCase()
    const tripDate = dt.date // Changed trip_date to date

    const matchesSearch =
      dt.date
        ?.toLowerCase()
        .includes(term) || // Changed trip_date to date
      dt.trip_time?.toLowerCase().includes(term) ||
      dt.load_point?.toLowerCase().includes(term) ||
      dt.unload_point?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term) ||
      dt.driver_mobile?.toLowerCase().includes(term) || // Changed driver_contact to driver_mobile
      String(dt.driver_commission).includes(term) || // Changed driver_percentage to driver_commission
      String(dt.fuel_cost).includes(term) || // Changed fuel_price to fuel_cost
      // Removed gas_price as it's not in AddTripForm
      String(dt.vehicle_no).includes(term) || // Changed vehicle_number to vehicle_no
      String(dt.others).includes(term) || // Changed other_expenses to others
      String(dt.total_rent).includes(term) || // Changed trip_price to total_rent
      String(dt.total_exp).includes(term) // Added total_exp for search

    const matchesDateRange =
      (!startDate || new Date(tripDate) >= new Date(startDate)) && (!endDate || new Date(tripDate) <= new Date(endDate))
    return matchesSearch && matchesDateRange
  })

  // pagination
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTrip = filteredExpense.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredExpense.length / itemsPerPage)


  return (
    <main className="md:p-2">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            Trip Expense List
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)} // Toggle filter
              className=" text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>
        {/* export */}
        <div className="md:flex justify-between items-center">
          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <CSVLink
              data={csvData}
              headers={headers}
              filename={"dailyExpense_data.csv"}
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
          <div className="mt-3 md:mt-0">
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
          </div>
        </div>
        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> Filter
              </button>
            </div>
          </div>
        )}
        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary text-white capitalize text-xs">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Vehicle No.</th>
                <th className="px-4 py-3">Driver's Name</th>
                <th className="px-4 py-3">Trip Cost</th>
                <th className="px-4 py-3">Other Expenses</th>
                <th className="px-4 py-3">Total Cost</th>
                {/* <th className="px-4 py-3 action_column">Action</th> */}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentTrip.length === 0 ? (
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
                      No Expense data found.
                    </div>
                  </td>
                </tr>
              ) : (
                currentTrip?.map((item, index) => {
                  const totalRent = Number.parseFloat(item.total_rent ?? "0") || 0
                  const totalExp = Number.parseFloat(item.total_exp ?? "0") || 0
                  const totalTripCost = (totalRent + totalExp)

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-4 py-4 font-bold">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-4">{item.date}</td> {/* Changed trip_date to date */}
                      <td className="px-4 py-4">{item.vehicle_no}</td> {/* Changed vehicle_number to vehicle_no */}
                      <td className="px-4 py-4">{item.driver_name}</td>
                      <td className="px-4 py-4">{totalRent}</td> {/* Changed trip_price to total_rent */}
                      <td className="px-4 py-4">{totalExp}</td> {/* Changed totalCost to total_exp */}
                      <td className="px-4 py-4">{totalTripCost}</td>
                      {/* <td className="action_column">
                        <div className="flex justify-center">
                          <Link to={`/UpdateExpenseForm/${item.id}`}>
                            <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                              <FaPen className="text-[12px]" />
                            </button>
                          </Link>
                        </div>
                      </td> */}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {/* pagination */}
      {currentTrip.length > 0 && totalPages >= 1 && (
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

export default DailyTripExpense