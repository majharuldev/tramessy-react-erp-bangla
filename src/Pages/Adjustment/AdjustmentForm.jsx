import { FormProvider, useForm, useFieldArray } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InputField, SelectField } from "../../components/Form/FormFields";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { FiCalendar, FiX } from "react-icons/fi";

const AdjustmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const methods = useForm({
    defaultValues: {
      indent_date: "",
      indentor: "",
      vehicle_no: "",
      particulars: "",
      adv_paid: "",
      branch_name: "",
      status: "",
      items: [
        {
          given_date: "",
          token: "",
          present_km: "",
          prev_km: "",
          use_km: "",
          ltr: "",
          vehicle_no: "",
          amount: "",
          remarks: "",
        },
      ],
    },
  });
  const { handleSubmit, reset, register, control } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const dateRef = useRef(null);
  // select vehicle from api
  const [vehicle, setVehicle] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => response.json())
      .then((data) => setVehicle(data.data))
      .catch((error) => console.error("Error fetching vehicle data:", error));
  }, []);

  const vehicleOptions = vehicle.map((dt) => ({
    value: dt.registration_number,
    label: dt.registration_number,
  }));
  // select branch from api
  const [office, setOffice] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => response.json())
      .then((data) => setOffice(data.data))
      .catch((error) => console.error("Error fetching office data:", error));
  }, []);

  const officeOptions = office.map((dt) => ({
    value: dt.branch_name,
    label: dt.branch_name,
  }));

  // 🔥 EDIT MODE: Fetch Data
  useEffect(() => {
    if (isEditMode) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/adjustment/show/${id}`
          );

          const data = response.data.data;

          // Convert top-level date
          const indentDate = data.indent_date
            ? new Date(data.indent_date)
            : null;

          // Convert items given_date
          const items = (data.items || []).map((item) => ({
            ...item,
            given_date: item.given_date ? new Date(item.given_date) : null,
          }));

          reset({
            indent_date: indentDate,
            indentor: data.indentor,
            vehicle_no: data.vehicle_no,
            particulars: data.particulars,
            adv_paid: data.adv_paid,
            branch_name: data.branch_name,
            status: data.status,
            items: items,
          });
        } catch (err) {
          console.error(err);
          toast.error("Failed to load adjustment");
        }
      };

      fetchData();
    }
  }, [id, isEditMode, reset]);

  const emptyItem = {
    given_date: "",
    token: "",
    present_km: "",
    prev_km: "",
    use_km: "",
    ltr: "",
    vehicle_no: "",
    amount: "",
    remarks: "",
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // top-level
      formData.append(
        "indent_date",
        data.indent_date
          ? new Date(data.indent_date).toISOString().split("T")[0]
          : ""
      );
      formData.append("indentor", data.indentor);
      formData.append(
        "vehicle_no",
        Array.isArray(data.vehicle_no)
          ? data.vehicle_no.map((v) => v.value).join(",") // send as CSV
          : data.vehicle_no
      );

      formData.append("particulars", data.particulars);
      formData.append("adv_paid", data.adv_paid);
      formData.append("branch_name", data.branch_name);
      formData.append("status", data.status);

      // items array
      data.items.forEach((item, index) => {
        formData.append(
          `items[${index}][given_date]`,
          item.given_date
            ? new Date(item.given_date).toISOString().split("T")[0]
            : ""
        );
        formData.append(`items[${index}][token]`, item.token || "");
        formData.append(`items[${index}][present_km]`, item.present_km || "");
        formData.append(`items[${index}][prev_km]`, item.prev_km || "");
        formData.append(`items[${index}][use_km]`, item.use_km || "");
        formData.append(`items[${index}][ltr]`, item.ltr || "");
        formData.append(`items[${index}][vehicle_no]`, item.vehicle_no || "");
        formData.append(`items[${index}][amount]`, item.amount || "");
        formData.append(`items[${index}][remarks]`, item.remarks || "");
      });

      const url = isEditMode
        ? `${import.meta.env.VITE_BASE_URL}/api/adjustment/update/${id}`
        : `${import.meta.env.VITE_BASE_URL}/api/adjustment/create`;

      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("API Response:", response.data);

      if (response.data.success === true) {
        toast.success(
          `Adjustment ${isEditMode ? "updated" : "created"} successfully`
        );
        navigate("/tramessy/AdjustmentList");
      } else {
        toast.error(response.data.message || "Failed to save");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Server Error: " + (error.response?.data?.message || ""));
    }
  };

  return (
    <div className="mt-10 p-2">
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        {isEditMode ? "Update Adjustment" : "Create Adjustment"}
      </h3>

      <div className="mx-auto p-6 rounded-md shadow">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Top Fields */}
            <div className="border border-gray-200 p-3 rounded-md">
              <div className="md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField
                    name="indent_date"
                    label="Indent Date"
                    type="date"
                    required
                    inputRef={(e) => {
                      register("indent_date").ref(e);
                      dateRef.current = e;
                    }}
                    icon={
                      <span
                        className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                        onClick={() => dateRef.current?.showPicker?.()}
                      >
                        <FiCalendar className="text-white cursor-pointer" />
                      </span>
                    }
                  />
                </div>

                <div className="w-full">
                  <InputField name="indentor" label="Indentor" required />
                </div>

                <div className="w-full">
                  <SelectField
                    name="vehicle_no"
                    label="Vehicle Number"
                    required={true}
                    options={vehicleOptions}
                    control={control}
                    isMulti={true}
                  />
                </div>
              </div>

              <div className="md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField
                    name="particulars"
                    label="Particulars"
                    type="text"
                    required
                  />
                </div>

                <div className="w-full">
                  <InputField
                    name="adv_paid"
                    label="Advance Amount"
                    type="number"
                    required
                  />
                </div>

                <div className="w-full">
                  <SelectField
                    name="branch_name"
                    label="Branch Name"
                    required={true}
                    options={officeOptions}
                    control={control}
                  />
                </div>

                <div className="w-full relative">
                  <SelectField
                    name="status"
                    label="Status"
                    required
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Inactive", label: "Inactive" },
                      { value: "Pending", label: "Pending" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Items */}
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-gray-200 p-3 rounded-md mt-6 relative"
              >
                <h5 className="flex justify-between items-center">
                  Item {index + 1}
                  <FiX
                    className="text-red-500 cursor-pointer"
                    onClick={() => remove(index)}
                  />
                </h5>

                <div className="md:flex justify-between gap-3 mt-2">
                  <div className="w-full relative">
                    <InputField
                      name={`items.${index}.given_date`}
                      label="Given Date"
                      type="date"
                      required
                      inputRef={(e) =>
                        register(`items.${index}.given_date`).ref(e)
                      }
                      icon={
                        <span
                          className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                          onClick={(ev) => {
                            const input =
                              ev.currentTarget.parentElement.querySelector(
                                "input[type=date]"
                              );
                            input?.showPicker?.();
                          }}
                        >
                          <FiCalendar className="text-white cursor-pointer" />
                        </span>
                      }
                    />
                  </div>

                  <div className="w-full">
                    <InputField
                      name={`items.${index}.token`}
                      label="Token"
                      type="text"
                    />
                  </div>

                  <div className="w-full">
                    <InputField
                      name={`items.${index}.present_km`}
                      label="Present km"
                      type="text"
                    />
                  </div>
                </div>

                <div className="md:flex justify-between gap-3 mt-2">
                  <div className="w-full">
                    <InputField
                      name={`items.${index}.prev_km`}
                      label="Prev km"
                      type="text"
                    />
                  </div>

                  <div className="w-full">
                    <InputField
                      name={`items.${index}.use_km`}
                      label="Use km"
                      type="text"
                    />
                  </div>

                  <div className="w-full">
                    <InputField name={`items.${index}.ltr`} label="Litter" />
                  </div>
                </div>

                <div className="md:flex justify-between gap-3 mt-2">
                  <div className="w-full">
                    <SelectField
                      name={`items.${index}.vehicle_no`}
                      label="Vehicle Number"
                      required={true}
                      options={vehicleOptions}
                      control={control}
                    />
                  </div>

                  <div className="w-full">
                    <InputField
                      name={`items.${index}.amount`}
                      label="Amount"
                      type="number"
                    />
                  </div>

                  <div className="w-full">
                    <InputField
                      name={`items.${index}.remarks`}
                      label="Remarks"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add More */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => append(emptyItem)}
                className="mt-4 bg-primary text-white text-sm px-6 py-2 rounded hover:bg-secondary transition-all duration-300 cursor-pointer"
              >
                Add More
              </button>
            </div>

            {/* Submit */}
            <div className="mt-6">
              <BtnSubmit>
                {isEditMode ? "Update Adjustment" : "Make Adjustment"}
              </BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AdjustmentForm;
