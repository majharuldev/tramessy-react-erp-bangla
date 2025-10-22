import OverViewCard from "../components/OverViewCard";
import StatisticsCard from "../components/StatisticsCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import useProfitLoseData from "../hooks/useProfitLoseHook";
const Home = () => {
  const { data:monthlyData, loading: monthlyLoading } = useProfitLoseData("month");
  const { data:yearlyData, loading: yearlyLoading } = useProfitLoseData("year");

  if (monthlyLoading || yearlyLoading) {
    return <div className="bg-white p-4 rounded-lg shadow">Loading charts...</div>;
  }
  return (
    <div className="p-2">
      <OverViewCard />
      <div className="grid grid-cols-2  pt-5">
        <div className="pr-5">
          <StatisticsCard />
        </div>
         <div>
          {/* Present Month Graph */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Present Month Profit vs Expense
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  barCategoryGap="30%" // gap between categories
                  barGap={5} // gap between bars
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 'dataMax']} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalExpense" fill="#ed4553" name="Total Expense" />
                  <Bar dataKey="netProfit" fill="#239230" name="Net Profit" minPointSize={5}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <div>
        {/* Present Year Graph */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Yearly Profit vs Expense
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearlyData}
                barCategoryGap="30%"
                barGap={5}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 'dataMax']} allowDecimals={false}/>
                <Tooltip />
                <Legend />
                <Bar dataKey="totalExpense" fill="#ed4553" name="Total Expense" />
                <Bar dataKey="netProfit" fill="#239230" name="Net Profit"  minPointSize={5}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
