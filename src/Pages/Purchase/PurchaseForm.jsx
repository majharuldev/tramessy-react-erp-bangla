

import { useEffect, useRef, useState } from "react";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { FiCalendar } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";

const PurchaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const methods = useForm();
  const { handleSubmit, register, watch, reset, setValue, control } = methods;
  const purChaseDateRef = useRef(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicle, setVehicle] = useState([]);
  const [branch, setBranch] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [existingImage, setExistingImage] = useState(null);

  const selectedCategory = watch("category");
    const selectedVehicle = watch("vehicle_no");
  
  // Calculate Total Expense
  const quantity = parseFloat(watch("quantity") || 0);
  const unitPrice = parseFloat(watch("unit_price") || 0);
  const totalPrice = quantity * unitPrice;
  
  useEffect(() => {
    const totalPrice = quantity * unitPrice;
    setValue("purchase_amount", totalPrice);
  }, [quantity, unitPrice, setValue]);

  // Set vehicle category when vehicle is selected
 useEffect(() => {
  if (selectedVehicle) {
    const selectedVehicleData = vehicle.find(
      (v) =>
        `${v.registration_zone} ${v.registration_serial} ${v.registration_number}`.trim() ===
        selectedVehicle.trim()
    );
    if (selectedVehicleData) {
      console.log("Setting vehicle_category:", selectedVehicleData.vehicle_category); // Debug
      setValue("vehicle_category", selectedVehicleData.vehicle_category, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      console.log("No vehicle data found, setting vehicle_category to empty"); // Debug
      setValue("vehicle_category", "");
    }
  } else {
    console.log("No vehicle selected, setting vehicle_category to empty"); // Debug
    setValue("vehicle_category", "");
  }
}, [selectedVehicle, vehicle, setValue]);
  // Preview image
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch data for dropdowns
  useEffect(() => {
    // Fetch drivers
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((response) => response.json())
      .then((data) => setDrivers(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
    
    // Fetch vehicles
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => response.json())
      .then((data) => setVehicle(data.data))
      .catch((error) => console.error("Error fetching vehicle data:", error));
    
    // Fetch branches
    fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => response.json())
      .then((data) => setBranch(data.data))
      .catch((error) => console.error("Error fetching branch data:", error));
    
    // Fetch suppliers
    fetch(`${import.meta.env.VITE_BASE_URL}/api/supply/list`)
      .then((response) => response.json())
      .then((data) => setSupplier(data.data))
      .catch((error) => console.error("Error fetching supply data:", error));
  }, []);

  // Fetch purchase data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchPurchaseData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/purchase/show/${id}`
          );
          const purchaseData = response.data.data;
          console.log("Fetched purchase data:", purchaseData);
          
          // Set form values
          setValue("date", purchaseData.date);
          setValue("category", purchaseData.category);
          setValue("item_name", purchaseData.item_name);
          setValue("driver_name", purchaseData.driver_name);
          setValue("vehicle_no", purchaseData.vehicle_no);
          setValue("vehicle_category", purchaseData.vehicle_category);
          setValue("branch_name", purchaseData.branch_name);
          setValue("supplier_name", purchaseData.supplier_name);
          setValue("quantity", purchaseData.quantity);
          setValue("unit_price", purchaseData.unit_price);
          setValue("purchase_amount", purchaseData.purchase_amount);
          setValue("remarks", purchaseData.remarks);
          setValue("priority", purchaseData.priority);
          
          // Set image preview if exists
          if (purchaseData.bill_image) {
            const imageUrl = `${import.meta.env.VITE_BASE_URL}/uploads/${purchaseData.bill_image}`;
            setPreviewImage(imageUrl);
            setExistingImage(purchaseData.bill_image); // existing image নাম সংরক্ষণ করুন
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching purchase data:", error);
          toast.error("Failed to load purchase data");
          setIsLoading(false);
        }
      };
      
      fetchPurchaseData();
    }
  }, [id, isEditMode, setValue]);

  const driverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
  }));

  const vehicleOptions = vehicle.map((dt) => ({
    value: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number}`,
    label: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number}`,
    category: dt.vehicle_category
  }));

  const branchOptions = branch.map((branch) => ({
    value: branch.branch_name,
    label: branch.branch_name,
  }));

  const supplyOptions = supplier.map((supply) => ({
    value: supply.supplier_name,
    label: supply.supplier_name,
  }));

  // Handle form submission for both add and update
  const onSubmit = async (data) => {
    console.log("Form Data:", data);
  
    try {
      const purchaseFormData = new FormData();
      
      // for (const key in data) {
      //   // Handle file uploads separately
      //   if (key === "bill_image") {
      //     // যদি নতুন ফাইল সিলেক্ট করা হয়
      //     if (typeof data[key] === "object") {
      //       purchaseFormData.append(key, data[key]);
      //     } 
      //     // যদি এডিট মোডে থাকে এবং নতুন ফাইল সিলেক্ট না করা হয়
      //     else if (isEditMode && existingImage && !data[key]) {
      //       purchaseFormData.append(key, existingImage);
      //     }
      //   } else if (data[key] !== null && data[key] !== undefined) {
      //     purchaseFormData.append(key, data[key]);
      //   }
      // }
     // Append all fields, including vehicle_category
    for (const key in data) {
      if (key === "bill_image") {
        if (typeof data[key] === "object" && data[key]) {
          purchaseFormData.append(key, data[key]);
        } else if (isEditMode && existingImage && !data[key]) {
          purchaseFormData.append(key, existingImage);
        }
      } else if (data[key] !== null && data[key] !== undefined) {
        purchaseFormData.append(key, data[key]);
      }
    }
      let response;
      
      if (isEditMode) {
        // Update existing purchase
        response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/purchase/update/${id}`,
          purchaseFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Purchase updated successfully!", {
          position: "top-right",
        });
      } else {
        // Create new purchase
        response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/purchase/create`,
          purchaseFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Purchase submitted successfully!", {
          position: "top-right",
        });
      }
      
      reset();
      navigate("/tramessy/Purchase/maintenance");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue: " + errorMessage);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading purchase data...</div>;
  }

  return (
    <div className="mt-10 md:p-2">
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        {isEditMode ? "Update Maintenance Purchase " : "Add Maintenance Purchase"}
      </h3>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6 rounded-md shadow space-y-4"
        >
          <h5 className="text-2xl font-bold text-center text-[#EF9C07]">
            {selectedCategory === "fuel"
              ? "Fuel Purchase" 
              : selectedCategory === "engine_oil" || selectedCategory === "parts" 
                ? "Maintenance" 
                : ""}
          </h5>
          
          {/* Form fields */}
          <div className="flex flex-col lg:flex-row justify-between gap-x-3">
            <div className="w-full">
              <InputField
                name="date"
                label="Purchase Date"
                type="date"
                required={!isEditMode} 
                inputRef={(e) => {
                  register("date").ref(e);
                  purChaseDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => purChaseDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>
            <div className="w-full">
              <SelectField
                name="category"
                label="Category"
                required={!isEditMode}
                options={[
                  { value: "engine_oil", label: "Engine Oil" },
                  { value: "parts", label: "Parts" },
                ]}
              />
            </div>
            {selectedCategory === "parts" && (
              <div className="w-full">
                <InputField name="item_name" label="Item Name" required={!isEditMode} />
              </div>
            )}
          </div>
          
          <div className="md:flex justify-between gap-x-3">
            <div className="w-full">
              <SelectField
                name="driver_name"
                label="Driver Name"
                required={!isEditMode}
                options={driverOptions}
                control={control}
              />
            </div>
            <div className="w-full">
              <SelectField
                name="vehicle_no"
                label="Vehicle No."
                required={!isEditMode}
                options={vehicleOptions}
                control={control}
              
              />
            </div>
          </div>
          {/* Hidden field for vehicle category */}
       <div className="w-full hidden">
            <InputField
              name="vehicle_category"
              label="Vehicle Category"
              value={watch("vehicle_category") || ""}
              readOnly
              {...register("vehicle_category")}
            />
          </div>
          <div className="flex flex-col lg:flex-row justify-between gap-x-3">
            <div className="w-full">
              <SelectField
                name="branch_name"
                label="Branch Name"
                required={!isEditMode}
                options={branchOptions}
                control={control}
              />
            </div>
            <div className="w-full">
              <SelectField
                name="supplier_name"
                label="Supplier Name"
                required={!isEditMode}
                options={supplyOptions}
                control={control}
              />
            </div>
            <div className="w-full">
              <InputField
                name="quantity"
                label="Quantity"
                type="number"
                required={!isEditMode}
              />
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between gap-3">
            <div className="w-full">
              <InputField
                name="unit_price"
                label="Unit Price"
                type="number"
                required={!isEditMode}
              />
            </div>
            <div className="w-full">
              <InputField
                name="purchase_amount"
                label="Total"
                readOnly
                value={totalPrice}
                required={!isEditMode}
              />
            </div>
            <div className="w-full">
              <InputField name="remarks" label="Remark" />
            </div>
            <div className="w-full">
              <InputField name="priority" label="priority" />
            </div>
          </div>
          
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <label className="text-primary text-sm font-semibold">
                Bill Image {!isEditMode && "(Required)"}
              </label>
              <Controller
                name="bill_image"
                control={control}
                rules={isEditMode ? {} : { required: "This field is required" }}
                render={({
                  field: { onChange, ref },
                  fieldState: { error },
                }) => (
                  <div className="relative">
                    <label
                      htmlFor="bill_image"
                      className="border p-2 rounded w-[50%] block bg-white text-gray-300 text-sm cursor-pointer"
                    >
                      {previewImage ? "Image selected" : "Choose image"}
                    </label>
                    <input
                      id="bill_image"
                      type="file"
                      accept="image/*"
                      ref={ref}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setPreviewImage(url);
                          onChange(file);
                        } else {
                          setPreviewImage(null);
                          onChange(null);
                        }
                      }}
                    />
                    {error && (
                      <span className="text-red-600 text-sm">
                        {error.message}
                      </span>
                    )}
                    {/* {isEditMode && existingImage && (
                      <span className="text-green-600 text-sm">
                        Current image: {existingImage}
                      </span>
                    )} */}
                  </div>
                )}
              />
            </div>
          </div>
          
          {/* Preview */}
          {previewImage && (
            <div className="mt-2 relative flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  setValue("bill_image", null);
                  const fileInput = document.getElementById("bill_image");
                  if (fileInput) fileInput.value = "";
                  
                  if (!isEditMode) {
                    setExistingImage(null);
                  }
                }}
                className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                title="Remove image"
              >
                <IoMdClose />
              </button>
              <img
                src={previewImage}
                alt="Bill Preview"
                className="max-w-xs h-auto rounded border border-gray-300"
              />
            </div>
          )}
          
          <BtnSubmit>{isEditMode ? "Update Purchase" : "Submit"}</BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default PurchaseForm;


