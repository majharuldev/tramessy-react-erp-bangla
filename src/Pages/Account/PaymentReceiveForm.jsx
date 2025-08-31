
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import BtnSubmit from "../../components/Button/BtnSubmit";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../hooks/useRef";
import { FiCalendar } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PaymentReceiveForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dateRef = useRef(null);
  const methods = useForm();
  const { handleSubmit, reset, register, control } = methods;
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch data if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchPaymentData();
    }
  }, [id]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/paymentRecived/show/${id}`
      );
      const data = response.data.data;
      
      // Set form values
      methods.reset({
        date: data.date,
        customer_name: data.customer_name,
        branch_name: data.branch_name,
        bill_ref: data.bill_ref,
        amount: data.amount,
        cash_type: data.cash_type,
        remarks: data.remarks,
        created_by: data.created_by,
        status: data.status,
        ref_id: data.ref_id
      });
    } catch (error) {
      console.error("Error fetching payment data:", error);
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  // select customer from api
  const [customer, setCustomer] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
      .then((response) => response.json())
      .then((data) => setCustomer(data.data))
      .catch((error) => console.error("Error fetching customer data:", error));
  }, []);

  const customerOptions = customer.map((dt) => ({
    value: dt.customer_name,
    label: dt.customer_name,
  }));

  // select branch office from api
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

  const generateRefId = useRefId();

  const onSubmit = async (data) => {
    const refId = isEditing ? data.ref_id : generateRefId();
    
    try {
      const formData = new FormData();
      for (const key in data) {
        if (key !== 'ref_id') {
          formData.append(key, data[key]);
        }
      }

      if (!isEditing) {
        formData.append("ref_id", refId);
      }

      // Use appropriate endpoint and method based on mode
      const endpoint = isEditing 
        ? `${import.meta.env.VITE_BASE_URL}/api/paymentRecived/update/${id}`
        : `${import.meta.env.VITE_BASE_URL}/api/paymentRecived/create`;
      
      const method = isEditing ? "post" : "post";

      const paymentResponse = await axios[method](endpoint, formData);
      const paymentData = paymentResponse.data;

      if (paymentData.success) {
        toast.success(
          isEditing ? "Payment updated successfully" : "Payment saved successfully", 
          { position: "top-right" }
        );

        if (isEditing) {
          navigate("/tramessy/account/PaymentReceive");
        } else {
          reset(); // Reset form after successful creation
          navigate("/tramessy/account/PaymentReceive");
        }
      } else {
        toast.error(paymentData.message || "Operation failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue: " + errorMessage);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-10 p-2">
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        {isEditing ? "Edit Payment Receive" : "Payment Receive Form"}
      </h3>
      <FormProvider {...methods} className="">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 mx-auto  rounded-md shadow"
        >
          <div className="border border-gray-300 p-3 md:p-5 rounded-b-md">
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label="Date"
                  type="date"
                  required={!isEditing}
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
                <SelectField
                  name="customer_name"
                  label="Customer Name"
                  required={!isEditing}
                  options={customerOptions}
                  control={control}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="branch_name"
                  label="Branch Name"
                  required={!isEditing}
                  options={branchOptions}
                  control={control}
                />
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="bill_ref" label="Bill Ref" required={!isEditing} />
              </div>
              <div className="w-full">
                <InputField
                  name="amount"
                  label="Amount"
                  type="number"
                 required={!isEditing}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="cash_type"
                  label="Cash Type"
                  required={!isEditing}
                  options={[
                    { value: "Cash", label: "Cash" },
                    { value: "Bank", label: "Bank" },
                    { value: "Card", label: "Card" },
                  ]}
                />
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="remarks" label="Note" required={!isEditing} />
              </div>
              <div className="w-full">
                <InputField name="created_by" label="Created By" required={!isEditing} />
              </div>
              <div className="w-full">
                <SelectField
                  name="status"
                  label="Status"
                  required={!isEditing}
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                />
              </div>
            </div>
            <div className="text-left p-5">
              <BtnSubmit>{isEditing ? "Update" : "Submit"}</BtnSubmit>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default PaymentReceiveForm;