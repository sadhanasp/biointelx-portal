import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function EnzymeQuantificationChart({ data }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      calculateQuantification();
    }
  }, [data]);

  const quantifyEnzyme = (value) => {
    if (!value || value === "-" || value === "") return 0; // Not present
    if (value === "Yes" || value === "+") return 2; // Low
    if (value === "Low") return 1; // Low
    if (value === "Moderate") return 3; // Moderate
    if (value === "High") return 5; // High
    if (value === "Low-Moderate") return 2; // Low-Moderate -> Low
    if (value === "Variable") return 3; // Variable -> Moderate
    return 0; // Default not present
  };

  const getCategory = (score) => {
    if (score === 0) return "Not Present";
    if (score >= 1 && score <= 2) return "Low";
    if (score === 3) return "Moderate";
    if (score >= 4 && score <= 5) return "High";
    return "Unknown";
  };

  const calculateQuantification = () => {
    const enzymes = ["chitinase", "glucanase", "cellulase", "amylase", "protease", "lipase", "phytase"];

    // Calculate totals for each category
    const totals = { Low: 0, Moderate: 0, High: 0, "Not Present": 0 };

    data.forEach(record => {
      enzymes.forEach(enzyme => {
        const value = record[enzyme];
        const score = quantifyEnzyme(value);
        const category = getCategory(score);
        totals[category]++;
      });
    });

    // Convert to chart format
    const chartFormat = [
      {
        category: "High Activity",
        count: totals.High,
        color: "#3B82F6" // blue-600
      },
      {
        category: "Moderate Activity",
        count: totals.Moderate,
        color: "#F59E0B" // amber-500
      },
      {
        category: "Low Activity",
        count: totals.Low,
        color: "#F97316" // orange-500
      },
      {
        category: "Not Present",
        count: totals["Not Present"],
        color: "#6B7280" // gray-500
      }
    ];

    setChartData(chartFormat);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          <p className="text-blue-600">
            {`Count: ${payload[0].value}`}
          </p>
          <p className="text-sm text-gray-600">
            {`Percentage: ${((payload[0].value / data.length / 7) * 100).toFixed(1)}% of total enzyme tests`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
      <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
        🧪 Enzyme Activity Quantification
      </h3>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Distribution of enzyme activities across all microbial records (1-5 scale)
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {chartData.map((item, index) => (
          <div key={index} className="text-center">
            <div className="text-lg font-bold" style={{ color: item.color }}>
              {item.count}
            </div>
            <div className="text-xs text-gray-600">{item.category}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Scale: High (4-5) • Moderate (3) • Low (1-2) • Not Present (0)
      </div>
    </div>
  );
}
