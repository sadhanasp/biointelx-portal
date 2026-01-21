import { useState } from "react";
import Plot from "react-plotly.js";
import Plotly from 'plotly.js/dist/plotly';

export default function TrendLine({ data }) {
  const [plotInstance, setPlotInstance] = useState(null);
  const monthly = data.reduce((acc, d) => {
    if (d.dateOfCollection) {
      const month = d.dateOfCollection.slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
    }
    return acc;
  }, {});
  const months = Object.keys(monthly).sort();

  const handleDownload = () => {
    if (plotInstance) {
      Plotly.downloadImage(plotInstance, {format: 'png', width: 800, height: 600, filename: 'Collection_Trend_Over_Time'});
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-green-700 flex-1">
          Collection Trend Over Time
        </h3>
        <button
          onClick={handleDownload}
          className="ml-2 p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
          title="Download Chart"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
      <Plot
        data={[
          {
            x: months,
            y: months.map((m) => monthly[m]),
            type: "scatter",
            mode: "lines+markers",
            fill: "tozeroy",
            line: { color: "#16a34a", width: 3 },
            marker: { size: 6 },
          },
        ]}
        layout={{
          height: 320,
          margin: { t: 20, b: 50 },
          xaxis: { title: "Month" },
          yaxis: { title: "Samples" },
        }}
        config={{ displayModeBar: false, responsive: true }}
        onInitialized={(figure, graphDiv) => setPlotInstance(graphDiv)}
      />
    </div>
  );
}
