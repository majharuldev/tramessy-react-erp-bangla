import { useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import { IoMdClose } from "react-icons/io";
import { FiCalendar } from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useLoaderData, useNavigate } from "react-router-dom";

const UpdateDriverForm = () => {
  const navigate = useNavigate()
  //   update loader data
  const updateDriverLoaderData = useLoaderData();
  const {
    id,
    driver_name,
    driver_mobile,
    address,
    emergency_contact,
    nid,
    license,
    license_expire_date,
    note,
    status,
    license_image,
    opening_balance
  } = updateDriverLoaderData.data;

  const methods = useForm({ defaultValues: { status } });
  const { handleSubmit, register, control, setValue } = methods;
  const driverDateRef = useRef(null);
  //  set license image
  const [previewImage, setPreviewImage] = useState(license_image);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setValue("license_image", file);
    }
  };
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/driver/edit/${id}`,
        formData
      );
      const resData = response.data;
      console.log("resData", resData);
      if (resData.status === "Success") {
        toast.success("Driver updated successfully", {
          position: "top-right",
        });
        navigate("/tramessy/DriverList")
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
        Update Driver
      </h3>
      <div className="mx-auto p-6  rounded-md shadow">
        <FormProvider {...methods} className="">
          <form onSubmit={handleSubmit(onSubmit)} className="">
            {/* Name & Contact */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="driver_name"
                  label="Driver Name"
                  defaultValue={driver_name}
                />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="driver_mobile"
                  defaultValue={driver_mobile}
                  label="Driver Mobile"
                />
              </div>
            </div>

            {/* NID & Emergency Contact */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="address"
                  label="Address"
                  defaultValue={address}
                />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="emergency_contact"
                  defaultValue={emergency_contact}
                  label="Emergency Contact"
                />
              </div>
            </div>

            {/* Address & Note */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="nid" label="NID Number" defaultValue={nid} />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="license"
                  label="License No"
                  defaultValue={license}
                />
              </div>
            </div>

            {/* License & Expiry */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="license_expire_date"
                  label="License Expiry Date"
                  type="date"
                  defaultValue={license_expire_date}
                  inputRef={(e) => {
                    register("license_expire_date").ref(e);
                    driverDateRef.current = e;
                  }}
                  icon={
                    <span
                      className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                      onClick={() => driverDateRef.current?.showPicker?.()}
                    >
                      <FiCalendar className="text-white cursor-pointer" />
                    </span>
                  }
                />
              </div>
              <div className="mt-2 md:mt-0 w-full relative">
                <InputField name="note" defaultValue={note} label="Note" />
              </div>
            </div>

            {/* Status & License Image */}
            <div className="md:flex justify-between gap-3">
              <div className="mt-2 md:mt-0 w-full relative">
                              <InputField defaultValue={opening_balance} name="opening_balance" label="Opening Balance" />
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

              <div className="mt-3 md:mt-0 w-full">
                <label className="text-primary text-sm font-semibold">
                  Upload License Image
                </label>
                <div className="relative">
                  <Controller
                    name="license_image"
                    control={control}
                    render={({ fieldState: { error } }) => (
                      <div className="relative">
                        <label
                          htmlFor="license_image"
                          className="border p-2 rounded w-full block bg-white text-gray-500 text-sm cursor-pointer"
                        >
                          {previewImage ? "Image selected" : "Choose image"}
                        </label>
                        <input
                          {...register("license_image")}
                          id="license_image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        {error && (
                          <span className="text-red-600 text-sm">
                            {error.message}
                          </span>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {previewImage && (
              <div className="mt-3 relative flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    document.querySelector('input[type="file"]').value = null;
                    setValue("license_image", null);
                  }}
                  className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                  title="Remove image"
                >
                  <IoMdClose />
                </button>
                <img
                  src={
                    previewImage?.startsWith("blob:")
                      ? previewImage
                      : `${import.meta.env.VITE_BASE_URL}/public/uploads/driver/${previewImage}`
                  }
                  alt="License Preview"
                  className="max-w-xs h-auto rounded border border-gray-300"
                />
              </div>
            )}

            <div className="mt-6 text-left">
              <BtnSubmit>Submit</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default UpdateDriverForm;
