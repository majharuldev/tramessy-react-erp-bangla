import { FormProvider, useForm } from "react-hook-form"
import { InputField, SelectField } from "../../components/Form/FormFields"
import BtnSubmit from "../../components/Button/BtnSubmit"
import toast, { Toaster } from "react-hot-toast"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { FiCalendar } from "react-icons/fi"
import { useParams, useNavigate } from "react-router-dom"

const CashDispatchForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState([])
  const [employee, setEmployee] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const dateRef = useRef(null)
  const checkDateRef = useRef(null)
  const methods = useForm()
  const [vehicle, setVehicle] = useState([]) 

useEffect(()=>{
  // Fetch vehicles
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => response.json())
      .then((data) => setVehicle(data.data))
      .catch((error) => console.error("Error fetching vehicle data:", error));
}, [])

  // Fetch initial data if editing
  useEffect(() => {
    if (id) {
      setIsEditing(true)
      fetchData()
    }
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/account/show/${id}`)
      const data = response.data.data

      // Normalize bad date and string values
    const normalizeDate = (d) => {
      if (!d || d === "null" || d === "undefined" || d === "Invalid Date") return ""
      const parsed = new Date(d)
      return isNaN(parsed.getTime()) ? "" : parsed.toISOString().split("T")[0]
    }

      // Set form values
      methods.reset({
        date: normalizeDate(data.date),
        branch_name: data.branch_name === "undefined" ? "" : data.branch_name,
      person_name: data.person_name === "undefined" ? "" : data.person_name,
      type: data.type === "undefined" ? "" : data.type,
      vehicle_no: data.vehicle_no === "undefined" ? "" : data.vehicle_no,
      vehicle_category: data.vehicle_category === "null" ? "" : data.vehicle_category,
        check_no: data.check_no,
        check_date: normalizeDate(data.check_date),
        amount: data.amount,
        purpose: data.purpose,
        bank_name: data.bank_name || "",
        remarks: data.remarks,
        ref: data.ref || "",
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // select branch from api
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => response.json())
      .then((data) => setBranch(data.data))
      .catch((error) => console.error("Error fetching branch name:", error))
  }, [])

  const branchOptions = branch.map((dt) => ({
    value: dt.branch_name,
    label: dt.branch_name,
  }))

  // select branch from api
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/employee/list`)
      .then((response) => response.json())
      .then((data) => setEmployee(data.data))
      .catch((error) => console.error("Error fetching employee name:", error))
  }, [])

  const employeeOptions = employee.map((dt) => ({
    value: dt.full_name,
    label: dt.full_name,
  }))

  const { handleSubmit, reset, register, control, watch, setValue } = methods

  // const selectedCategory = watch("category");
    const selectedVehicle = watch("vehicle_no");

    // Set vehicle category when vehicle is selected
 useEffect(() => {
    if (selectedVehicle) {
      const selectedVehicleData = vehicle.find(
        (v) =>
          `${v.registration_zone} ${v.registration_serial} ${v.registration_number}`.trim() ===
          selectedVehicle.trim()
      )
      if (selectedVehicleData) {
        setValue("vehicle_category", selectedVehicleData.vehicle_category, {
          shouldValidate: true,
          shouldDirty: true,
        })
      } else {
        setValue("vehicle_category", "")
      }
    } else {
      setValue("vehicle_category", "")
    }
  }, [selectedVehicle, vehicle, setValue])

  //  Fetch vehicle list
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => response.json())
      .then((data) => setVehicle(data.data))
      .catch((error) => console.error("Error fetching vehicle data:", error))
  }, [])

  // Vehicle options বানানো
  const vehicleOptions = vehicle.map((v) => ({
    value: `${v.registration_zone} ${v.registration_serial} ${v.registration_number}`,
    label: `${v.registration_zone} ${v.registration_serial} ${v.registration_number}`,
  }))
  // generate ref id
  const generateRefId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let refId = ""
    for (let i = 0; i < 6; i++) {
      refId += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return refId
  }

  // post data on server
  const onSubmit = async (data) => {
    const refId = isEditing ? data.ref_id : generateRefId()

    try {
      const formData = new FormData()
      for (const key in data) {
        formData.append(key, data[key])
      }

      if (!isEditing) {
        formData.append("ref_id", refId)
      }

      // Use update or create endpoint based on mode
      const endpoint = isEditing
        ? `${import.meta.env.VITE_BASE_URL}/api/account/update/${id}`
        : `${import.meta.env.VITE_BASE_URL}/api/account/create`

      const method = isEditing ? "post" : "post"

      const response = await axios[method](endpoint, formData)
      const responseData = response.data

      if (responseData.success) {
        toast.success(isEditing ? "Fund transfer updated successfully" : "Fund transfer created successfully", {
          position: "top-right",
        })

        // Reset form if create, navigate back if edit
        if (isEditing) {
          navigate("/tramessy/account/CashDispatch") // Go back to previous page
        } else {
          reset()
          navigate("/tramessy/account/CashDispatch")
        }
      } else {
        toast.error(responseData.message || "Operation failed")
      }
    } catch (error) {
      console.error(error)
      const errorMessage = error.response?.data?.message || error.message || "Unknown error"
      toast.error("Server issue: " + errorMessage)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="mt-10 p-2">
      <Toaster position="top-center" reverseOrder={false} />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        {isEditing ? "Edit Fund Transfer" : "Create Fund Transfer"}
      </h3>
      <FormProvider {...methods} className="">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mx-auto  rounded-md shadow">
          {/* Trip & Destination Section */}
          <div className="border border-gray-300 p-3 md:p-5 rounded-b-md">
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label="Date"
                  type="date"
                  required={!isEditing}
                  inputRef={(e) => {
                    register("date").ref(e)
                    dateRef.current = e
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
                <SelectField
                  name="branch_name"
                  label="Received Branch Name"
                  // required={!isEditing}
                  options={branchOptions}
                  control={control}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="vehicle_no"
                  label="Vehicle No"
                  // required={!isEditing}
                  options={vehicleOptions}
                  control={control}
                />
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                {/* Hidden field for vehicle category */}
       <div className="w-full hidden">
            <InputField
              name="vehicle_category"
              label="Vehicle Category"
              value={watch("vehicle_category") || ""}
              readOnly
              {...register("vehicle_category")}
            />
          </div>
              <div className="w-full">
                <SelectField
                  name="person_name"
                  label="Person Name"
                  // required={!isEditing}
                  options={employeeOptions}
                  control={control}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="type"
                  label="Cash Type"
                  // required={!isEditing}
                  options={[
                    { value: "Cash", label: "Cash" },
                    { value: "Bank", label: "Bank" },
                    { value: "Card", label: "Card" },
                  ]}
                />
              </div>
              <div className="w-full">
                <InputField name="check_no" label="Check No" type="number"
                //  required={!isEditing} 
                 />
              </div>
              <div className="w-full">
                <InputField name="check_date" label="Check Date" type="date" 
                // required={!isEditing} 
                inputRef={(e) => {
                    register("check_date").ref(e)
                    checkDateRef.current = e
                  }}
                  icon={
                    <span
                      className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                      onClick={() => checkDateRef.current?.showPicker?.()}
                    >
                      <FiCalendar className="text-white cursor-pointer" />
                    </span>
                  } />
              </div>
              
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="amount" label="Amount" type="number" 
                // required={!isEditing} 
                />
              </div>
              <div className="w-full">
                <InputField name="bank_name" label="Bank Name" 
                // required={!isEditing}
                 />
              </div>
              <div className="w-full">
                <InputField name="purpose" label="purpose" 
                // required={!isEditing} 
                />
              </div>
              <div className="w-full">
                <InputField name="remarks" label="Note" 
                // required={!isEditing}
                 />
              </div>
            </div>
            {/* Submit Button */}
            <div className="text-left p-5">
              <BtnSubmit>{isEditing ? "Update" : "Submit"}</BtnSubmit>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default CashDispatchForm
