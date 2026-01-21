import { useRef } from "react";
import Plot from "react-plotly.js";

export default function PgprGauge({ data }) {
  const plotRef = useRef(null);
  const total = data.length;
  const pgpr = data.filter((d) => d.beneficialRole?.toLowerCase().includes("pgpr")).length;
  const pathogens = total - pgpr;

  const handleDownload = () => {
    if (plotRef.current) {
      plotRef.current.downloadImage('png', 1, 'PGPR_vs_Pathogens');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-green-700 flex-1">PGPR vs Pathogens</h3>
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
        ref={plotRef}
        data={[
          {
            values: [pgpr, pathogens],
            labels: ["PGPR (Beneficial)", "Pathogenic"],
            type: "pie",
            hole: 0.5,
            marker: { colors: ["#16a34a", "#facc15"] },
          },
        ]}
        layout={{
          height: 300,
          showlegend: true,
          margin: { t: 20, b: 20 },
        }}
        config={{ displayModeBar: true, responsive: true }}
      />
    </div>
  );
}
