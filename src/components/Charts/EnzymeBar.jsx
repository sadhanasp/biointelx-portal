import { useState } from "react";
import Plot from "react-plotly.js";
import Plotly from 'plotly.js/dist/plotly';

export default function EnzymeBar({ data }) {
  const [plotInstance, setPlotInstance] = useState(null);
  const enzymes = ["Chitinase", "Glucanase", "Cellulase", "Amylase", "Protease", "Lipase", "Phytase"];
  const fields = [d => d.chitinase, d => d.glucanase, d => d.cellulase, d => d.amylase, d => d.protease, d => d.lipase, d => d.phytase];
  const counts = enzymes.map((e, i) =>
    data.filter((d) => {
      const value = fields[i](d);
      return value && value !== "-" && value !== "";
    }).length
  );

  const handleDownload = () => {
    if (plotInstance) {
      Plotly.downloadImage(plotInstance, {format: 'png', width: 800, height: 600, filename: 'Enzyme_Activity_Count'});
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-green-700 flex-1">
          Enzyme Activity Count
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
            x: enzymes,
            y: counts,
            type: "bar",
            marker: { color: ["#22c55e","#84cc16","#facc15","#65a30d","#ef4444","#8b5cf6","#06b6d4"] },
          },
        ]}
        layout={{
          height: 300,
          margin: { t: 20, b: 50 },
        }}
        config={{ displayModeBar: false, responsive: true }}
        onInitialized={(figure, graphDiv) => setPlotInstance(graphDiv)}
      />
    </div>
  );
}
