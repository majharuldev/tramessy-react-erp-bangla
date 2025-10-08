import BtnSubmit from "../../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../hooks/useRef";
import { useNavigate } from "react-router-dom";

const DistributionForm = () => {
  const navigate = useNavigate()
  const dateRef = useRef(null);
  const methods = useForm();
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
        `${import.meta.env.VITE_BASE_URL}/api/customer/create`,
        formData
      );
      const resData = response.data;
      console.log("resData", resData);
      if (resData.status === "Success") {
        toast.success("Customer data saved successfully!", {
          position: "top-right",
        });
        reset();
        navigate("/tramessy/Customer")
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
        Add Distribution Point
      </h3>
      <div className="mx-auto p-6 rounded-md shadow">
        <FormProvider {...methods} className="">
          <form onSubmit={handleSubmit(onSubmit)}>
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
              <div className="w-full relative">
                <InputField
                  name="point_name"
                  label="Point Name"
                  required
                />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField
                  name="contact_person"
                  label="Contact Person"
                  type="number"
                  required
                />
              </div>
            </div>
    
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField name="address" label="Address" required />
              </div>
              <div className="w-full relative">
                <InputField
                  name="opening_balance"
                  label="Opening Balance"
                  type="number"
                  required
                />
              </div>
              <div className="w-full">
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

            {/* Submit Button */}
            <div className="text-left">
              <BtnSubmit>Submit</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default DistributionForm;
