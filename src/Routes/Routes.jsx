import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../Pages/Home";
import CarList from "../Pages/CarList";
import AddCarForm from "../Pages/AddCarForm";
import DriverList from "../Pages/DriverList";
import AddDriverForm from "../Pages/AddDriverForm";
import TripList from "../Pages/TripList";
import AddTripForm from "../Pages/AddTripForm";
import Fuel from "../Pages/Fuel";
import FuelForm from "../Pages/FuelForm";
import Parts from "../Pages/Parts";
import Maintenance from "../Pages/Maintenance";
import MaintenanceForm from "../Pages/MaintenanceForm";
import DailyIncome from "../Pages/DailyIncome";
import DailyExpense from "../Pages/DailyExpense";
import AllUsers from "../Pages/AllUsers";
import AddUserForm from "../Pages/AddUserForm";
import Login from "../components/Form/Login";
import ResetPass from "../components/Form/ResetPass";
import PrivateRoute from "./PrivateRoute";
import UpdateFuelForm from "../Pages/updateForm/UpdateFuelForm";
import UpdatePartsForm from "../Pages/updateForm/UpdatePartsForm";
import UpdateMaintenanceForm from "../Pages/updateForm/UpdateMaintenanceForm";
import UpdateDriverForm from "../Pages/updateForm/UpdateDriverForm";
import UpdateDailyIncomeForm from "../Pages/updateForm/UpdateDailyIncomeForm";
import UpdateExpenseForm from "../Pages/updateForm/UpdateExpenseForm";
import AdminRoute from "./AdminRoute";
import VendorList from "../Pages/VendorList";
import AddVendorForm from "../Pages/AddVendorForm";
import RentList from "../Pages/RentList";
import AddRentVehicleForm from "../Pages/AddRentVehicleForm";
import EmployeeList from "../Pages/HR/HRM/Employee-list";
import AddEmployee from "../Pages/HR/HRM/AddEmployee";
import Leave from "../Pages/HR/Leave";
import LeaveForm from "../Pages/HR/LeaveForm";
import PurchaseList from "../Pages/Purchase/PurchaseList";
import PurchaseForm from "../Pages/Purchase/PurchaseForm";
import Stockin from "../Pages/Inventory/Stockin";
import AddStock from "../Pages/Inventory/AddStock";
import StockOut from "../Pages/Inventory/StockOut";
import StockOutForm from "../Pages/Inventory/StockOutForm";
import SupplierList from "../Pages/Purchase/SupplierList";
import AddSupply from "../Pages/Purchase/AddSupply";
import AttendanceList from "../Pages/HR/HRM/AttendanceList";
import AdvanceSalary from "../Pages/HR/Payroll/AdvanceSalary";
import AdvanceSalaryForm from "../Pages/HR/Payroll/AdvanceSalaryForm";
import Customer from "../Pages/Customer/Customer";
import AddCustomer from "../Pages/Customer/AddCustomer";
import EmployeeReport from "../Pages/Reports/EmployeeReport";
import DriverReport from "../Pages/Reports/DriverReport";
import FuelReport from "../Pages/Reports/FuelReport";
import PurchaseReport from "../Pages/Reports/PurchaseReport";
import InventoryReport from "../Pages/Reports/InventoryReport";
import TripReport from "../Pages/Reports/TripReport";
import AttendanceForm from "../Pages/HR/HRM/AttendanceForm";
import InventorySupplier from "../Pages/Inventory/InventorySupplier";
import InventorySupplierForm from "../Pages/Inventory/InventorySupplierForm";
import GenerateSalaryForm from "../Pages/HR/Payroll/GenerateSalaryForm";
import GenerateSalary from "../Pages/HR/Payroll/GenerateSalary";
import CashDispatch from "../Pages/Account/CashDispatch";
import Office from "../Pages/HR/HRM/Office";
import CashDispatchForm from "../Pages/Account/CashDispatchForm";
import OfficeForm from "../Pages/HR/HRM/OfficeForm";
import CustomerLedger from "../Pages/Account/CustomerLedger";
import SupplierLedger from "../Pages/Account/SupplierLedger";
import OfficeLedger from "../Pages/Account/OfficeLedger";
import PaymentList from "../Pages/Account/PaymentList";
import PaymentReceiveForm from "../Pages/Account/PaymentReceiveForm";
import PaymentReceive from "../Pages/Account/PaymentReceive";
import DriverLedger from "../Pages/Account/DriverLedger";
import UpdateCarForm from "../Pages/UpdateCarForm";
import UpdateCustomerForm from "../Pages/Customer/UpdateCustomerForm";
import UpdateEmployeeForm from "../Pages/HR/HRM/UpdateEmployeeForm";
import UpdateSupplyForm from "../Pages/Purchase/UpdateSupplyForm";
import UpdateRentVehicleForm from "../Pages/UpdateRentVehicleForm";
import UpdateOfficeForm from "../Pages/HR/HRM/UpdateOfficeForm";
import UpdateVendorForm from "../Pages/UpdateVendorForm";
import UpdateLeaveForm from "../Pages/HR/UpdateLeaveForm";
import HelperList from "../Pages/HelperList";
import AddHelper from "../Pages/AddHelper";
import VendorLedger from "../Pages/Account/VendorLedger";
import UpdateStockOutForm from "../Pages/updateForm/UpdateStockOutForm";
import SalaryExpense from "../Pages/HR/HRM/SalaryExpense";
import OfficialExpense from "../Pages/HR/HRM/OfficialExpense";
import MonthlyStatement from "../Pages/MonthlyStatement";
import VendorPayment from "../Pages/Account/VendorPayment";
import VendorPaymentForm from "../Pages/VendorPaymentForm";
import RoutePricing from "../Pages/Customer/RoutePricing";
import VehicleReport from "../Pages/Reports/VehicelReport";
import OfficialProduct from "../Pages/Purchase/OfficialProducts";
import OfficialProductForm from "../Pages/Purchase/OfficialProductForm";
import Bill from "../Pages/Billing/Bill";
import Party from "../Pages/Console/Party";
import PartyForm from "../Pages/Console/PartyForm";
import DistributionPoint from "../Pages/Console/DistributionPoint";
import DistributionForm from "../Pages/Console/DistributionForm";
import PartyLedger from "../Pages/Console/PartyLedger";
import DistributorLedger from "../Pages/Console/DistributorLedger";
import Booking from "../Pages/Console/Booking";
import BookingForm from "../Pages/Console/BookingForm";
import AdjustmentForm from "../Pages/Adjustment/AdjustmentForm";
import AdjustmentList from "../Pages/Adjustment/AdjustmentList";
export const router = createBrowserRouter([
  {
    path: "/tramessy",
    element: <Main />,
    children: [
      {
        path: "/tramessy",
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/CarList",
        element: (
          <PrivateRoute>
            <CarList />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/AddCarForm",
        element: (
          <PrivateRoute>
            <AddCarForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/UpdateCarForm/:id",
        element: (
          <PrivateRoute>
            <UpdateCarForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(
            `${import.meta.env.VITE_BASE_URL}/api/vehicle/show/${params.id}`
          ),
      },
      {
        path: "/tramessy/DriverList",
        element: (
          <PrivateRoute>
            <DriverList />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/HelperList",
        element: (
          <PrivateRoute>
            <HelperList />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/AddHelper",
        element: (
          <PrivateRoute>
            <AddHelper />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/update-helper/:id",
        element: (
          <PrivateRoute>
            <AddHelper />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/AddDriverForm",
        element: (
          <PrivateRoute>
            <AddDriverForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/UpdateDriverForm/:id",
        element: (
          <PrivateRoute>
            <UpdateDriverForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(
            `${import.meta.env.VITE_BASE_URL}/api/driver/show/${params.id}`
          ),
      },
      {
        path: "/tramessy/TripList",
        element: (
          <PrivateRoute>
            <TripList />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/AddTripForm",
        element: (
          <PrivateRoute>
            <AddTripForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/UpdateTripForm/:id",
        element: (
          <PrivateRoute>
            {/* <UpdateTripForm /> */}
            <AddTripForm />
          </PrivateRoute>
        ),
        // loader: ({ params }) =>
        //   fetch(
        //     `${import.meta.env.VITE_BASE_URL}/api/trip/show/${params.id}`
        //   ),
      },
      {
        path: "/tramessy/Fuel",
        element: (
          <PrivateRoute>
            <Fuel />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/FuelForm",
        element: (
          <PrivateRoute>
            <FuelForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/UpdateFuelForm/:id",
        element: (
          <PrivateRoute>
            <UpdateFuelForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(`https://api.tramessy.com/api/fuel/${params.id}`),
      },
      {
        path: "/tramessy/Parts",
        element: (
          <PrivateRoute>
            <Parts />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/UpdatePartsForm/:id",
        element: (
          <PrivateRoute>
            <UpdatePartsForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(`https://api.tramessy.com/api/parts/${params.id}`),
      },
      {
        path: "/tramessy/Maintenance",
        element: (
          <PrivateRoute>
            <Maintenance />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/MaintenanceForm",
        element: (
          <PrivateRoute>
            <MaintenanceForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/UpdateMaintenanceForm/:id",
        element: (
          <PrivateRoute>
            <UpdateMaintenanceForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(`https://api.tramessy.com/api/maintenance/${params.id}`),
      },
      {
        path: "/tramessy/VendorList",
        element: (
          <PrivateRoute>
            <VendorList />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/AddVendorForm",
        element: (
          <PrivateRoute>
            <AddVendorForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/UpdateVendorForm/:id",
        element: (
          <PrivateRoute>
            <UpdateVendorForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(
            `${import.meta.env.VITE_BASE_URL}/api/vendor/show/${params.id}`
          ),
      },
      {
        path: "/tramessy/RentList",
        element: (
          <PrivateRoute>
            <RentList />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/AddRentVehicleForm",
        element: (
          <PrivateRoute>
            <AddRentVehicleForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/UpdateRentVehicleForm/:id",
        element: (
          <PrivateRoute>
            <UpdateRentVehicleForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(`${import.meta.env.VITE_BASE_URL}/api/rent/show/${params.id}`),
      },
      {
        path: "/tramessy/DailyIncome",
        element: (
          <AdminRoute>
            <DailyIncome />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/DailyExpense",
        element: (
          <PrivateRoute>
            <DailyExpense />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/monthly-statement",
        element: (
          <AdminRoute>
            <MonthlyStatement />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/AllUsers",
        element: (
          <AdminRoute>
            <AllUsers />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/AddUserForm",
        element: (
          <AdminRoute>
            <AddUserForm />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/update-user/:id",
        element: (
          <AdminRoute>
            <AddUserForm />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/Login",
        element: <Login />,
      },
      {
        path: "/tramessy/ResetPass",
        element: <ResetPass />,
      },
      {
        path: "/tramessy/UpdateDailyIncomeForm/:id",
        element: (
          <AdminRoute>
            <UpdateDailyIncomeForm />
          </AdminRoute>
        ),
        loader: ({ params }) =>
          fetch(`https://api.tramessy.com/api/trip/${params.id}`),
      },
      {
        path: "/tramessy/UpdateExpenseForm/:id",
        element: (
          <PrivateRoute>
            <UpdateExpenseForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(`https://api.tramessy.com/api/trip/${params.id}`),
      },

      // HR
      {
        path: "/tramessy/HR/HRM/employee-list",
        element: <EmployeeList />,
      },
      {
        path: "/tramessy/HR/HRM/Office",
        element: <Office />,
      },
      {
        path: "/tramessy/HR/HRM/salary-expense",
        element: <SalaryExpense />,
      },
      {
        path: "/tramessy/HR/HRM/office-expense",
        element: <OfficialExpense />,
      },
      {
        path: "/tramessy/HR/HRM/OfficeForm",
        element: <OfficeForm />,
      },
      {
        path: "/tramessy/HR/HRM/UpdateOfficeForm/:id",
        element: (
          <PrivateRoute>
            <UpdateOfficeForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(
            `${import.meta.env.VITE_BASE_URL}/api/office/show/${params.id}`
          ),
      },
      {
        path: "/tramessy/HR/HRM/AddEmployee",
        element: <AddEmployee />,
      },
      {
        path: "/tramessy/UpdateEmployeeForm/:id",
        element: (
          <PrivateRoute>
            <UpdateEmployeeForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(
            `${import.meta.env.VITE_BASE_URL}/api/employee/show/${params.id}`
          ),
      },
      {
        path: "/tramessy/HR/Attendance/AttendanceList",
        element: <AttendanceList />,
      },

      {
        path: "/tramessy/HR/HRM/Attendance/AttendanceForm",
        element: <AttendanceForm />,
      },
      // payroll
      {
        path: "/tramessy/HRM/Payroll/Advance-Salary",
        element: <AdvanceSalary />,
      },
      {
        path: "/tramessy/HRM/Payroll/Advance-Salary-Form",
        element: <AdvanceSalaryForm />,
      },
      {
        path: "/tramessy/HRM/payroll/generate-salary",
        element: <GenerateSalary />,
      },
      {
        path: "/tramessy/HRM/payroll/generate-salary-form",
        element: <GenerateSalaryForm />,
      },
      {
        path: "/tramessy/HR/HRM/Leave",
        element: <Leave />,
      },
      {
        path: "/tramessy/HR/HRM/LeaveForm",
        element: <LeaveForm />,
      },
      {
        path: "/tramessy/UpdateLeaveForm/:id",
        element: (
          <PrivateRoute>
            <UpdateLeaveForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(`${import.meta.env.VITE_BASE_URL}/api/leave/show/${params.id}`),
      },
      {
        path: "/tramessy/Purchase/maintenance",
        element: <PurchaseList />,
      },
      {
        path: "/tramessy/Purchase/official-product",
        element: <OfficialProduct />,
      },
      {
        path: "/tramessy/Purchase/add-maintenance",
        element: <PurchaseForm />,
      },
      {
        path: "/tramessy/Purchase/update-maintenance/:id",
        element: <PurchaseForm />,
      },
      {
        path: "/tramessy/Purchase/add-officialProduct",
        element: <OfficialProductForm />,
      },
      {
        path: "/tramessy/Purchase/update-officialProduct/:id",
        element: <OfficialProductForm />,
      },
      {
        path: "/tramessy/Purchase/SupplierList",
        element: <SupplierList />,
      },
      {
        path: "/tramessy/Purchase/AddSupply",
        element: <AddSupply />,
      },
      {
        path: "/tramessy/UpdateSupplyForm/:id",
        element: (
          <PrivateRoute>
            <UpdateSupplyForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(
            `${import.meta.env.VITE_BASE_URL}/api/supply/show/${params.id}`
          ),
      },
      // Inventory
      {
        path: "/tramessy/Inventory/Stockin",
        element: <Stockin />,
      },
      {
        path: "/tramessy/Inventory/AddStock",
        element: <AddStock />,
      },
      {
        path: "/tramessy/Inventory/StockOut",
        element: <StockOut />,
      },
      {
        path: "/tramessy/Inventory/StockOutForm",
        element: <StockOutForm />,
      },
      {
        path: "/tramessy/Inventory/UpdateStockOutForm/:id",
        element: <UpdateStockOutForm />,
      },
      {
        path: "/tramessy/Inventory/Inventory-supplier",
        element: <InventorySupplier />,
      },
      {
        path: "/tramessy/Inventory/InventorySupplierForm",
        element: <InventorySupplierForm />,
      },
      // console
      {
        path: "/tramessy/console/party",
        element: <Party />,
      },
      {
        path: "/tramessy/console/add-party",
        element: <PartyForm />,
      },
      {
        path: "/tramessy/console/booking",
        element: <Booking />,
      },
      {
        path: "/tramessy/console/add-booking",
        element: <BookingForm />,
      },
      {
        path: "/tramessy/console/distribution-point",
        element: <DistributionPoint />,
      },
      {
        path: "/tramessy/console/add-distribution-point",
        element: <DistributionForm />,
      },
      {
        path: "/tramessy/console/distributor-ledger",
        element: <DistributorLedger />,
      },
      {
        path: "/tramessy/console/party-ledger",
        element: <PartyLedger />,
      },
      // Customer
      {
        path: "/tramessy/Customer",
        element: <Customer />,
      },
      {
        path: "/tramessy/route-pricing",
        element: <RoutePricing />,
      },
      {
        path: "/tramessy/AddCustomer",
        element: <AddCustomer />,
      },
      {
        path: "/tramessy/UpdateCustomerForm/:id",
        element: <UpdateCustomerForm />,
        loader: ({ params }) =>
          fetch(
            `${import.meta.env.VITE_BASE_URL}/api/customer/show/${params.id}`
          ),
      },
      // Reports
      {
        path: "/tramessy/Reports/Employee-Report",
        element: (
          <AdminRoute>
            <EmployeeReport />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/Reports/Driver-Report",
        element: (
          <AdminRoute>
            <DriverReport />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/Reports/vehicle-report",
        element: (
          <AdminRoute>
            <VehicleReport />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/Reports/Fuel-Report",
        element: (
          <AdminRoute>
            <FuelReport />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/Reports/Purchase-Report",
        element: (
          <AdminRoute>
            <PurchaseReport />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/Reports/Inventory-Report",
        element: <InventoryReport />,
      },
      {
        path: "/tramessy/Reports/Trip-Report",
        element: (
          <AdminRoute>
            <TripReport />
          </AdminRoute>
        ),
      },
      // billing
      {
        path: "/tramessy/billing/bill",
        element: (
          <AdminRoute>
            <Bill />
          </AdminRoute>
        ),
      },
      // Account
      {
        path: "/tramessy/account/CashDispatch",
        element: (
          <AdminRoute>
            <CashDispatch />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/CashDispatchForm",
        element: (
          <AdminRoute>
            <CashDispatchForm />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/update-CashDispatch/:id",
        element: (
          <AdminRoute>
            <CashDispatchForm />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/PaymentList",
        element: (
          <AdminRoute>
            <PaymentList />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/PaymentReceive",
        element: (
          <AdminRoute>
            <PaymentReceive />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/PaymentReceiveForm",
        element: (
          <AdminRoute>
            <PaymentReceiveForm />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/update-PaymentReceiveForm/:id",
        element: (
          <AdminRoute>
            <PaymentReceiveForm />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/vendor-payment",
        element: (
          <AdminRoute>
            <VendorPayment />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/add-vendor-payment",
        element: (
          <AdminRoute>
            <VendorPaymentForm />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/update-vendor-payment/:id",
        element: (
          <AdminRoute>
            <VendorPaymentForm />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/CustomerLedger",
        element: (
          <AdminRoute>
            <CustomerLedger />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/SupplierLedger",
        element: (
          <AdminRoute>
            <SupplierLedger />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/DriverLedger",
        element: (
          <AdminRoute>
            <DriverLedger />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/VendorLedger",
        element: (
          <AdminRoute>
            <VendorLedger />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/account/OfficeLedger",
        element: (
          <AdminRoute>
            <OfficeLedger />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/AdjustmentForm",
        element: (
          <AdminRoute>
            <AdjustmentForm />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/updateAdjustment/:id",
        element: (
          <AdminRoute>
            <AdjustmentForm />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/AdjustmentList",
        element: (
          <AdminRoute>
            <AdjustmentList />
          </AdminRoute>
        ),
      },
    ],
  },
]);
