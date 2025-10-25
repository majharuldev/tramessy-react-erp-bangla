import { useEffect, useState, useRef } from "react";
import { FaFilter, FaUserSecret, FaFilePdf, FaPrint, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../../components/Shared/Pagination";
import DatePicker from "react-datepicker";
import toNumber from "../../hooks/toNumber";

const PurchaseReport = () => {
  const [purchases, setPurchases] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const reportRef = useRef();

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load purchase data
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`)
      .then(res => {
        if (res.data.status === "Success") {
          setPurchases(res.data.data);
        }
      });
  }, []);

  // Filter Logic
  const filteredPurchases = purchases.filter(p => {
    const dateMatch =
      (!startDate || new Date(p.date) >= new Date(startDate)) &&
      (!endDate || new Date(p.date) <= new Date(endDate));
    const supplierMatch = !supplierFilter || p.supplier_name === supplierFilter;
    const categoryMatch = !categoryFilter || p.category === categoryFilter;
    const searchMatch =
      !searchTerm ||
      p.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return dateMatch && supplierMatch && categoryMatch && searchMatch;
  });

  // Summary calculations
  const totalAmount = filteredPurchases.reduce(
    (sum, p) => sum + (toNumber(p.purchase_amount) || (toNumber(p.quantity) * toNumber(p.unit_price))),
    0
  );

  const topSupplier = (() => {
    const supplierTotals = {};
    filteredPurchases.forEach(p => {
      supplierTotals[p.supplier_name] =
        (supplierTotals[p.supplier_name] || 0) +
        (toNumber(p.purchase_amount) || (toNumber(p.quantity) * toNumber(p.unit_price)));
    });
    return Object.entries(supplierTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  })();

  const topCategory = (() => {
    const categoryTotals = {};
    filteredPurchases.forEach(p => {
      categoryTotals[p.category] =
        (categoryTotals[p.category] || 0) +
        (toNumber(p.purchase_amount) || (toNumber(p.quantity) * toNumber(p.unit_price)));
    });
    return Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  })();



  // Export to Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredPurchases);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Report");
    XLSX.writeFile(wb, "purchase_report.xlsx");
  };

  // Export to PDF
  // const exportPdf = () => {
  //   const doc = new jsPDF();
  //   const title = "Purchase Report";

  //   // Add title
  //   doc.setFontSize(16);
  //   doc.text(title, 14, 16);

  //   // Add summary information
  //   doc.setFontSize(10);
  //   doc.text(`Total Purchases: ${filteredPurchases.length}`, 14, 26);
  //   doc.text(`Total Amount: ${totalAmount.toLocaleString()} ৳`, 14, 32);
  //   doc.text(`Top Supplier: ${topSupplier}`, 14, 38);
  //   doc.text(`Top Category: ${topCategory}`, 14, 44);

  //   // Add table
  //   const headers = [
  //     "#", 
  //     "Date", 
  //     "Supplier", 
  //     "Category", 
  //     "Item", 
  //     "Qty", 
  //     "Unit Price", 
  //     "Total"
  //   ];

  //   const data = filteredPurchases.map((p, i) => [
  //     i + 1,
  //     p.date,
  //     p.supplier_name,
  //     p.category,
  //     p.item_name,
  //     p.quantity,
  //     p.unit_price,
  //     p.purchase_amount ?? (p.quantity * p.unit_price)
  //   ]);

  //   doc.autoTable({
  //     head: [headers],
  //     body: data,
  //     startY: 50,
  //     styles: {
  //       fontSize: 8,
  //       cellPadding: 2,
  //       halign: 'center'
  //     },
  //     headStyles: {
  //       fillColor: [17, 55, 91],
  //       textColor: 255
  //     }
  //   });

  //   doc.save('purchase_report.pdf');
  // };

  const exportPdf = () => {
    const doc = new jsPDF();
    const title = "Purchase Report";

    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 16);

    // Add summary information
    doc.setFontSize(10);
    doc.text(`Total Purchases: ${filteredPurchases.length}`, 14, 26);
    doc.text(`Total Amount: ${totalAmount.toLocaleString()} ৳`, 14, 32);
    doc.text(`Top Supplier: ${topSupplier}`, 14, 38);
    doc.text(`Top Category: ${topCategory}`, 14, 44);

    // Add table
    const headers = [
      ["#", "Date", "Supplier", "Category", "Item", "Qty", "Unit Price", "Total"]
    ];

    const data = filteredPurchases.map((p, i) => [
      i + 1,
      p.date,
      p.supplier_name,
      p.category,
      p.item_name,
      p.quantity,
      p.unit_price,
      p.purchase_amount ?? (p.quantity * p.unit_price)
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: "center"
      },
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: 255
      }
    });

    doc.save("purchase_report.pdf");
  };


  // Simple print function
  const handlePrint = () => {
    // Generate table rows for all filtered purchases
    const rowsHtml = filteredPurchases.map((p, i) => `
    <tr>
      <td style="border:1px solid #ddd;padding:6px;text-align:center">${i + 1}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:center">${p.date}</td>
      <td style="border:1px solid #ddd;padding:6px">${p.supplier_name}</td>
      <td style="border:1px solid #ddd;padding:6px">${p.category}</td>
      <td style="border:1px solid #ddd;padding:6px">${p.item_name}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:right">${p.quantity}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:right">${p.unit_price}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:right">${p.purchase_amount ?? (p.quantity * p.unit_price)}</td>
    </tr>
  `).join("");

    // Totals row
    const totalsRow = `
    <tr style="font-weight:bold;background:#f0f0f0">
      <td colspan="5" style="border:1px solid #ddd;padding:6px;text-align:right">Total:</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:right">${totalQty}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:right">${totalUnitPrice}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:right">${totalAmountOverall}</td>
    </tr>
  `;

    const html = `
    <table style="width:100%;border-collapse:collapse">
      <thead style="background:#11375B;color:white">
        <tr>
          <th style="border:1px solid #ddd;padding:6px">#</th>
          <th style="border:1px solid #ddd;padding:6px">Date</th>
          <th style="border:1px solid #ddd;padding:6px">Supplier</th>
          <th style="border:1px solid #ddd;padding:6px">Category</th>
          <th style="border:1px solid #ddd;padding:6px">Item</th>
          <th style="border:1px solid #ddd;padding:6px">Qty</th>
          <th style="border:1px solid #ddd;padding:6px">Unit Price</th>
          <th style="border:1px solid #ddd;padding:6px">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        ${totalsRow}
      </tfoot>
    </table>
  `;

    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
    <html>
      <head>
        <title>Purchase Report</title>
      </head>
      <body>
        <h2>Purchase Report</h2>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        ${html}
      </body>
    </html>
  `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  // Grand totals for all filtered purchases
  // Grand totals for all filtered purchases
  const totalQty = filteredPurchases.reduce(
    (sum, p) => sum + (toNumber(p.quantity) || 0),
    0
  );
  const totalUnitPrice = filteredPurchases.reduce(
    (sum, p) => sum + (toNumber(p.unit_price) || 0),
    0
  );

  const totalAmountOverall = filteredPurchases.reduce(
    (sum, p) =>
      sum +
      ((toNumber(p.quantity) || 0) * (toNumber(p.unit_price) || 0)),
    0
  );

  // Weighted average unit price (if totalQty > 0)


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchase = filteredPurchases.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  return (
    <div className="md:p-2">
      <div
        ref={reportRef}
        className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-4 border border-gray-200"
      >
        {/* Title */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-primary flex items-center gap-3">
            <FaUserSecret className="text-primary text-2xl" />
            Purchase Report
          </h1>
          <button
            onClick={() => setShowFilter(prev => !prev)}
            className="bg-gradient-to-r from-primary to-blue-800 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2"
          >
            <FaFilter /> Filter
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded text-center">
            <p className="text-sm text-gray-500">Total Purchases</p>
            <p className="text-lg font-bold">{filteredPurchases.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded text-center">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-lg font-bold">{toNumber(totalAmount).toLocaleString()} ৳</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded text-center">
            <p className="text-sm text-gray-500">Top Supplier</p>
            <p className="text-lg font-bold">{topSupplier}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded text-center">
            <p className="text-sm text-gray-500">Top Category</p>
            <p className="text-lg font-bold">{topCategory}</p>
          </div>
        </div>

        {/* Filters */}
        {showFilter && (
          <div className="grid md:grid-cols-4 gap-4 border border-gray-300 rounded-md p-4 mb-6">
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
              value={supplierFilter}
              onChange={e => setSupplierFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Suppliers</option>
              {[...new Set(purchases.map(p => p.supplier_name))].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Categories</option>
              {[...new Set(purchases.map(p => p.category))].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Search + Export */}
        <div className="flex justify-between mb-4 flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              className="py-2 px-5 bg-gray-200 rounded hover:bg-primary hover:text-white flex items-center gap-2"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={exportPdf}
              className="py-2 px-5 bg-gray-200 rounded hover:bg-primary hover:text-white flex items-center gap-2"
            >
              <FaFilePdf /> PDF
            </button>
            <button
              onClick={handlePrint}
              className="py-2 px-5 bg-gray-200 rounded hover:bg-primary hover:text-white flex items-center gap-2"
            >
              <FaPrint /> Print
            </button>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-1"
            />
          </div>
          {/*  Clear button */}
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-9 top-[17rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Table */}
        <div id="purchaseReport" className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left ">
            <thead className="bg-primary text-white ">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Date</th>
                <th className="p-2">Supplier</th>
                <th className="p-2">Category</th>
                <th className="p-2">Item</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Unit Price</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody className=" text-primary ">
              {currentPurchase.map((p, i) => (
                <tr key={p.id} className="">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{p.date}</td>
                  <td className="p-2">{p.supplier_name}</td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2">{p.item_name}</td>
                  <td className="p-2">{p.quantity}</td>
                  <td className="p-2">{p.unit_price}</td>
                  <td className="p-2">{p.purchase_amount ?? (p.quantity * p.unit_price)}</td>
                </tr>
              ))}
              {currentPurchase.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-gray-500">No data found</td>
                </tr>
              )}
            </tbody>
            {currentPurchase.length > 0 && <tfoot className="bg-gray-100 font-bold">
              <tr>
                <td colSpan="5" className="text-right p-2">Total:</td>
                <td className="p-2">{totalQty}</td>
                <td className="p-2">{totalUnitPrice}</td>
                <td className="p-2">{totalAmountOverall}</td>
              </tr>
            </tfoot>}
          </table>
        </div>

        {/* Pagination */}
        {currentPurchase.length > 0 && totalPages >= 1 && (
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

export default PurchaseReport;