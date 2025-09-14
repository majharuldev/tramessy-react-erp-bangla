import { FormProvider, useForm } from "react-hook-form"
import toast, { Toaster } from "react-hot-toast"
import axios from "axios"
import { FiCalendar } from "react-icons/fi"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom" 
import { InputField, SelectField } from "../components/Form/FormFields"
import BtnSubmit from "../components/Button/BtnSubmit"

const VendorPaymentForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const { id } = useParams() // Get ID from URL parameters
  const dateRef = useRef(null)
  const checkDateRef = useRef(null)
  const methods = useForm()
  const { handleSubmit, reset, register, control } = methods

  // State for fetched data (if editing)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  // Fetch existing data if ID is present (for update mode)
  useEffect(() => {
    if (id && !initialDataLoaded) {
      const fetchPaymentData = async () => {
        try {
          // Assuming an API endpoint to fetch a single payment record by ID
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/vendorBill/${id}`)
          const data = response.data.data // Adjust based on your API response structure
          if (data) {
            // Pre-populate the form with fetched data
            reset({
              date: data.date,
              vendor_name: data.vendor_name,
              branch_name: data.branch_name,
              bank_name: data.bank_name,
              check_no: data.check_no,
              check_date: data.check_date,
              bill_ref: data.bill_ref,
              amount: data.amount,
              cash_type: data.cash_type,
              note: data.note,
              created_by: data.created_by,
              status: data.status,
            })
            setInitialDataLoaded(true)
          } else {
            toast.error("Payment record not found.")
            // navigate("/tramessy/account/PaymentReceive") // Redirect if not found
          }
        } catch (error) {
          console.error("Error fetching payment data:", error)
          toast.error("Failed to load payment data.")
          // navigate("/tramessy/account/PaymentReceive") // Redirect on error
        }
      }
      fetchPaymentData()
    }
  }, [id, reset, navigate, initialDataLoaded])

  // select customer from api
  const [customer, setCustomer] = useState([])
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
      .then((response) => response.json())
      .then((data) => setCustomer(data.data))
      .catch((error) => console.error("Error fetching customer data:", error))
  }, [])
  const customerOptions = customer.map((dt) => ({
    value: dt.customer_name,
    label: dt.customer_name,
  }))
   // select vendor from api
  const [vendor, setVendor] = useState([])
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vendor/list`)
      .then((response) => response.json())
      .then((data) => setVendor(data.data))
      .catch((error) => console.error("Error fetching vendor data:", error))
  }, [])
  const vendorOptions = vendor.map((dt) => ({
    value: dt.vendor_name,
    label: dt.vendor_name,
  }))

  // select branch office from api
  const [branch, setBranch] = useState([])
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => response.json())
      .then((data) => setBranch(data.data))
      .catch((error) => console.error("Error fetching branch data:", error))
  }, [])
  const branchOptions = branch.map((dt) => ({
    value: dt.branch_name,
    label: dt.branch_name,
  }))

  // send data on server
  const onSubmit = async (data) => {
  setLoading(true)
  try {
    const formData = new FormData()
    for (const key in data) {
      formData.append(key, data[key])
    }

    let paymentResponse
    let paymentData

    if (id) {
      // Update existing vendor payment
      paymentResponse = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/vendorBill/update/${id}`, formData)
      paymentData = paymentResponse.data

      if (paymentData.success) {
        toast.success("Payment updated successfully", { position: "top-right" })
        navigate("/tramessy/account/vendor-payment")
      } else {
        toast.error("Payment API failed: " + (paymentData.message || "Unknown error"))
      }
    } else {
      // Create new vendor payment
      paymentResponse = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/vendorBill/create`, formData)
      paymentData = paymentResponse.data

      if (paymentData.success) {
        toast.success("Payment saved successfully", { position: "top-right" })
        reset()
        navigate("/tramessy/account/vendor-payment")
      } else {
        toast.error("Payment API failed: " + (paymentData.message || "Unknown error"))
      }
    }
  } catch (error) {
    console.error("Submit error:", error)
    const errorMessage = error.response?.data?.message || error.message || "Unknown error"
    toast.error("Server issue: " + errorMessage)
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="mt-10 md:p-2">
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        {id ? "Update Vendor Payment  Form" : "Vendor Payment Form"}
      </h3>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mx-auto rounded-b-md shadow">
          {/* Trip & Destination Section */}
          <div className="border border-gray-300 p-3 md:p-5 rounded-b-md">
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label="Date"
                  type="date"
                  required={!id}
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
              {/* <div className="w-full">
                <SelectField
                  name="customer_name"
                  label="Customer Name"
                 required={!id}
                  options={customerOptions}
                  control={control}
                />
              </div> */}
               <div className="w-full">
                <SelectField
                  name="vendor_name"
                  label="Vendor Name"
                 required={!id}
                  options={vendorOptions}
                  control={control}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="branch_name"
                  label="Branch Name"
                  required={!id}
                  control={control}
                  options={[
                    { label: "Select Branch", value: "", disabled: true },
                    // { label: "Head Office", value: "Head Office" },
                    ...branchOptions, 
                  ]}
                />
              </div>
               <div className="w-full">
                <InputField name="bank_name" label="Bank Name" required={!id}/>
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="check_date" label="Check Date" type="date" required={!id} inputRef={(e) => {
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
                  }/>
              </div>
              <div className="w-full">
                <InputField name="check_no" label="Check No" required={!id}/>
              </div>
              <div className="w-full">
                <InputField name="bill_ref" label="Bill Ref" required={!id}/>
              </div>
              <div className="w-full">
                <InputField name="amount" label="Amount" required={!id} type="number" />
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <SelectField
                  name="cash_type"
                  label="Cash Type"
                  required={!id}
                  options={[
                    { value: "Cash", label: "Cash" },
                    { value: "Bank", label: "Bank" },
                    { value: "Card", label: "Card" },
                  ]}
                />
              </div>
              <div className="w-full">
                <InputField name="note" label="Note" />
              </div>
              {/* <div className="w-full">
                <InputField name="created_by" label="Created By" required={!id} />
              </div> */}
              <div className="w-full">
                <SelectField
                  name="status"
                  label="Status"
                  required={!id}
                  options={[
                    { value: "Paid", label: "Paid" },
                    { value: "Unpaid", label: "Unpaid" },
                  ]}
                />
              </div>
            </div>
            {/* Submit Button */}
            <div className="text-left p-5">
              <BtnSubmit loading={loading}>{id ? "Update" : "Submit"}</BtnSubmit>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default VendorPaymentForm