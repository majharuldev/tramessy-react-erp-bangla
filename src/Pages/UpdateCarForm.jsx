import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FiCalendar } from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import BtnSubmit from "../components/Button/BtnSubmit";
import { InputField, SelectField } from "../components/Form/FormFields";
import { useLoaderData, useNavigate } from "react-router-dom";
const UpdateCarForm = () => {
  //   update loader data
  const updateCarLoaderData = useLoaderData();
  const {
    id,
    vehicle_name,
    driver_name,
    vehicle_category,
    vehicle_size,
    registration_number,
    registration_serial,
    registration_zone,
    registration_date,
    tax_date,
    road_permit_date,
    fitness_date,
    status,
    fuel_capacity,
    insurance_date,
  } = updateCarLoaderData.data;

  const methods = useForm({
    defaultValues: {
      driver_name,
      vehicle_category,
      vehicle_size,
      registration_serial,
      registration_zone,
      status,
    },
  });
  const { handleSubmit, register, control, watch } = methods;
  const registrationDateRef = useRef(null);
  const taxDateRef = useRef(null);
  const roadPermitRef = useRef(null);
  const fitnessDateRef = useRef(null);
  const insuranceDateRef = useRef(null);
  const navigate = useNavigate();
  // select driver from api
  const [drivers, setDrivers] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((response) => response.json())
      .then((data) => setDrivers(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);

  const driverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
  }));

   const selectedCategory = watch("vehicle_category");
const vehicleSizes = {
  pickup: ["1 Ton", "2 Ton", "3 Ton", "7 Feet", "9 Feet"],
  covered_van: ["12 Feet", "14 Feet", "16 Feet", "18 Feet", "20 Feet", "23 Feet"],
  open_truck: ["3 Ton", "5 Ton", "10 Ton", "15 Ton", "30 Ton"],
  trailer: ["20 Feet", "23 Feet", "40 Feet", "30 Ton"],
  freezer_van: ["1 Ton", "3 Ton", "5 Ton", "10 Ton"],
  car: ["4 Seater", "7 Seater"],
  micro_bus: ["12 Seater", "14 Seater"],
  bus: ["30 Seater", "40 Seater", "50 Seater"],
};
// সিলেক্ট করা ক্যাটাগরির জন্য সাইজ লিস্ট বানানো
  const sizeOptions =
    selectedCategory && vehicleSizes[selectedCategory]
      ? vehicleSizes[selectedCategory].map((size) => ({
          value: size.toLowerCase().replace(" ", "_"),
          label: size,
        }))
      : [];

  // update vehicle
  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/vehicle/edit/${id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resData = response.data;
      if (resData.status === "Success") {
        toast.success("Vehicle updated successfully!", {
          position: "top-right",
        });
        navigate("/tramessy/CarList")
      } else {
        toast.error("Server issue " + (resData.message || "Unknown problem"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue " + errorMessage);
    }
  };

  return (
    <FormProvider {...methods} className="">
      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 md:p-2">
        <Toaster position="top-center" reverseOrder={false} />
        <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
         Update Vehicle Information
        </h3>

        <div className="mx-auto p-6  rounded-md shadow">
          {/* Vehicle & Driver Name */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="vehicle_name"
                label="Vehicle Name"
                defaultValue={vehicle_name}
              />
            </div>
            <div className="relative mt-2 md:mt-0 w-full">
              <SelectField
                name="driver_name"
                label="Driver Name"
                defaultValue={driver_name}
                control={control}
                options={driverOptions}
              />
            </div>
          </div>

          {/* Category & Size */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full relative">
              <SelectField
                name="vehicle_category"
                label="Vehicle Category"
                required
                options={[
                  // { value: "", label: "Select Vehicle category..." },
                  { value: "pickup", label: "Pickup" },
                  { value: "covered_van", label: "Covered Van" },
                  { value: "open_truck", label: "Open Truck" },
                  { value: "trailer", label: "Trailer" },
                  { value: "freezer_van", label: "Freezer Van" },
                  { value: "car", label: "Car" },
                  { value: "bus", label: "Bus" },
                  { value: "micro_bus", label: "Micro Bus" },
                ]}
                defaultValue={vehicle_category}
              />
            </div>
            <div className="relative w-full">
        <SelectField
          name="vehicle_size"
          label="Vehicle Size/Capacity"
          required
          options={[
            { value: "", label: "Select Vehicle size..." },
            ...sizeOptions,
          ]}
          defaultValue={vehicle_size}
        />
      </div>
            <div className="w-full">
              <InputField
                name="fuel_capacity"
                label="Fuel Capacity"
                defaultValue={fuel_capacity}
              />
            </div>
          </div>

          {/* Registration Number & Serial */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="registration_number"
                label="Registration Number"
                defaultValue={registration_number}
              />
            </div>
            <div className="mt-2 md:mt-0 w-full">
              <SelectField
                name="registration_serial"
                label="Registration Serial"
                defaultValue={registration_serial}
                options={[
                  { value: "Ta", label: "Ta" },
                  { value: "Tha", label: "Tha" },
                  { value: "Da", label: "Da" },
                  { value: "Dha", label: "Dha" },
                  { value: "Na", label: "Na" },
                  { value: "M", label: "M" },
                  { value: "Sh", label: "Sh" },
                ]}
              />
            </div>
            <div className="relative w-full">
              <SelectField
                name="registration_zone"
                label="Registration Zone"
                defaultValue={registration_zone}
                options={[
                  { value: "", label: "Select zone..." },
                  { value: "Dhaka Metro", label: "Dhaka Metro" },
                  { value: "Chatto Metro", label: "Chatto Metro" },
                  { value: "Sylhet Metro", label: "Sylhet Metro" },
                  { value: "Rajshahi Metro", label: "Rajshahi Metro" },
                  { value: "Khulna Metro", label: "Khulna Metro" },
                  { value: "Rangpur Metro", label: "Rangpur Metro" },
                  { value: "Barisal Metro", label: "Barisal Metro" },
                  { value: "Dhaka", label: "Dhaka" },
                  { value: "Narayanganj", label: "Narayanganj" },
                  { value: "Gazipur", label: "Gazipur" },
                  { value: "Tangail", label: "Tangail" },
                  { value: "Manikgonj", label: "Manikgonj" },
                  { value: "Munshigonj", label: "Munshigonj" },
                  { value: "Faridpur", label: "Faridpur" },
                  { value: "Rajbari", label: "Rajbari" },
                  { value: "Narsingdi", label: "Narsingdi" },
                  { value: "Kishorgonj", label: "Kishorgonj" },
                  { value: "Shariatpur", label: "Shariatpur" },
                  { value: "Gopalgonj", label: "Gopalgonj" },
                  { value: "Madaripur", label: "Madaripur" },
                  { value: "Chattogram", label: "Chattogram" },
                  { value: "Cumilla", label: "Cumilla" },
                  { value: "Feni", label: "Feni" },
                  { value: "Brahmanbaria", label: "Brahmanbaria" },
                  { value: "Noakhali", label: "Noakhali" },
                  { value: "Chandpur", label: "Chandpur" },
                  { value: "Lokkhipur", label: "Lokkhipur" },
                  { value: "Bandarban", label: "Bandarban" },
                  { value: "Rangamati", label: "Rangamati" },
                  { value: "CoxsBazar", label: "CoxsBazar" },
                  { value: "Khagrasori", label: "Khagrasori" },
                  { value: "Barisal", label: "Barisal" },
                  { value: "Barguna", label: "Barguna" },
                  { value: "Bhola", label: "Bhola" },
                  { value: "Patuakhali", label: "Patuakhali" },
                  { value: "Pirojpur", label: "Pirojpur" },
                  { value: "Jhalokati", label: "Jhalokati" },
                  { value: "Khulna", label: "Khulna" },
                  { value: "Kustia", label: "Kustia" },
                  { value: "Jashore", label: "Jashore" },
                  { value: "Chuadanga", label: "Chuadanga" },
                  { value: "Satkhira", label: "Satkhira" },
                  { value: "Bagerhat", label: "Bagerhat" },
                  { value: "Meherpur", label: "Meherpur" },
                  { value: "Jhenaidah", label: "Jhenaidah" },
                  { value: "Norail", label: "Norail" },
                  { value: "Magura", label: "Magura" },
                  { value: "Rangpur", label: "Rangpur" },
                  { value: "Ponchogor", label: "Ponchogor" },
                  { value: "Thakurgaon", label: "Thakurgaon" },
                  { value: "Kurigram", label: "Kurigram" },
                  { value: "Dinajpur", label: "Dinajpur" },
                  { value: "Nilfamari", label: "Nilfamari" },
                  { value: "Lalmonirhat", label: "Lalmonirhat" },
                  { value: "Gaibandha", label: "Gaibandha" },
                  { value: "Rajshahi", label: "Rajshahi" },
                  { value: "Pabna", label: "Pabna" },
                  { value: "Bagura", label: "Bagura" },
                  { value: "Joypurhat", label: "Joypurhat" },
                  { value: "Nouga", label: "Nouga" },
                  { value: "Natore", label: "Natore" },
                  { value: "Sirajgonj", label: "Sirajgonj" },
                  { value: "Chapainawabganj", label: "Chapainawabganj" },
                  { value: "Sylhet", label: "Sylhet" },
                  { value: "Habiganj", label: "Habiganj" },
                  { value: "Moulvibazar", label: "Moulvibazar" },
                  { value: "Sunamgonj", label: "Sunamgonj" },
                  { value: "Mymensingh", label: "Mymensingh" },
                  { value: "Netrokona", label: "Netrokona" },
                  { value: "Jamalpur", label: "Jamalpur" },
                  { value: "Sherpur", label: "Sherpur" },
                ]}
              />
            </div>
          </div>

          {/* Registration Zone */}
          <div className="md:flex justify-between gap-3">
            {/* Registration Date */}
            <div className="relative w-full">
              <InputField
                name="registration_date"
                label="Registration Date"
                type="date"
                defaultValue={registration_date}
                inputRef={(e) => {
                  register("registration_date").ref(e);
                  registrationDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => registrationDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>

            {/* Tax Expiry Date */}
            <div className="mt-2 md:mt-0 w-full">
              <InputField
                name="tax_date"
                label="Tax Expiry Date"
                type="date"
                defaultValue={tax_date}
                inputRef={(e) => {
                  register("tax_date").ref(e);
                  taxDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => taxDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>
            <div className="w-full">
              <InputField
                name="road_permit_date"
                label="Road Permit Date"
                type="date"
                defaultValue={road_permit_date}
                inputRef={(e) => {
                  register("road_permit_date").ref(e);
                  roadPermitRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => roadPermitRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
              <label className="text-primary text-sm font-semibold"></label>
            </div>
          </div>

          {/* Road Permit & Fitness Date & Status */}
          <div className="md:flex justify-between gap-3">
            <div className="mt-2 md:mt-0 w-full">
              <InputField
                name="fitness_date"
                label="Fitness Expiry Date"
                type="date"
                defaultValue={fitness_date}
                inputRef={(e) => {
                  register("fitness_date").ref(e);
                  fitnessDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => fitnessDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>
            <div className="mt-2 md:mt-0 w-full">
              <InputField
                name="insurance_date"
                label="Insurance Expiry Date"
                type="date"
                defaultValue={insurance_date}
                inputRef={(e) => {
                  register("insurance_date").ref(e);
                  insuranceDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => insuranceDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>

            <div className="w-full relative">
              <SelectField
                name="status"
                label="Status"
                defaultValue={status}
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
              />
            </div>
          </div>

          <div className="text-left">
            <BtnSubmit>Submit</BtnSubmit>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateCarForm;
