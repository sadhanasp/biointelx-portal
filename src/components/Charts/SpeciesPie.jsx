import { useState } from "react";
import Plot from "react-plotly.js";
import Plotly from "plotly.js";

export default function SpeciesPie({ data }) {
  const [plotInstance, setPlotInstance] = useState(null);
  // Count occurrences per species
  const counts = data.reduce((acc, d) => {
    const key = d.primarySpecies?.trim() || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Sort and group
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top10 = entries.slice(0, 8);
  const others = entries.slice(8).reduce((sum, [, v]) => sum + v, 0);
  if (others > 0) top10.push(["Others", others]);

  const labels = top10.map(([k]) => k);
  const values = top10.map(([, v]) => v);

  const handleDownload = () => {
    if (plotInstance) {
      Plotly.downloadImage(plotInstance, {format: 'png', width: 800, height: 600, filename: 'Species_Distribution'});
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-green-700 text-center flex-1">
          Species Distribution (Top 8)
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
            values,
            labels,
            type: "pie",
            textinfo: "label+percent",
            textposition: "outside",
            hole: 0.3,
            automargin: true,
            pull: 0.03,
            marker: {
              colors: [
                "#166534",
                "#15803d",
                "#16a34a",
                "#22c55e",
                "#65a30d",
                "#84cc16",
                "#bef264",
                "#facc15",
                "#fef9c3",
              ],
            },
          },
        ]}
        layout={{
          height: 400,
          margin: { t: 20, b: 20, l: 20, r: 20 },
          showlegend: false,
        }}
        config={{ displayModeBar: false, responsive: true }}
        onInitialized={(figure, graphDiv) => setPlotInstance(graphDiv)}
      />
    </div>
  );
}
