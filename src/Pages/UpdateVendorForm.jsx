import axios from "axios";
import { useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FiCalendar } from "react-icons/fi";
import BtnSubmit from "../components/Button/BtnSubmit";
import { InputField, SelectField } from "../components/Form/FormFields";
import { useLoaderData, useNavigate } from "react-router-dom";

const UpdateVendorForm = () => {
  const navigate = useNavigate();
  //   update loader data
  const updateVendorLoaderData = useLoaderData();
  const {
    id,
    vendor_name,
    mobile,
    email,
    rent_category,
    work_area,
    date,
    opening_balance,
    status,
  } = updateVendorLoaderData.data;

  const methods = useForm({ defaultValues: { rent_category, status } });
  const { handleSubmit, register } = methods;
  const dateRef = useRef(null);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/vendor/update/${id}`,
        formData
      );
      const resData = response.data;
      console.log("resData", resData);
      if (resData.status === "Success") {
        toast.success("Vendor Updated successfully!", {
          position: "top-right",
        });
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
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Update Vendor Form
      </h3>
      <div className="mx-auto p-6  rounded-md shadow">
        <FormProvider {...methods} className="">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/*  */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField
                  name="vendor_name"
                  label="Vendor Name"
                  defaultValue={vendor_name}
                />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField
                  name="mobile"
                  label="Mobile"
                  defaultValue={mobile}
                />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">              
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField name="email" label="Email" defaultValue={email} />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <SelectField
                  name="rent_category"
                  label="Rent Category"
                  defaultValue={rent_category}
                  options={[
                    { value: "Pickup", label: "Pickup" },
                    { value: "Covered Van", label: "Covered Van" },
                  ]}
                />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField
                  name="work_area"
                  label="Work Area"
                  defaultValue={work_area}
                />
              </div>
              <div className="w-full relative">
                <InputField type="number" name="opening_balance" label="Opening Balance" defaultValue={opening_balance
                } />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label="Date"
                  type="date"
                  defaultValue={date}
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

              <div className="w-full relative">
                <SelectField
                  name="status"
                  label="Status"
                  defaultValue={status}
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

export default UpdateVendorForm;
