
import { useEffect, useState, useRef } from "react";
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6";
import axios from "axios";
import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import { tableFormatDate } from "../../components/Shared/formatDate";
import DatePicker from "react-datepicker";
import toNumber from "../../hooks/toNumber";

const SelectCustomerLadger = ({ customer, selectedCustomerName }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const tableRef = useRef();
  const [customerList, setCustomerList] = useState([]);

  // Fetch customer list with dues
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
      .then(res => {
        if (res.data.status === "Success") {
          setCustomerList(res.data.data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Find selected customer due
  const selectedCustomer = customerList.find(
    cust => cust.customer_name === selectedCustomerName
  );
  const dueAmount = selectedCustomer ? toNumber(selectedCustomer.due) : 0;

  // filter date 
  const filteredLedger = customer.filter((entry) => {
    const entryDate = new Date(entry.bill_date).setHours(0,0,0,0);
    const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
    const end = endDate ? new Date(endDate).setHours(0,0,0,0) : null;

    if (start && !end) {
      return entryDate === start;
    } else if (start && end) {
      return entryDate >= start && entryDate <= end;
    } else {
      return true;
    }
  });

  // Calculate totals including opening balance
  // const totals = filteredLedger.reduce(
  //   (acc, item) => {
  //     const demurrage = toNumber(item.d_total || 0);
  //     acc.rent += toNumber(item.bill_amount || 0);
  //     acc.rec_amount += toNumber(item.rec_amount || 0);
  //     return acc;
  //   },
  //   { rent: 0,  rec_amount: 0}
  // );
  const totals = filteredLedger.reduce(
  (acc, item) => {
    const totalRent = toNumber(item.total_rent || 0);
    const demurrage = toNumber(item.d_total || 0);
    const bill = toNumber(item.bill_amount || 0);
    const received = toNumber(item.rec_amount || 0);

    // add demurrage total separately
    acc.d_total += demurrage;
acc.total_rent += totalRent;
    // total bill amount includes demurrage
    acc.rent += bill + demurrage;
    acc.rec_amount += received;
    return acc;
  },
  { rent: 0, rec_amount: 0, d_total: 0, total_rent: 0 }
);
  // Now calculate due from total trip - advance - pay_amount
totals.due = toNumber(totals.rent)  - toNumber(totals.rec_amount);

  const grandDue =  totals.due+dueAmount;

  const totalRent = filteredLedger.reduce(
    (sum, entry) => sum + toNumber(entry.rec_amount || 0),
    0
  );

  const customerName = filteredLedger[0]?.customer_name || "All Customers";
//  Excel Export - Table er moto same to same
const exportToExcel = () => {
  let cumulativeDue = dueAmount; // Opening Balance

  const rows = filteredLedger.map((item, index) => {
    const totalRent = toNumber(item.total_rent || 0);
    const receivedAmount = toNumber(item.rec_amount || 0);
    const billAmount = toNumber(item.bill_amount || 0) + toNumber(item.d_total || 0);

    cumulativeDue += billAmount;
    cumulativeDue -= receivedAmount;

    return {
      SL: index + 1,
      Date: tableFormatDate(item.bill_date),
      Customer: item.customer_name,
      Load: item.load_point || "--",
      Unload: item.unload_point || "--",
      Vehicle: item.vehicle_no || "--",
      Driver: item.driver_name || "--",
      "Total Rent": totalRent || "--",
      Demurrage: toNumber(item.d_total)|| "--",
      "Bill Amount": billAmount || 0,
      "Received Amount": receivedAmount || 0,
      "Due": cumulativeDue,
    };
  });

  // Add total row
  rows.push({
    SL: "",
    Date: "",
    Customer: "",
    Load: "",
    Unload: "",
    Vehicle: "",
    Driver: "Total",  
    "Total Rent": toNumber(totals.total_rent), 
    Demurrage: toNumber(totals.d_total),
    "Bill Amount": toNumber(totals.rent),
    "Received Amount": toNumber(totals.rec_amount),
    "Due": toNumber(grandDue),
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
  XLSX.writeFile(workbook, `${customerName}-Ledger.xlsx`);
};

//  PDF Export - Table er moto same to same
const exportToPDF = () => {
  let cumulativeDue = dueAmount; // Opening Balance

  const tableBody = [
    [
      "SL.",
      "Date",
      "Customer",
      "Load/Unload",
      "Vehicle",
      "Driver",
      "Total Rent",
      "Demurrage",
      "Bill Amount",
      "Received Amount",
      "Due",
    ],
    ...filteredLedger.map((item, index) => {
      const billAmount = toNumber(item.bill_amount || 0);
      const receivedAmount = toNumber(item.rec_amount || 0);
      cumulativeDue += billAmount;
      cumulativeDue -= receivedAmount;

      return [
        index + 1,
        tableFormatDate(item.bill_date),
        item.customer_name,
        `${item.load_point || "--"} / ${item.unload_point || "--"}`,
        item.vehicle_no || "--",
        item.driver_name || "--",
        item.total_rent || 0,
        toNumber(item.d_total) || 0,
        billAmount || 0,
        receivedAmount || 0,
        cumulativeDue,
      ];
    }),
    [
      "",
      "",
      "",
      "",
      "",
      "Total",
      totals.total_rent,
      totals.d_total,
      totals.rent,
      totals.rec_amount,
      grandDue,
    ],
  ];

  const docDefinition = {
    content: [
      { text: `${customerName} Ledger`, style: "header" },
      {
        table: {
          headerRows: 1,
          widths: [25, 60, "*", "*", "*", "*", "", "", 60, 70, 60],
          body: tableBody,
        },
        layout: "lightHorizontalLines",
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
    },
    pageOrientation: "landscape",
  };

  pdfMake.createPdf(docDefinition).download(`${customerName}-Ledger.pdf`);
};
// Print - Table 
  const handlePrint = () => {
  const printContent = tableRef.current;
  const printWindow = window.open("", "", "width=900,height=600");

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Ledger</title>
        <style>
          table, th, td {
            border: 1px solid black !important;
            border-collapse: collapse !important;
          }
          th, td {
            padding: 6px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};


  return (
    <div className="md:p-4">
      <div className="w-xs md:w-full overflow-x-auto">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B]">
            {filteredLedger.length > 0
              ? filteredLedger[0].customer_name
              : "All Customers"} Ledger
          </h1>
        </div>

        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-2 px-5 bg-gray-50 hover:bg-primary text-primary hover:text-white rounded-md shadow-md shadow-green-200 transition-all duration-300"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 py-2 px-5 bg-gray-50 hover:bg-primary text-primary hover:text-white rounded-md shadow-md shadow-amber-200 transition-all duration-300"
            >
              <FaFilePdf /> PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-2 px-5 bg-gray-50 hover:bg-primary text-primary hover:text-white rounded-md shadow-md shadow-blue-200 transition-all duration-300"
            >
              <FaPrint /> Print
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {showFilter && (
          <div className="flex gap-4 border border-gray-300 rounded-md p-5 mb-5">
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
          </div>
        )}

        {loading ? (
          <p className="text-center mt-16">Loading...</p>
        ) : (
          <div ref={tableRef}>
            <table className="min-w-full text-sm text-left text-gray-900">
              <thead className="bg-gray-100 text-gray-800 font-bold">
                <tr className="font-bold bg-gray-50">
    <td colSpan={7} className="border border-black px-2 py-1 text-right">
      Total 
    </td>
    <td className="border border-black px-2 py-1 text-right">
      ৳{totals.total_rent}
    </td>
     <td className="border border-black px-2 py-1 text-right">
      ৳{totals.d_total}
    </td>
    <td className="border border-black px-2 py-1 text-right">
      ৳{totals.rent}
    </td>
    <td className="border border-black px-2 py-1 text-right">
      ৳{totals.rec_amount}
    </td>
    <td className="border border-black px-2 py-1 text-right">
      ৳{totals.due}
    </td>
  </tr>
                <tr>
                <th className="border px-2 py-1">SL.</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Customer</th>
                <th className="border px-2 py-1">Load</th>
                <th className="border px-2 py-1">Unload</th>
                <th className="border px-2 py-1">Vehicle</th>
                <th className="border px-2 py-1">Driver</th>
                 <th className="border px-2 py-1">Total Rent</th>
                <th className="border px-2 py-1">Demurrage Amount</th>
            <th className="border px-2 py-1">Bill Amount</th>
                <th className="border px-2 py-1">Recieved Amount</th>
                <th className="border border-gray-700 px-2 py-1">
                    {selectedCustomerName && (
                      <p className="text-sm font-medium text-gray-800">
                        Opening Amount: ৳{dueAmount}
                      </p>
                    )}
                    Due 
                  </th>
              </tr>
              </thead>
              <tbody>
  {(() => {
    let cumulativeDue = dueAmount; // Opening balance
    return filteredLedger.map((item, idx) => {
            const d_total = toNumber(item.d_total|| 0);
      // const billAmount = parseFloat(item.bill_amount || 0);
      const receivedAmount = toNumber(item.rec_amount || 0);
const billAmount = toNumber(item.bill_amount || 0) + toNumber(item.d_total || 0);

      cumulativeDue += billAmount;
      cumulativeDue -= receivedAmount;

      return (
        <tr key={idx}>
          <td className="border px-2 py-1">{idx + 1 }</td>
          <td className="border px-2 py-1">{tableFormatDate(item.bill_date)}</td>
          <td className="border px-2 py-1">{item.customer_name}</td>
          <td className="border px-2 py-1">
            {item.load_point || <span className="flex justify-center items-center">--</span>}
          </td>
          <td className="border px-2 py-1">
            {item.unload_point || <span className="flex justify-center items-center">--</span>}
          </td>
          <td className="border px-2 py-1">
            {item.vehicle_no || <span className="flex justify-center items-center">--</span>}
          </td>
          <td className="border px-2 py-1">
            {item.driver_name || <span className="flex justify-center items-center">--</span>}
          </td>
          <td className="border px-2 py-1">
            {item.total_rent? item.total_rent : "--"}
          </td>
          <td className="border px-2 py-1">
            {d_total? d_total : "--"}
          </td>
          <td className="border px-2 py-1">
            {billAmount ? billAmount : "--"}
          </td>
          <td className="border px-2 py-1">
            {receivedAmount ? receivedAmount : "--"}
          </td>
          <td className="border px-2 py-1">
            {cumulativeDue}
          </td>
        </tr>
      );
    });
  })()}
</tbody>

             <tfoot>
  
  {/* <tr className="font-bold bg-blue-100">
    <td colSpan={9} className="border border-black px-2 py-1 text-right">
      Final Due (Opening Due +)
    </td>
    <td className="border border-black px-2 py-1 text-right text-black">
      ৳{grandDue}
    </td>
  </tr> */}
</tfoot>

            </table>

            {/* Pagination */}
            {/* {pageCount > 1 && (
              <div className="mt-4 flex justify-center">
                <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  breakLabel={"..."}
                  pageCount={pageCount}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={handlePageClick}
                  containerClassName={"flex items-center gap-1"}
                  pageClassName={"px-3 py-1 border rounded hover:bg-gray-100 hover:text-black cursor-pointer"}
                  previousClassName={"px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"}
                  nextClassName={"px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"}
                  breakClassName={"px-3 py-1"}
                  activeClassName={"bg-primary text-white border-primary"}
                  forcePage={currentPage}
                />
              </div>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectCustomerLadger;