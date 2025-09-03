import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaTruck, FaPlus, FaPen, FaEye, FaTrashAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
// export
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Pagination from "../components/Shared/Pagination";
const CarList = () => {
  const [vehicles, setVehicle] = useState([]);
  const [loading, setLoading] = useState(true);
  // get single car info by id
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCar, setselectedCar] = useState(null);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // search
  const [searchTerm, setSearchTerm] = useState("");
  const toggleModal = () => setIsOpen(!isOpen);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setVehicle(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);
  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/vehicle/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete driver");
      }
      // Remove car from local list
      setVehicle((prev) => prev.filter((driver) => driver.id !== id));
      toast.success("Vehicle deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedDriverId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  if (loading) return <p className="text-center mt-16">Loading vehicle...</p>;
  const csvData = vehicles.map((dt, index) => ({
    index: index + 1,
    driver_name: dt.driver_name,
    vehicle_name: dt.vehicle_name,
    category: dt.category,
    size: dt.size,
    registration_zone: dt.registration_zone,
    trip: 0,
    registration_number: dt.registration_number,
  }));
  // export
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "vehicles Data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "vehicles_data.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "#",
      "Driver Name",
      "Vehicle Name",
      "Vehicle Category",
      "Vehicle Size",
      "Vehicle No",
      "Status",
    ];
    const tableRows = filteredCarList.map((v, index) => [
      indexOfFirstItem + index + 1,
      v.driver_name,
      v.vehicle_name,
      v.vehicle_category,
      v.vehicle_size,
      `${v.registration_zone} ${v.registration_number}`,
      v.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: [255, 255, 255],
        halign: "left",
      },
      bodyStyles: {
        textColor: [17, 55, 91],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      theme: "grid",
    });

    doc.save("vehicles_data.pdf");
  };

  const printTable = () => {
  const tableHeader = `
    <thead>
      <tr>
        <th>#</th>
        <th>Driver Name</th>
        <th>Vehicle Name</th>
        <th>Vehicle Category</th>
        <th>Vehicle Size</th>
        <th>Vehicle No</th>
        <th>Status</th>
      </tr>
    </thead>
  `;

  const tableRows = filteredCarList.map((v, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${v.driver_name}</td>
      <td>${v.vehicle_name}</td>
      <td>${v.vehicle_category}</td>
      <td>${v.vehicle_size}</td>
      <td>${v.registration_zone} ${v.registration_number}</td>
      <td>${v.status}</td>
    </tr>
  `).join("");

  const printContent = `
    <table border="1" cellspacing="0" cellpadding="6">
      ${tableHeader}
      <tbody>${tableRows}</tbody>
    </table>
  `;

  const WinPrint = window.open("", "", "width=1200,height=800");
  WinPrint.document.write(`
    <html>
    <head><title>Print</title></head>
    <body>
      <h2 style="text-align:center;">Vehicle Full Details</h2>
      ${printContent}
    </body>
    </html>
  `);

  WinPrint.document.close();
  WinPrint.focus();
  WinPrint.print();
  WinPrint.close();
};

  
  const handleViewCar = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/vehicle/show/${id}`
      );
      if (response.data.status === "Success") {
        setselectedCar(response.data.data);
        setViewModalOpen(true);
      } else {
        toast.error("Vehicle information could not be loaded.");
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("Vehicle information could not be loaded.");
    }
  };
  // search
  const filteredCarList = vehicles.filter((vehicle) => {
    const term = searchTerm.toLowerCase();
    return (
      vehicle.vehicle_name?.toLowerCase().includes(term) ||
      vehicle.driver_name?.toLowerCase().includes(term) ||
      vehicle.vehicle_category?.toLowerCase().includes(term) ||
      vehicle.size?.toLowerCase().includes(term) ||
      vehicle.registration_number?.toLowerCase().includes(term) ||
      vehicle.registration_serial?.toLowerCase().includes(term) ||
      vehicle.registration_zone?.toLowerCase().includes(term) ||
      vehicle.registration_date?.toLowerCase().includes(term) ||
      vehicle.text_date?.toLowerCase().includes(term) ||
      vehicle.road_permit_date?.toLowerCase().includes(term) ||
      vehicle.fitness_date?.toLowerCase().includes(term)
    );
  });
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVehicles = filteredCarList.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCarList.length / itemsPerPage);
 
  return (
    <main className=" md:p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            Vehicle List
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/AddCarForm">
              <button className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Vehicle
              </button>
            </Link>
          </div>
        </div>
        {/* export */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={exportExcel}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            <button
              onClick={exportPDF}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              PDF
            </button>
            <button
              onClick={printTable}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Vehicle..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
    {searchTerm && (
      <button
        onClick={() => {
          setSearchTerm("");
          setCurrentPage(1);
        }}
        className="absolute right-8 top-[6.3rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
      >
        ✕
      </button>
    )}
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary text-white capitalize text-xs">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Driver Name</th>
                <th className="p-2">Vehicle Name</th>
                <th className="p-2">Vehicle Category</th>
                <th className="p-2">Vehicle size</th>
                <th className="p-2">Vehicle No</th>
                {/* <th className="px-2 py-3">Trip</th> */}
                {/* <th className="px-2 py-3">Registration No</th> */}
                <th className="p-2">Status</th>
                <th className="p-2 action_column">Action</th>
              </tr>
            </thead>
            <tbody className="text-primary ">
              {
                currentVehicles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No vehicles found
                  </td>
                  </tr>
                )
              :(currentVehicles?.map((vehicle, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-all border border-gray-200"
                >
                  <td className="p-2 font-bold">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="p-2">{vehicle.driver_name}</td>
                  <td className="p-2">{vehicle.vehicle_name}</td>
                  <td className="p-2">{vehicle.vehicle_category}</td>
                  <td className="p-2">{vehicle.vehicle_size}</td>
                  <td className="p-2">
                    {vehicle.registration_zone} - {vehicle.registration_serial}{" "}
                    {vehicle.registration_number}
                  </td>
                  {/* <td className="px-2 py-4">0</td> */}
                  {/* <td className="px-2 py-4">{vehicle.registration_number}</td> */}
                  <td className="p-2">
                    <span className="text-white bg-green-700 px-3 py-1 rounded-md text-xs font-semibold">
                      Active
                    </span>
                  </td>
                  <td className="p-2 action_column">
                    <div className="flex gap-1">
                      <Link to={`/tramessy/UpdateCarForm/${vehicle.id}`}>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleViewCar(vehicle.id)}
                        className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaEye className="text-[12px]" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDriverId(vehicle.id);
                          setIsOpen(true);
                        }}
                        className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
        {/* pagination */}
    {currentVehicles.length > 0 && totalPages >= 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          maxVisible={8} 
        />
      )}
      </div>
      
      {/* Delete modal */}
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
                Do you want to delete the car?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedDriverId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* get car information by id */}
      {viewModalOpen && selectedCar && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#000000ad] z-50">
          <div className="w-4xl p-5 bg-gray-100 rounded-xl mt-10">
            <h3 className="text-primary font-semibold">Vehicle Information</h3>
            <div className="mt-5">
              <ul className="flex border border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Driver Name</p>{" "}
                  <p>{selectedCar.driver_name}</p>
                </li>
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2">
                  <p className="w-48">Vehicle Name</p>{" "}
                  <p>{selectedCar.vehicle_name}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Vehicle Category</p>{" "}
                  <p>{selectedCar.vehicle_category}</p>
                </li>
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2">
                  <p className="w-48">Vehicle Size</p>{" "}
                  <p>{selectedCar.vehicle_size}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Registration Number</p>{" "}
                  <p>{selectedCar.registration_number}</p>
                </li>
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2">
                  <p className="w-48">Registration Serial</p>{" "}
                  <p>{selectedCar.registration_serial}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Registration Area</p>{" "}
                  <p>{selectedCar.registration_zone}</p>
                </li>
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2">
                  <p className="w-48">Registration Date</p>{" "}
                  <p>{selectedCar.registration_date}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Tax Expiry Date</p>{" "}
                  <p>{selectedCar.text_date || "N/A"}</p>
                </li>
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2">
                  <p className="w-48">Road Permit Date</p>{" "}
                  <p>{selectedCar.road_permit_date}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Fitness Expiry Date</p>{" "}
                  <p>{selectedCar.fitness_date}</p>
                </li>
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">Insurance Expiry Date</p>{" "}
                  <p>{selectedCar.insurance_date}</p>
                </li>
              </ul>
               <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">KPL</p>{" "}
                  <p>{selectedCar.kpl}</p>
                </li>
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2">
                  <p className="w-48">Engine No</p>{" "}
                  <p>{selectedCar.engine_no}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2">
                  <p className="w-48">Chasis No</p>{" "}
                  <p>{selectedCar.chasis_no}</p>
                </li>
              </ul>
              <div className="flex justify-end mt-10">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-white bg-primary py-1 px-2 rounded-md cursor-pointer hover:bg-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CarList;
