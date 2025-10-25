import { useEffect, useRef, useState } from "react";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import { FiCalendar } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../../hooks/useRef";
import { useNavigate } from "react-router-dom";

const AddEmployee = () => {
  const navigate = useNavigate()
  const methods = useForm();
  const { handleSubmit, register, control, reset } = methods;
  const dateRef = useRef(null);
  const joinDateRef = useRef(null);
  const [branch, setBranch] = useState([]);
  // select branch name from api
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => response.json())
      .then((data) => setBranch(data.data))
      .catch((error) => console.error("Error fetching branch data:", error));
  }, []);
  const branchOptions = branch.map((dt) => ({
    value: dt.branch_name,
    label: dt.branch_name,
  }));
  // preview image
  const [previewImage, setPreviewImage] = useState(null);
  // const generateRefId = useRefId();
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      // formData.append("ref_id", generateRefId());
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/employee/create`,
        formData
      );
      const resData = response.data;
      console.log("resData", resData);
      if (resData.status === "Success") {
        toast.success("Employee saved successfully!", {
          position: "top-right",
        });
        reset();
        navigate("/tramessy/HR/HRM/employee-list")
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
      <Toaster position="top-center" reverseOrder={false} />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Add Employee Information
      </h3>
      <FormProvider {...methods} className="">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6  rounded-md shadow space-y-4"
        >
          {/* Row 1: Full Name, Email, Mobile */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <SelectField
                name="branch_name"
                label="Branch Name"
                required={true}
                options={branchOptions}
                control={control}
              />
            </div>
            <div className="w-full">
              <InputField name="full_name" label="Full Name" required />
            </div>
            <div className="w-full">
              <InputField name="email" label="Email" />
            </div>
          </div>

          {/* Row 2: Gender, Birth Date, Join Date */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField name="mobile" label="Mobile" type="number" required />
            </div>
            <div className="w-full relative">
              <SelectField
                name="gender"
                label="Gender"
                required
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Others", label: "Others" },
                ]}
              />
            </div>
            <div className="w-full relative">
              <SelectField
                name="blood_group"
                label="Blood Group"
                required
                options={[
                  { value: "A+", label: "A+" },
                  { value: "A-", label: "A-" },
                  { value: "B+", label: "B+" },
                  { value: "B-", label: "B-" },
                  { value: "AB+", label: "AB+" },
                  { value: "AB-", label: "AB-" },
                  { value: "O+", label: "O+" },
                  { value: "O-", label: "O-" },
                ]}
              />
            </div>
            <div className="w-full">
              <InputField
                name="birth_date"
                label="Birth Date"
                type="date"
                required
                inputRef={(e) => {
                  register("birth_date").ref(e);
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
          </div>

          {/* Row 3: Designation, Salary, Address */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="join_date"
                label="Join Date"
                type="date"
                required
                inputRef={(e) => {
                  register("join_date").ref(e);
                  joinDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => joinDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>
            <div className="w-full">
              <InputField name="nid" label="Nid" required type="number" />
            </div>
            <div className="w-full">
              <InputField name="designation" label="Designation" required />
            </div>
            <div className="w-full">
              <InputField name="salary" label="Salary" type="number" required />
            </div>
          </div>

          {/* Row 4: Image */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField name="address" label="Address" required />
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
            <div className="w-full">
              <label className="text-primary text-sm font-semibold">
                Image
              </label>
              <div className="relative">
                <Controller
                  name="image"
                  control={control}
                  rules={{ required: "This field is required" }}
                  render={({
                    field: { onChange, ref },
                    fieldState: { error },
                  }) => (
                    <div className="relative">
                      <label
                        htmlFor="image"
                        className="border p-2 rounded w-full block bg-white text-gray-500 text-sm cursor-pointer"
                      >
                        {previewImage ? "Image selected" : "Choose image"}
                      </label>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        ref={ref}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setPreviewImage(url);
                            onChange(file);
                          } else {
                            setPreviewImage(null);
                            onChange(null);
                          }
                        }}
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
                  document.getElementById("image").value = "";
                }}
                className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                title="Remove image"
              >
                <IoMdClose />
              </button>
              <img
                src={previewImage}
                alt="License Preview"
                className="max-w-xs h-auto rounded border border-gray-300"
              />
            </div>
          )}
          <BtnSubmit>Submit</BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddEmployee;
