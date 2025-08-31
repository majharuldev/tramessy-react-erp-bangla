import { useEffect, useRef, useState } from "react";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import { FiCalendar } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useLoaderData, useNavigate } from "react-router-dom";

const UpdateEmployeeForm = () => {
  const navigate = useNavigate()
  //   update loader data
  const updateEmployeeLoaderData = useLoaderData();
  const {
    id,
    branch_name,
    full_name,
    email,
    mobile,
    gender,
    birth_date,
    join_date,
    designation,
    salary,
    address,
    status,
    image,
  } = updateEmployeeLoaderData.data;

  const methods = useForm({ defaultValues: { status, branch_name, gender } });
  const { handleSubmit, register, control, setValue } = methods;
  const dateRef = useRef(null);
  const joinDateRef = useRef(null);
  // select branch name from api
  const [branch, setBranch] = useState([]);
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
  const [previewImage, setPreviewImage] = useState(image);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setValue("image", file);
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
        `${import.meta.env.VITE_BASE_URL}/api/employee/update/${id}`,
        formData
      );
      const resData = response.data;
      console.log("resData", resData);
      if (resData.status === "Success") {
        toast.success("Employee updated successfully", {
          position: "top-right",
        });
        navigate("/tramessy/HR/HRM/employee-list")
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
                defaultValue={branch_name}
                control={control}
                options={branchOptions}
              />
            </div>
            <div className="w-full">
              <InputField
                name="full_name"
                label="Full Name"
                defaultValue={full_name}
              />
            </div>
            <div className="w-full">
              <InputField name="email" defaultValue={email} label="Email" />
            </div>
          </div>

          {/* Row 2: Gender, Birth Date, Join Date */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField name="mobile" label="Mobile" defaultValue={mobile} />
            </div>
            <div className="w-full relative">
              <SelectField
                name="gender"
                label="Gender"
                defaultValue={gender}
                options={[
                  { value: "", label: "Gender..." },
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Others", label: "Others" },
                ]}
              />
            </div>
            <div className="w-full">
              <InputField
                name="birth_date"
                label="Birth Date"
                type="date"
                defaultValue={birth_date}
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
                defaultValue={join_date}
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
              <InputField
                name="designation"
                label="Designation"
                defaultValue={designation}
              />
            </div>
            <div className="w-full">
              <InputField name="salary" label="Salary" defaultValue={salary} />
            </div>
          </div>

          {/* Row 4: Image */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="address"
                label="Address"
                defaultValue={address}
              />
            </div>
            <div className="w-full">
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
            <div className="w-full">
              <label className="text-primary text-sm font-semibold">
                Image
              </label>
              <div className="relative">
                <Controller
                  name="image"
                  control={control}
                  render={({ fieldState: { error } }) => (
                    <div className="relative">
                      <label
                        htmlFor="image"
                        className="border p-2 rounded w-full block bg-white text-gray-500 text-sm cursor-pointer"
                      >
                        {previewImage ? "Image selected" : "Choose image"}
                      </label>
                      <input
                        {...register("image")}
                        id="image"
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
                  setValue("image", null);
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
                    : `${import.meta.env.VITE_BASE_URL}/public/uploads/employee/${previewImage}`
                }
                alt="Image Preview"
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

export default UpdateEmployeeForm;
