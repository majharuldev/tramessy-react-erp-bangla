
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useMemo, useRef, useState } from "react";
import { InputField, SelectField } from "../components/Form/FormFields";
import BtnSubmit from "../components/Button/BtnSubmit";
import { FiCalendar } from "react-icons/fi";
import { add, format } from "date-fns";

export default function AddTripForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const dateRef = useRef(null);

  // State for dropdown options
  const [vehicle, setVehicle] = useState([]);
  const [driver, setDriver] = useState([]);
  const [vendorVehicle, setVendorVehicle] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorDrivers, setVendorDrivers] = useState([]);
  const [loadpoint, setLoadpoint] = useState([]);
  const [isFixedRateCustomer, setIsFixedRateCustomer] = useState(false);

  // State for rates
  const [rates, setRates] = useState([]);
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [vehicleSizes, setVehicleSizes] = useState([]);
  const [unloadpoints, setUnloadpoints] = useState([]);
  const [branch, setBranch] = useState([]);

  const methods = useForm({
    defaultValues: {
      date: "",
      load_point: "",
      unload_point: "",
      vehicle_no: "",
      driver_name: "",
      driver_mobile: "",
      fuel_cost: "",
      toll_cost: "",
      police_cost: "",
      driver_commission: "",
      labor: "",
      others_cost: "",
      d_day: "",
      d_amount: "",
      d_total: 0,
      customer: "",
      parking_cost: "",
      night_guard: "",
      feri_cost: "",
      chada: "",
      food_cost: "",
      callan_cost: "",
      total_exp: 0,
      total: 0,
      transport_type: "",
      total_rent: "",
      challan: "",
      trip_rent: "",
      advance: "",
      due_amount: "",
      customer_mobile: "",
      driver_adv: "",
      additional_load: "",
      additional_unload:"",
      additional_cost: "",
      additional_unload_charge:"",
      vehicle_category: "",
      vehicle_size: "",
      branch_name: "",
      trip_id: ""
    },
  });

  const { watch, handleSubmit, reset, setValue, control } = methods;

  const customerOptions = useMemo(() =>
    customer.map((c) => ({
      value: c.customer_name,
      label: c.customer_name,
      mobile: c.mobile,
      rate: c.rate,
    })),
    [customer]);

  // Handle customer mobile number update
  const selectedCustomer = useWatch({ control, name: "customer" });
  useEffect(() => {
    const customer = customerOptions.find((c) => c.value === selectedCustomer);
    if (customer) {
      const isFixed = customer.rate === "Fixed";
      setIsFixedRateCustomer(isFixed);
    }
    if (customer) {
      setValue("customer_mobile", customer.mobile || "");
    }
  }, [selectedCustomer, customerOptions, setValue]);

  const [isRateFound, setIsRateFound] = useState(false);
  const selectedTransport = watch("transport_type");
  const selectedLoadPoint = watch("load_point");
  const selectedUnloadPoint = watch("unload_point");
  const selectedVehicleCategory = watch("vehicle_category");
  const selectedVehicleSize = watch("vehicle_size");

  // Watch all expense fields
  const [
    fuelCost,
    tollCost,
    policeCost,
    driverCommision,
    labourCost,
    othersCost,
    parkingCost,
    nightGuardCost,
    feriCost,
    chadaCost,
    foodCost,
    d_day,
    d_amount,
    additional_cost,
    additional_unload_charge,
    callan_cost,
  ] = watch([
    "fuel_cost",
    "toll_cost",
    "police_cost",
    "driver_commission",
    "labor",
    "others_cost",
    "parking_cost",
    "night_guard",
    "feri_cost",
    "chada",
    "food_cost",
    "d_day",
    "d_amount",
    "additional_cost",
    "additional_unload_charge",
    "callan_cost",
  ]);

  // Calculate totals
  useEffect(() => {
    // Calculate total expenses
    const totalExp =
      (Number(driverCommision) || 0) +
      (Number(labourCost) || 0) +
      (Number(parkingCost) || 0) +
      (Number(nightGuardCost) || 0) +
      (Number(tollCost) || 0) +
      (Number(feriCost) || 0) +
      (Number(policeCost) || 0) +
      (Number(foodCost) || 0) +
      (Number(chadaCost) || 0) +
      (Number(fuelCost) || 0) +
      (Number(additional_cost) || 0) +
      (Number(additional_unload_charge)|| 0) +
      (Number(callan_cost) || 0)+
      (Number(othersCost) || 0);

    setValue("total_exp", totalExp);

    // Calculate damarage total
    const d_total = (Number(d_day) || 0) * (Number(d_amount) || 0);
    setValue("d_total", d_total);
  }, [
    driverCommision,
    labourCost,
    parkingCost,
    nightGuardCost,
    tollCost,
    feriCost,
    policeCost,
    foodCost,
    chadaCost,
    fuelCost,
    othersCost,
    d_day,
    d_amount,
    additional_cost,
    additional_unload_charge,
    callan_cost,
    setValue,
  ]);

  // Watch vendor transport fields
  const [vendorRent, vendorAdvance] = watch(["total_exp", "advance"]);

  useEffect(() => {
    const due = (Number(vendorRent) || 0) - (Number(vendorAdvance) || 0);
    setValue("due_amount", due, { shouldValidate: true });
  }, [vendorRent, vendorAdvance, setValue]);

  // Fetch all necessary data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch rates data first
        const ratesRes = await fetch(`${import.meta.env.VITE_BASE_URL}/api/rate/list`);
        const ratesData = await ratesRes.json();
        setRates(ratesData.data);

        // Extract unique load points, unload points, vehicle categories and sizes from rates
        const loadPoints = [...new Set(ratesData.data.map(rate => rate.load_point))];
        const unloadPoints = [...new Set(ratesData.data.map(rate => rate.unload_point))];
        const categories = [...new Set(ratesData.data.map(rate => rate.vehicle_category))];
        // const sizes = [...new Set(ratesData.data.map(rate => rate.vehicle_size))];

        const sizes = [
          ...new Set(
            ratesData.data
              .map(rate => rate.vehicle_size)
              .filter(size => size && size.trim() !== '')
              .map(size => size.trim())
          )
        ];
        // setVehicleSizes(sizes);

        setLoadpoint(loadPoints.map(point => ({ customer_name: point })));
        setUnloadpoints(unloadPoints);
        setVehicleCategories(categories);
        setVehicleSizes(sizes);

        const [
          vehicleRes,
          driverRes,
          vendorVehicleRes,
          vendorDriversRes,
          customerRes,
          vendorRes,
          branchRes,
        ] = await Promise.all([
          fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`),
          fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`),
          fetch(`${import.meta.env.VITE_BASE_URL}/api/rent/list`),
          fetch(`${import.meta.env.VITE_BASE_URL}/api/rent/list`),
          fetch(`${import.meta.env.VITE_BASE_URL}/api/customer/list`),
          fetch(`${import.meta.env.VITE_BASE_URL}/api/vendor/list`),
          fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`),
        ]);

        const [
          vehicleData,
          driverData,
          vendorVehicleData,
          vendorDriversData,
          customerData,
          vendorData,
          branchData,
        ] = await Promise.all([
          vehicleRes.json(),
          driverRes.json(),
          vendorVehicleRes.json(),
          vendorDriversRes.json(),
          customerRes.json(),
          vendorRes.json(),
          branchRes.json(),
        ]);

        setVehicle(vehicleData.data);
        setDriver(driverData.data);
        setVendorVehicle(vendorVehicleData.data);
        setVendorDrivers(vendorDriversData.data);
        setCustomer(customerData.data);
        setVendors(vendorData.data);
        setBranch(branchData.data);

        if (id) {
          const tripRes = await fetch(
            `${import.meta.env.VITE_BASE_URL}/api/trip/show/${id}`
          );
          if (tripRes.ok) {
            const { data: tripData } = await tripRes.json();

            if (tripData.date) {
              tripData.date = new Date(tripData.date).toISOString().split("T")[0];
            }

            const parsedTripData = {
              ...tripData,
              fuel_cost: Number(tripData.fuel_cost) || 0,
              toll_cost: Number(tripData.toll_cost) || 0,
              police_cost: Number(tripData.police_cost) || 0,
              driver_commission: Number(tripData.driver_commission) || 0,
              labor: Number(tripData.labor) || 0,
              others_cost: Number(tripData.others_cost) || 0,
              parking_cost: Number(tripData.parking_cost) || 0,
              night_guard: Number(tripData.night_guard) || 0,
              feri_cost: Number(tripData.feri_cost) || 0,
              chada: Number(tripData.chada) || 0,
              food_cost: Number(tripData.food_cost) || 0,
              d_day: Number(tripData.d_day) || 0,
              d_amount: Number(tripData.d_amount) || 0,
              d_total: Number(tripData.d_total) || 0,
              total_exp: Number(tripData.total_exp) || 0,
              total_rent: Number(tripData.total_rent) || 0,
              trip_rent: Number(tripData.trip_rent) || 0,
              advance: Number(tripData.advance) || 0,
              due_amount: Number(tripData.due_amount) || 0,
              driver_adv: Number(tripData.driver_adv) || 0,
            };

            reset(parsedTripData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load form data");
      }
    };

    fetchAllData();
  }, [id, reset]);

  // Generate options for dropdowns
  const vehicleOptions = vehicle.map((v) => ({
    value: `${v.registration_zone} ${v.registration_serial} ${v.registration_number}`,
    label: `${v.registration_zone} ${v.registration_serial} ${v.registration_number}`,
    category: v.vehicle_category,
    size: v.vehicle_size,
  }));

  const driverOptions = driver.map((d) => ({
    value: d.driver_name,
    label: d.driver_name,
    mobile: d.driver_mobile,
  }));

  const vendorVehicleOptions = vendorVehicle.map((v) => ({
    value: `${v.registration_zone} ${v.registration_serial} ${v.registration_number}`,
    label: `${v.registration_zone} ${v.registration_serial} ${v.registration_number}`,
    category: v.vehicle_category,
    size: v.vehicle_size,
  }));

  const vendorOptions = vendors.map((v) => ({
    value: v.vendor_name,
    label: v.vendor_name,
  }));

  const vendorDriverOptions = vendorDrivers.map((driver) => ({
    value: driver.vendor_name,
    label: driver.vendor_name,
    contact: driver.mobile,
  }));

  const loadpointOptions = [...new Set([
    ...loadpoint.map(load => load.customer_name),
    ...rates.map(rate => rate.load_point)
  ])].map(point => ({
    value: point,
    label: point,
  }));

  const unloadpointOptions = unloadpoints.map((unloadpoint) => ({
    value: unloadpoint,
    label: unloadpoint,
  }));

  const branchOptions = branch.map((branch) => ({
    value: branch.branch_name,
    label: branch.branch_name,
  }));

  const vehicleCategoryOptions = vehicleCategories.map((category) => ({
    value: category,
    label: category,
  }));

  const vehicleSizeOptions = vehicleSizes.map((size) => ({
    value: size,
    label: size,
  }));

  // Handle vehicle selection to auto-fill category and size
  const selectedVehicle = useWatch({ control, name: "vehicle_no" });
    // Auto-fill driver name based on selected vehicle number (own transport only)
useEffect(() => {
  if (selectedTransport === "own_transport" && selectedVehicle) {
    const vehicleData = vehicle.find(v => 
      `${v.registration_zone} ${v.registration_serial} ${v.registration_number}` === selectedVehicle
    );

    if (vehicleData) {
      setValue("driver_name", vehicleData.driver_name || "");
    } else {
      setValue("driver_name", "");
    }
  }
}, [selectedVehicle, selectedTransport, setValue, vehicle]);

  useEffect(() => {
    if (selectedTransport === "own_transport") {
      const vehicle = vehicleOptions.find((v) => v.value === selectedVehicle);
      if (vehicle) {
        // setValue("vehicle_category", vehicle.category || "");
        // setValue("vehicle_size", vehicle.size || "");
      }
    } else if (selectedTransport === "vendor_transport") {
      const vehicle = vendorVehicleOptions.find((v) => v.value === selectedVehicle);
      if (vehicle) {
        // setValue("vehicle_category", vehicle.category || "");
        // setValue("vehicle_size", vehicle.size || "");
      }
    }
  }, [selectedVehicle, selectedTransport, setValue]);

  // Fixed rate calculation based on load point, unload point, vehicle category and size
  useEffect(() => {
    if (selectedLoadPoint && selectedUnloadPoint && selectedVehicleCategory && selectedVehicleSize && rates.length > 0) {
      const foundRate = rates.find(
        (rate) =>
          rate.load_point === selectedLoadPoint &&
          rate.unload_point === selectedUnloadPoint &&
          rate.vehicle_category === selectedVehicleCategory &&
          // rate.vehicle_size === selectedVehicleSize
          rate.vehicle_size.toLowerCase().trim() === selectedVehicleSize.toLowerCase().trim()
      );

      if (foundRate) {
        const rateValue = parseFloat(foundRate.rate) || 0;
        setValue("total_rent", Number(rateValue.toFixed(2)), { shouldValidate: true });
        setIsRateFound(true);
      } else if (!id) {
        setValue("total_rent", "", { shouldValidate: true });
        setIsRateFound(false);
      }
    }
  }, [selectedLoadPoint, selectedUnloadPoint, selectedVehicleCategory, selectedVehicleSize, rates, setValue, id]);


  // Handle driver mobile number update
  const selectedDriver = useWatch({ control, name: "driver_name" });
  useEffect(() => {
    const driver = driverOptions.find((d) => d.value === selectedDriver);
    if (driver) {
      setValue("driver_mobile", driver.mobile || "");
    }
  }, [selectedDriver, driverOptions, setValue]);

  // Handle form submission
  // const generateRefId = useRefId();
  const onSubmit = async (data) => {
    // const refId = generateRefId();

    try {
      setLoading(true);
      //Date formatting only if valid
      if (data.date) {
        const parsedDate = new Date(data.date);
        if (!isNaN(parsedDate)) {
          data.date = format(parsedDate, "yyyy-MM-dd");
        }
      }
      
      const url = id
        ? `${import.meta.env.VITE_BASE_URL}/api/trip/update/${id}`
        : `${import.meta.env.VITE_BASE_URL}/api/trip/create`;

      // if (!id) {
      //   data.ref_id = refId;
      // }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(id ? "Trip updated successfully!" : "Trip created successfully!");
        navigate("/tramessy/tripList");
      } else {
        throw new Error(id ? "Failed to update trip" : "Failed to create trip");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Toaster />
      <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen mt-10 p-2">
        {/* Form Header */}
        <div className="bg-primary text-white px-4 py-2 rounded-t-md">
          <h2 className="text-lg font-medium">{id ? "Update Trip" : "Create Trip"}</h2>
        </div>

        <div className="rounded-b-md shadow border border-gray-200">
          <div className="p-4 space-y-2">
            {/* Trip & Destination Section */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <h3 className="text-orange-500 font-medium text-center mb-6">
                Trip & Destination
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6">
                <div className="relative w-full">
                  <InputField
                    name="date"
                    label="Date"
                    type="date"
                    required={!id}
                    inputRef={(e) => {
                      dateRef.current = e
                    }}
                    
                  />
                </div>
                <SelectField
                  name="customer"
                  label="Customer"
                  options={customerOptions}
                  control={control}
                  required={!id}
                  isCreatable={false}
                />
                <div className="w-full relative">
                  <SelectField
                    name="branch_name"
                    label="Branch"
                    required={!id}
                    options={branchOptions}
                    control={control}
                    isCreatable={false}
                  />
                </div>
              </div>
              <div className="flex gap-x-6 mt-2">
                <div className="w-full relative">
                  {isFixedRateCustomer ? (<SelectField
                    name="load_point"
                    label="Load Point"
                    required={id ? false : true}
                    options={loadpointOptions}
                    control={control}
                    isCreatable={true}
                  />) : (
                    <SelectField
                      name="load_point"
                      label="Load Point"
                      required={id ? false : true}
                      options={[
                        { value: "green_textile", label: "Green Textile Ltd." },
                        { value: "epic_garments", label: "Epic Garments Manufacturing Ltd." },
                        { value: "savar_depz", label: "Savar Depz" },
                        { value: "airport", label: "Airport" },
                        { value: "aepz", label: "Aepz" },
                      ]}
                      control={control}
                      isCreatable={true}
                    />)
                  }
                </div>
                <div className="w-full relative">
                  {isFixedRateCustomer?(<SelectField
                    name="unload_point"
                    label="Unload Point"
                    required={id ? false : true}
                    options={unloadpointOptions}
                    control={control}
                    isCreatable={!isFixedRateCustomer}
                  />):(
                    <SelectField
                    name="unload_point"
                    label="Unload Point"
                    required={id ? false : true}
                    options={[
                        { value: "ctg", label: "CTG" },
                        { value: "ctg_ware_house", label: "CTG Ware House" },
                        { value: "ctg_godown", label: "Ctg Godown" },
                        
                      ]}
                    control={control}
                    isCreatable={!isFixedRateCustomer}
                  />
                  )
                  }
                </div>
                <div className="w-full">
                  <InputField
                    name="trip_id"
                    label="Trip Id"
                    type="text"
                    required={id ? false : true}
                  />
                </div>
              </div>
              <div className="flex gap-x-6 mt-2">
                <div className="w-full">
                  <SelectField
                    name="trip_type"
                    label="Trip Type"
                    options={[
                      { value: "single", label: "Single Trip" },
                      { value: "round trip", label: "Round Trip" },
                    ]}
                    control={control}
                    required={!id}
                  />
                </div>
                <div className="w-full">
                  <InputField name="additional_load" label="Additional Load point" />
                </div>
                <div className="w-full">
                  <InputField name="additional_unload" label="Additional Unload point" />
                </div>
              </div>
            </div>

            {/* Vehicle & Driver Information */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <h3 className="text-orange-500 font-medium text-center mb-6">
                Vehicle & Driver Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                <SelectField
                  name="transport_type"
                  label="Transport Type"
                  options={[
                    { value: "own_transport", label: "Own Transport" },
                    { value: "vendor_transport", label: "Vendor Transport" },
                  ]}
                  control={control}
                  required={!id}
                />

                {selectedTransport === "vendor_transport" && (
                  <SelectField
                    name="vendor_name"
                    label="Vendor Name"
                    options={vendorOptions}
                    control={control}
                    required={!id}
                    isCreatable={false}
                  />
                )}

                {selectedTransport === "own_transport" ? (
                  <SelectField
                    name="vehicle_no"
                    label="Vehicle No."
                    options={vehicleOptions}
                    control={control}
                    required={!id}
                    isCreatable={false}
                  />
                ) : selectedTransport === "vendor_transport" ? (
                  <SelectField
                    name="vehicle_no"
                    label="Vehicle No."
                    options={vendorVehicleOptions}
                    control={control}
                    required={!id}
                  />
                ) : (
                  <SelectField
                    name="vehicle_no"
                    label="Vehicle No."
                    options={[{ label: "Select transport type first", value: "", disabled: true }]}
                    control={control}
                  />
                )}

                {selectedTransport === "own_transport" ? (
                  <SelectField
                    name="driver_name"
                    label="Driver Name"
                    options={driverOptions}
                    control={control}
                    required={!id}
                    isCreatable={false}
                  />
                ) : selectedTransport === "vendor_transport" ? (
                  <SelectField
                    name="driver_name"
                    label="Driver Name/Number"
                    options={vendorDriverOptions}
                    control={control}
                    required={!id}
                  />
                ) : (
                  <SelectField
                    name="driver_name"
                    label="Driver Name"
                    options={[{ label: "Select transport type first", value: "", disabled: true }]}
                    control={control}
                  />
                )}

                {isFixedRateCustomer?(<><SelectField
                  name="vehicle_category"
                  label="Vehicle Category"
                  options={vehicleCategoryOptions}
                  control={control}
                  required={!id}
                />
                <SelectField
                  name="vehicle_size"
                  label="Vehicle Size"
                  options={vehicleSizeOptions}
                  control={control}
                  required={!id}
                  isCreatable={!isFixedRateCustomer}
                /></>): ""}
                 {/* (<SelectField
                  name="vehicle_category"
                  label="Vehicle Category"
                   options={[
                        { value: "pickup", label: "CTG" },
                        { value: "covered_van", label: "Covered Van" },
                        { value: "open_truck", label: "Open Truck" },
                        { value: "trailer", label: "Trailer" },
                        { value: "freezer_van", label: "Freezer Van" },
                        
                      ]}
                  control={control}
                  required={!id}
                />) */}

                <div className="w-full">
                  <InputField
                    name="total_rent"
                    label="Total Rent/Bill Amount"
                    type="number"
                    required={id ? false : true}
                    readOnly={isRateFound}
                    className={isRateFound ? "bg-gray-100" : ""}
                  />
                </div>

                <InputField name="challan" label="Challan No." />
              </div>
            </div>

            {/* Own Transport Expenses Section */}
            {selectedTransport === "own_transport" && (
              <div className="border border-gray-300 p-5 rounded-md mt-5">
                <h3 className="text-orange-500 font-medium text-center mb-6">
                  Expense Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <InputField name="driver_adv" label="Driver Advance" type="number" />
                  <InputField name="driver_commission" label="Driver Commission" type="number" />
                  <InputField name="labor" label="Labour Cost" type="number" />
                  <InputField name="fuel_cost" label="Fuel Cost" type="number" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <InputField name="night_guard" label="Night Guard" type="number" />
                  <InputField name="toll_cost" label="Toll Cost" type="number" />
                  <InputField name="feri_cost" label="Feri Cost" type="number" />
                  <InputField name="police_cost" label="Police Cost" type="number" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <InputField name="chada" label="Chada" type="number" />
                  <InputField name="parking_cost" label="Parking Cost" type="number" />
                  <InputField name="food_cost" label="Food Cost" type="number" />
                  <InputField name="others_cost" label="Other Costs" type="number" />   
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <InputField name="additional_cost" label="Additional Load Cost" type="number" />
                  <InputField name="additional_unload_charge" label="Additional Unload Cost" type="number" />
                  <InputField name="callan_cost" label="Challan Cost" type="number" />
                  <InputField name="total_exp" label="Total Expense" readOnly />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <InputField name="remarks" label="Remarks"  />
                </div>
              </div>
            )}

            {/* Vendor Transport Section */}
            {selectedTransport === "vendor_transport" && (
              <div className="border border-gray-300 p-5 rounded-md mt-5">
                <h3 className="text-orange-500 font-medium text-center mb-6">
                  Vendor Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField name="total_exp" label="Vendor Rent" type="number" required={!id} />
                  <InputField name="advance" label="Advance" type="number" required={!id} />
                  <InputField name="due_amount" readOnly label="Due Amount" type="number" required={!id} />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-start mt-6">
              <BtnSubmit loading={loading}>
                {id ? "Update Trip" : "Create Trip"}
              </BtnSubmit>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}