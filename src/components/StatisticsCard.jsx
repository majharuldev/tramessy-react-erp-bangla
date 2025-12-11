import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineBellAlert } from "react-icons/hi2";

const StatisticsCard = () => {
  const [expiringDocs, setExpiringDocs] = useState([]);
  const {t} = useTranslation();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/vehicle/list`
        );
        const vehicles = response.data?.data || [];
        const today = dayjs();
        const expiring = [];

        vehicles.forEach((vehicle) => {
          ["fitness_date", "road_permit_date", "registration_date"].forEach(
            (type) => {
              const rawDate = vehicle[type];
              if (rawDate) {
                const date = dayjs(rawDate);
                const remaining = date.diff(today, "day");

                if (date.isValid() && remaining >= 0 && remaining <= 7) {
                  expiring.push({
                    vehicle: `${vehicle.registration_zone}-${vehicle.registration_number}`,
                    document: type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase()),
                    expireDate: date.format("DD-MM-YYYY"),
                    remaining,
                  });
                }
              }
            }
          );
        });

        setExpiringDocs(expiring);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
        <h3 className="text-xl font-bold text-primary border-b border-gray-200 pb-2 mb-4">
          {t("documentReminder")}
        </h3>
        {expiringDocs.length > 0 ? (
          <div className="overflow-x-auto max-h-56 overflow-y-auto hide-scrollbar">
            <table className="min-w-full text-sm text-left border border-gray-200">
              <thead className="bg-gray-100 text-primary">
                <tr>
                  <th className="p-2">{t("sl")}</th>
                  <th className="p-2">{t("vehicleNo")}</th>
                  <th className="p-2">{t("document")}</th>
                  <th className="p-2">{t("remaining")}</th>
                </tr>
              </thead>
              <tbody>
                {expiringDocs.map((item, i) => (
                  <tr
                    key={i}
                    className="text-gray-700 font-semibold text-sm border-b border-gray-200"
                  >
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{item.vehicle}</td>
                    <td className="p-2">{item.document}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                          item.remaining === 0 ? "bg-red-500" : "bg-yellow-500"
                        }`}
                      >
                        {item.remaining} {item.remaining === 1 ? "day" : "days"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <span className="text-9xl flex justify-center">
              <HiOutlineBellAlert />
            </span>
            <p className="text-lg">{t("noDocumentsExpiringSoon.")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsCard;
