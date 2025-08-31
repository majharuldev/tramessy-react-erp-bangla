import BtnSubmit from "../../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../hooks/useRef";
import { FiCalendar } from "react-icons/fi";
import { useLoaderData, useNavigate } from "react-router-dom";

const UpdateSupplyForm = () => {
  const navigate = useNavigate()
  //   update loader data
  const updateDriverLoaderData = useLoaderData();
  const {
    id,
    date,
    phone,
    address,
    due_amount,
    business_name,
    contact_person_name,
    business_category,
    status,
  } = updateDriverLoaderData.data;
  const methods = useForm({ defaultValues: { status } });
  const dateRef = useRef(null);
  const { handleSubmit, register } = methods;
  const generateRefId = useRefId();
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      formData.append("ref_id", generateRefId());
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/supply/update/${id}`,
        formData
      );
      const resData = response.data;
      if (resData.status === "Success") {
        toast.success("Supply information updated successfully!", {
          position: "top-right",
        });
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
            <div className="w-full">
              <InputField
                name="business_name"
                label="Supplier Name"
                defaultValue={business_name}
              />
            </div>
            <div className="w-full">
              <InputField
                name="business_category"
                label="Business Category"
                defaultValue={business_category}
              />
            </div>
            <div className="w-full">
              <InputField name="phone" label="Phone" defaultValue={phone} />
            </div>
          </div>
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="address"
                label="Address"
                defaultValue={address}
              />
            </div>
            <div className="w-full">
              <InputField
                name="due_amount"
                label="Opening Balance"
                defaultValue={due_amount}
              />
            </div>
            <div className="w-full">
              <InputField
                name="contact_person_name"
                label="Contact Person"
                defaultValue={contact_person_name}
              />
            </div>
            <div className="relative w-full">
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

          <BtnSubmit>Submit</BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default UpdateSupplyForm;
