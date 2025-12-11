import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
const OverViewCard = () => {
  const [tripCost, setTripCost] = useState(0);
  const [tripCommission, setTripCommission] = useState(0);
  const [tripLabor, setTripLabor] = useState(0);
  const [tripOtherCost, setTripOtherCost] = useState(0);
  const [dailySales, setDailySales] = useState({});
  const [otherExpense, setOtherExpense] = useState(0);
  const [totalTodayExpense, setTotalTodayExpense] = useState(0);
  const [totalDispatch, setTotalDispatch] = useState(0);
  const [totalReceiveAmount, setTotalReceiveAmount] = useState(0);
  const today = dayjs().format("YYYY-MM-DD");
  const [todayTripCount, setTodayTripCount] = useState(0);
  const {t} = useTranslation();
  // daily trip
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((res) => {
        const allTrips = res.data.data;
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];
        // Filter trips matching today's date
        const todayTrips = allTrips.filter((trip) => trip.date === today);
        // Set today's trip count
        setTodayTripCount(todayTrips.length);
      });
  }, []);
  // daily sales
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((response) => {
        const data = response.data.data;
        const today = new Date().toISOString().split("T")[0];
        const sale = data
          .filter((item) => item.date === today)
          .reduce((sum, trip) => sum + parseFloat(trip.total_rent || 0), 0);

        setDailySales(sale);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
      });
  }, []);
  // daily expense
  useEffect(() => {
    const fetchTodayExpenses = async () => {
      try {
        // Fetch Purchase
        const purchaseRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/purchase/list`
        );
        const purchases = purchaseRes.data?.data || [];
        const todayPurchases = purchases.filter((item) => item.date === today);
        const purchaseTotal = todayPurchases.reduce((sum, item) => {
          const qty = parseFloat(item.quantity);
          const price = parseFloat(item.unit_price);
          return sum + (isNaN(qty) || isNaN(price) ? 0 : qty * price);
        }, 0);

        // Fetch Trips
        const tripRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/trip/list`
        );
        const trips = tripRes.data?.data || [];
        const todayTrips = trips.filter((item) => item.date === today);

        let commission = 0;
        let labor = 0;
        let other = 0;

        todayTrips.forEach((trip) => {
          commission += parseFloat(trip.driver_commission) || 0;
          labor += parseFloat(trip.labor) || 0;

          const otherFields = [
            "fuel_cost",
            "road_cost",
            "food_cost",
            "body_fare",
            "toll_cost",
            "feri_cost",
            "police_cost",
            "driver_adv",
            "chada",
            "parking_cost",
            "night_guard",
            "unload_charge",
            "extra_fare",
            "vehicle_rent",
          ];

          otherFields.forEach((field) => {
            const val = parseFloat(trip[field]);
            if (!isNaN(val)) {
              other += val;
            }
          });
        });

        const tripTotal = commission + labor + other;
        const totalExpense = purchaseTotal + tripTotal;

        setTripCost(tripTotal);
        setOtherExpense(purchaseTotal);
        setTotalTodayExpense(totalExpense);

        // Optional: Set breakdowns if you want to show them individually
        setTripCommission(commission);
        setTripLabor(labor);
        setTripOtherCost(other);
      } catch (err) {
        console.error("Error fetching expenses:", err);
      }
    };

    fetchTodayExpenses();
  }, [today]);

  // daily cash dispatch
  useEffect(() => {
    const fetchDispatch = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/account/list`
        );
        const data = response.data?.data || [];
        const total = data
          .filter((item) => item.date === today)
          .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        setTotalDispatch(total);
      } catch (error) {
        console.error("Failed to fetch dispatch data:", error);
      }
    };
    fetchDispatch();
  }, [today]);
  // daily receive amount
  useEffect(() => {
    const fetchAmount = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/paymentRecived/list`
        );
        const data = response.data?.data || [];
        const total = data
          .filter((item) => item.date === today)
          .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        setTotalReceiveAmount(total);
      } catch (error) {
        console.error("Failed to fetch receive amount data:", error);
      }
    };
    fetchAmount();
  }, [today]);
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* daily trip */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 cursor-pointer">
          <h3 className="text-lg font-bold text-primary border-b border-gray-200 pb-2 mb-4">
            {t("dailyTrip")}
          </h3>
          <div className="text-gray-700 text-sm space-y-2">
            <div className="flex justify-between font-semibold">
              <span>{t("todayTrip")}</span>-<span> {todayTripCount}</span>
            </div>
          </div>
        </div>
        {/* Sales */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 cursor-pointer">
          <h3 className="text-lg font-bold text-primary border-b border-gray-200 pb-2 mb-4">
            {t("dailySales")}
          </h3>
          <div className="text-gray-700 text-sm space-y-2">
            <div className="flex justify-between font-semibold">
              <span>{t("todaySales")}</span>-
              <span>{dailySales.toLocaleString()} TK</span>
            </div>
          </div>
        </div>
        {/* Daily cash dispatch */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 cursor-pointer">
          <h3 className="text-lg font-bold text-primary border-b border-gray-200 pb-2 mb-4">
            {t("dailyCashDispatch")}
          </h3>
          <div className="text-gray-700 text-sm space-y-2">
            <div className="flex justify-between font-semibold">
              <span>{t("totalDispatch")}</span>-
              <span>{totalDispatch.toLocaleString()} TK</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5">
        {/* Daily receive amount */}
        <div className="col-span-1 bg-white rounded-xl shadow-md p-5 border border-gray-200 cursor-pointer">
          <h3 className="text-lg font-bold text-primary border-b border-gray-200 pb-2 mb-4">
            {t("dailyReceiveAmount")}
          </h3>
          <div className="text-gray-700 text-sm space-y-2">
            <div className="flex justify-between font-semibold">
              <span>{t("receiveAmount")}</span>-
              <span>{totalReceiveAmount.toLocaleString()} TK</span>
            </div>
          </div>
        </div>
        {/* daily expense */}
        <div className="col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-primary border-b border-gray-300 pb-3 mb-4">
            📋 {t("dailyExpenseSummary")}
          </h3>

          <div className="text-sm text-gray-700">
            <div className="grid grid-cols-5 gap-3 font-semibold py-2 px-3 bg-gray-100 rounded-md">
              <div>{t("expenseType")}</div>
              <div className="text-center">{t("commission")}</div>
              <div className="text-center">{t("labor")}</div>
              <div className="text-right">{t("others")}</div>
              <div className="text-right">{t("Total")}</div>
            </div>

            <div className="grid grid-cols-5 gap-3 py-2 px-3 items-center hover:bg-gray-50 transition">
              <div className="font-medium text-primary">{t("tripCost")}</div>
              <div className="text-center">{tripCommission} TK</div>
              <div className="text-center">{tripLabor} TK</div>
              <div className="text-right">{tripOtherCost} TK</div>
              <div className="text-right">{tripCost} TK</div>
            </div>

            <div className="border-t border-gray-200 pt-2 space-y-2">
              <div className="flex justify-between font-medium">
                <span>🧾 {t("otherExpenses")}</span>
                <span>{otherExpense} TK</span>
              </div>

              <div className="flex justify-between font-bold text-base text-primary border-t border-dashed border-gray-300 pt-3 mt-2">
                <span>💰 {t("totalExpense")}</span>
                <span>{totalTodayExpense.toFixed(2)} TK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverViewCard;
