import { FormProvider, useForm } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InputField, SelectField } from "../../components/Form/FormFields";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { FiCalendar } from "react-icons/fi";

const AdjustmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const methods = useForm();
  const { handleSubmit, reset, setValue, register } = methods;
  const dateRef = useRef(null);
  const advanceDateRef = useRef(null);
  // Fetch helper data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchHelperData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/adjustment/show/${id}`
          );
          const helperData = response.data.data;

          // Set form values with fetched data
          Object.keys(helperData).forEach((key) => {
            setValue(key, helperData[key]);
          });
        } catch (error) {
          console.error("Error fetching helper data:", error);
          toast.error("Failed to load helper data");
        }
      };
      fetchHelperData();
    }
  }, [id, isEditMode, setValue]);

  const onSubmit = async (data) => {
    try {
      // Convert JS Date → YYYY-MM-DD
      const formatDate = (date) => {
        if (!date) return null;
        return new Date(date).toISOString().split("T")[0];
      };

      // Fix the date fields before appending
      const fixedData = {
        ...data,
        date: formatDate(data.date),
        advance_paid_date: formatDate(data.advance_paid_date),
      };

      const formData = new FormData();
      for (const key in fixedData) {
        if (fixedData[key] !== undefined && fixedData[key] !== null) {
          formData.append(key, fixedData[key]);
        }
      }

      const url = isEditMode
        ? `${import.meta.env.VITE_BASE_URL}/api/adjustment/update/${id}`
        : `${import.meta.env.VITE_BASE_URL}/api/adjustment/create`;

      const response = await axios.post(url, formData);

      const resData = response.data;

      if (resData.success === true) {
        toast.success(
          `Adjustment ${isEditMode ? "updated" : "saved"} successfully`,
          { position: "top-right" }
        );

        if (!isEditMode) reset();
        navigate("/tramessy/AdjustmentList");
      } else {
        toast.error("Server issue: " + (resData.message || "Unknown issue"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue: " + errorMessage);
    }
  };

  return (
    <div className="mt-10 p-2">
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        {isEditMode ? "Update Adjustment" : "Create Adjustment"}
      </h3>
      <div className="mx-auto p-6  rounded-md shadow">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name & Contact */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label="Date"
                  type="date"
                  required
                  inputRef={(e) => {
                    register("date").ref(e);
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
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="branch_name"
                  label="Branch Name"
                  type="text"
                  required
                />
              </div>
            </div>
            {/*  */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="vehicle_no" label="Vehicle Number" />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="vehicle_type"
                  label="Vehicle Type"
                  type="text"
                />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="purpose_of_expenses"
                  label="Purpose of Expenses"
                  type="text"
                  required
                />
              </div>
            </div>
            {/*  */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="rate" label="Rate" type="number" />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField name="quantity" label="Quantity" type="text" />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="total_amount"
                  label="Total Amount"
                  type="text"
                />
              </div>
            </div>
            {/*  */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="advance_paid_date"
                  label="Advance Paid Date"
                  type="date"
                  required
                  inputRef={(e) => {
                    register("advance_paid_date").ref(e);
                    advanceDateRef.current = e;
                  }}
                  icon={
                    <span
                      className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                      onClick={() => advanceDateRef.current?.showPicker?.()}
                    >
                      <FiCalendar className="text-white cursor-pointer" />
                    </span>
                  }
                />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="advance_amount"
                  label="Advance Amount"
                  type="number"
                  required
                />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="balance_amount"
                  label="Balance Amount"
                  type="number"
                  required
                />
              </div>
            </div>

            <div className="md:flex justify-between gap-3">
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="paid_to"
                  label="Paid To"
                  type="text"
                  required
                />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField name="remarks" label="Remarks" type="text" />
              </div>
              <div className="w-full relative">
                <SelectField
                  name="status"
                  label="Status"
                  required
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                />
              </div>
            </div>

            <div className="mt-6 text-left">
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
