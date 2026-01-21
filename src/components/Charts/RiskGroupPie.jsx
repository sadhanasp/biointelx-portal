import { useState } from "react";
import Plot from "react-plotly.js";
import Plotly from 'plotly.js/dist/plotly';

export default function RiskGroupPie({ data }) {
  const [plotInstance, setPlotInstance] = useState(null);
  const groups = data.reduce((acc, d) => {
    const g = d.riskGroup?.trim() || "Not Specified";
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  const handleDownload = () => {
    if (plotInstance) {
      Plotly.downloadImage(plotInstance, {format: 'png', width: 800, height: 600, filename: 'Risk_Group_Distribution'});
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-green-700 flex-1">Risk Group Distribution</h3>
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
            values: Object.values(groups),
            labels: Object.keys(groups),
            type: "pie",
            hole: 0.4,
            textinfo: "percent",
            marker: { colors: ["#bbf7d0","#84cc16","#facc15","#fef9c3","#a3e635"] },
          },
        ]}
        layout={{ height: 320, showlegend: true, legend: { orientation: "h" }, margin: { t: 20, b: 20 } }}
        config={{ displayModeBar: false, responsive: true }}
        onInitialized={(figure, graphDiv) => setPlotInstance(graphDiv)}
      />
    </div>
  );
}
