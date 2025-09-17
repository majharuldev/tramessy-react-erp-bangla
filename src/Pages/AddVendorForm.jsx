import axios from "axios";
import { useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FiCalendar } from "react-icons/fi";
import BtnSubmit from "../components/Button/BtnSubmit";
import { InputField, SelectField } from "../components/Form/FormFields";
import { useNavigate } from "react-router-dom";

const AddVendorForm = () => {
  const methods = useForm();
  const { handleSubmit, register, reset } = methods;
  const dateRef = useRef(null);
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/vendor/create`,
        formData
      );
      const resData = response.data;
      if (resData.status === "Success") {
        toast.success("Vendor saved successfully!", {
          position: "top-right",
        });
        reset();
         navigate("/tramessy/VendorList")
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
    <div className="mt-10 p-2">
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Vendor Form
      </h3>
      <div className="mx-auto p-6 rounded-md shadow">
        <FormProvider {...methods} className="">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Toaster position="top-center" reverseOrder={false} />
            {/*  */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField name="vendor_name" label="Vendor Name" required />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField
                  name="mobile"
                  label="Mobile"
                  type="number"
                  required
                />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField name="email" label="Email" />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <SelectField
                  name="rent_category"
                  label="Rent Category"
                  required
                  options={[
                    { value: "", label: "Select Transport Rent..." },
                    { value: "Pickup", label: "Pickup" },
                    { value: "Covered Van", label: "Covered Van" },
                  ]}
                />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              
              <div className="w-full relative">
                <InputField name="work_area" label="Work Area" />
              </div>
              <div className="w-full relative">
                <InputField type="number" name="opening_balance" label="Opening Balance" />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
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
            {/*  */}

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

export default AddVendorForm;
