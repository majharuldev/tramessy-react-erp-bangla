
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaPen, FaTrashAlt, FaPlus, FaUsers } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable"; 
import Pagination from "../../components/Shared/Pagination";
import { SelectField } from "../../components/Form/FormFields";

const RoutePricing = () => {
  const [routePricing, setRoutePricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [unloadpoints, setUnloadpoints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    customer_name: "",
    vehicle_category: "",
    vehicle_size: "",
    load_point: "",
    unload_point: "",
    rate: "",
    vat: ""
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Fetch customers
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
      .then(res => {
        if (res.data.status === "Success") setCustomers(res.data.data);
      })
      .catch(console.error);
  }, []);

  // Fetch unload points
  useEffect(() => {
    axios.get("https://bdapis.vercel.app/geo/v2.0/upazilas")
      .then(res => {
        if (res.data.success) setUnloadpoints(res.data.data);
      })
      .catch(console.error);
  }, []);

  // Fetch route pricing
  useEffect(() => {
    fetchRoutePricingData();
  }, []);

  const fetchRoutePricingData = () => {
    axios.get(`${import.meta.env.VITE_BASE_URL}/api/rate/list`)
      .then(res => {
        if (res.data.status === "Success") setRoutePricing(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

 // Reset form & close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ customer_name: "", vehicle_category: "", load_point: "", vehicle_size:"", unload_point: "", rate: "" });
    setEditId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle add or update
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.load_point || !formData.unload_point || !formData.rate) {
      toast.error("Please fill in all fields");
      return;
    }

    const apiCall = editId
      ? axios.post(`${import.meta.env.VITE_BASE_URL}/api/rate/update/${editId}`, formData)
      : axios.post(`${import.meta.env.VITE_BASE_URL}/api/rate/create`, formData);

    apiCall
      .then(res => {
        if (res.data.status === "Success") {
          toast.success(editId ? "Route pricing updated!" : "Route pricing added!");
          closeModal();
          fetchRoutePricingData();
        } else {
          toast.error("Operation failed");
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Error occurred");
      });
  };

   const handleEdit = (item) => {
    setFormData({
      customer_name: item.customer_name,
      vehicle_category: item.vehicle_category,
      vehicle_size: item.vehicle_size,
      load_point: item.load_point,
      unload_point: item.unload_point,
      rate: item.rate
    });
    setEditId(item.id);
    setIsModalOpen(true);
  };

  //  Excel Export
  const exportTripsToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(routePricing);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RoutePricing");
    XLSX.writeFile(workbook, "RoutePricing.xlsx");
  };

  //  PDF Export
const exportTripsToPDF = () => {
  const doc = new jsPDF();
  doc.text("Route Pricing Report", 14, 10);
  autoTable(doc, {
    head: [["SL", "Customer", "Load Point", "Unload Point", "Rate"]],
    body: routePricing.map((dt, index) => [
      index + 1,
      dt.customer_name || "-",
      dt.vehicle_size,
      dt.load_point,
      dt.unload_point,
      dt.rate,
    ]),
  });
  doc.save("RoutePricing.pdf");
};

  //  Print

const printTripsTable = () => {
  const doc = new jsPDF();

  const table = document.querySelector("#pricingTable table");
  if (!table) {
    console.error("Table not found!");
    return;
  }

  const headers = [];
  table.querySelectorAll("thead tr th").forEach((th) => {
    if (th.innerText.trim() !== "Action") {
      headers.push(th.innerText.trim());
    }
  });

  const data = [];
  table.querySelectorAll("tbody tr").forEach((row) => {
    const rowData = [];
    row.querySelectorAll("td").forEach((td, idx) => {
      if (headers[idx]) {
        rowData.push(td.innerText.trim());
      }
    });
    if (rowData.length > 0) data.push(rowData);
  });

  autoTable(doc, {
    head: [headers],
    body: data,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { halign: "center" },
  });

  //  Save না করে সরাসরি Print Dialog ওপেন
  doc.autoPrint();
  window.open(doc.output("bloburl"), "_blank");
};


  const filteredData = routePricing.filter(item =>
    item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle_size?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.load_point?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unload_point?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rate?.toString().includes(searchTerm)
  );


  if (loading) return <p className="text-center mt-16">Loading...</p>;

  // Pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomer = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <main className="md:p-2">
      <Toaster />
      <div className="w-full max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-6 border border-gray-200">

        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaUsers className="text-[#11375B] text-2xl" />
            Customer Route Pricing 
          </h1>
          <button
              onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-1 rounded-md shadow-md flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <FaPlus /> Add Pricing
          </button>
        </div>
        {/* Filter and Search */}
         <div className="md:flex justify-between items-center mb-5">
          <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={exportTripsToExcel}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            <button
              onClick={exportTripsToPDF}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              PDF
            </button>
            <button
              onClick={printTripsTable}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
        {/* search */}
        <div className="mt-3 md:mt-0 relative">
  {/* <span className="text-primary font-semibold pr-3">Search: </span> */}
  <div className="relative w-full">
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }}
      placeholder="Search..."
      className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-7 w-full"
    />

    {/*  Clear button */}
    {searchTerm && (
      <button
        onClick={() => {
          setSearchTerm("");
          setCurrentPage(1);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
      >
        ✕
      </button>
    )}
  </div>
</div>

          </div>

        {/* Table */}
        <div id="pricingTable" className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-2">SL.</th>
                <th className="p-2">Customer</th>
                 <th className="p-2">Vehicle Category</th>
                <th className="p-2">Size</th>
                <th className="p-2">Load Point</th>
                <th className="p-2">Unload Point</th>
                <th className="p-2">Rate</th>
                {/* <th className="p-2">Vat</th> */}
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody className=" text-primary">
              {currentCustomer.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No customer found
                  </td>
                </tr>
              ) : currentCustomer.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 border border-gray-200">
                  <td className="p-2 font-bold">{indexOfFirstItem + index + 1}</td>
                  <td className="p-2">{dt.customer_name}</td>
                  <td className="p-2">{dt.vehicle_category}</td>
                  <td className="p-2">{dt.vehicle_size}</td>
                  <td className="p-2">{dt.load_point}</td>
                  <td className="p-2">{dt.unload_point}</td>
                  <td className="p-2">{dt.rate}</td>
                  {/* <td className="p-2">{dt.vat}</td> */}
                  <td className="p-2 flex gap-1">
                
                      <button  onClick={() => handleEdit(dt)} className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md">
                        <FaPen className="text-[12px]" />
                      </button>
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentCustomer.length > 0 && totalPages >= 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          maxVisible={8} 
        />
      )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg border border-gray-300">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              <IoMdClose className="text-2xl" />
            </button>
            <h2 className="text-xl font-bold text-[#11375B] mb-6 text-center">
              {editId ? "Update Route Pricing" : "Add Route Pricing"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="w-full">
                <label className="block text-gray-700 text-sm font-medium mb-1">Customer</label>
                <CreatableSelect
                  options={customers.map(c => ({ value: c.customer_name, label: c.customer_name }))}
                  value={formData.customer_name ? { value: formData.customer_name, label: formData.customer_name} : null}
                  onChange={selected => setFormData(prev => ({ ...prev, customer_name: selected?.value || "" }))}
                  isClearable
                  placeholder="Select or type customer"
                  className="focus:!outline-none focus:!ring-2 focus:!ring-primary"
                />
              </div>
              <div className="relative w-full">
  <label className="block text-gray-700 text-sm font-medium mb-1">
    Vehicle Category
  </label>
  <select
    name="vehicle_category"
    value={formData.vehicle_category}
  onChange={(e) =>
    setFormData((prev) => ({ ...prev, vehicle_category: e.target.value }))
  }
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    required
  >
   <option value="">Select Vehicle Category...</option>
    <option value="pickup">Pickup</option>
    <option value="covered_van">Covered Van</option>
    <option value="open_truck">Open Truck</option>
    <option value="trailer">Trailer</option>
    <option value="freezer_van">Freezer Van</option>
  </select>
</div>
              </div>
              <div className="flex gap-2">
                <div className="w-full">
                <label className="block text-gray-700 text-sm font-medium mb-1">Load Point</label>
                <CreatableSelect
                  options={customers.map(c => ({ value: c.customer_name, label: c.customer_name }))}
                  value={formData.load_point ? { value: formData.load_point, label: formData.load_point } : null}
                  onChange={selected => setFormData(prev => ({ ...prev, load_point: selected?.value || "" }))}
                  isClearable
                  placeholder="Select or type load"
                  className="focus:!ring-2 focus:!ring-primary"
                />
              </div>

              <div className="w-full">
                <label className="block text-gray-700 text-sm font-medium mb-1">Unload Point</label>
                <CreatableSelect
                  options={unloadpoints.map(c => ({ value: c.name, label: c.name }))}
                  value={formData.unload_point ? { value: formData.unload_point, label: formData.unload_point } : null}
                  onChange={selected => setFormData(prev => ({ ...prev, unload_point: selected?.value || "" }))}
                  isClearable
                  placeholder="Select or type unload"
                  className="focus:!ring-2 focus:!ring-primary"
                />
              </div>
              </div>             

              <div className="flex gap-2">
                <div className="w-full">
                <label className="block text-gray-700 text-sm font-medium mb-1">Vehicle Size</label>
                <input
                  type="text"
                  name="vehicle_size"
                  value={formData.vehicle_size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter 1 Ton/7 Feet"
                />
              </div>
                <div className="w-full">
                <label className="block text-gray-700 text-sm font-medium mb-1">Rate</label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter price"
                />
              </div>
              </div>
              {/* <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Vat</label>
                <input
                  type="number"
                  name="vat"
                  value={formData.vat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter vat"
                />
              </div> */}

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80">
                  {editId ? "Update Pricing" : "Add Pricing"}
                </button>
              </div>
            </form>
            </div>
            </div>
      )}
    </main>
  );
};

export default RoutePricing;
