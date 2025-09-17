import BtnSubmit from "../../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../hooks/useRef";
import { FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AddSupply = () => {
  const navigate = useNavigate()
  const methods = useForm();
  const dateRef = useRef(null);
  const { handleSubmit, reset, register } = methods;
  const generateRefId = useRefId();
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      formData.append("ref_id", generateRefId());
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/supply/create`,
        formData
      );
      const resData = response.data;
      if (resData.status === "Success") {
        toast.success("Supply information saved successfully!", {
          position: "top-right",
        });
        reset();
        navigate("/tramessy/Purchase/SupplierList")
      } else {
        toast.error("Server Error: " + (resData.message || "Unknown issue"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server Error: " + errorMessage);
    }
  };

  return (
    <div className="mt-10 md:p-2">
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Supply Information Setup
      </h3>
      <FormProvider {...methods} className="">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6 rounded-md shadow space-y-4"
        >
          {/*  */}
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
               
              />
            </div>
            <div className="w-full">
              <InputField name="supplier_name" label="Supplier Name" required />
            </div>
             <div className="w-full">
              <InputField name="business_category" label="Business Category" required />
            </div>
            <div className="w-full">
              <InputField name="phone" label="Phone" type="number" required />
            </div>
          </div>
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField name="address" label="Address" required />
            </div>
            <div className="w-full">
              <InputField
                name="due_amount"
                label="Opening Balance"
                type="number"
                required
              />
            </div>
            <div className="w-full">
              <InputField
                name="contact_person_name"
                label="Contact Person"
                required
              />
            </div>
            <div className="relative w-full">
              <SelectField
                name="status"
                label="Status"
                required
                options={[
                  { value: "", label: "Select Status..." },
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
              />
            </div>
          </div>

          <BtnSubmit>Submit</BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddSupply;
