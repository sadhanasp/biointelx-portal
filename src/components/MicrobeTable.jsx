import { useNavigate } from "react-router-dom";

export default function MicrobeTable({ data, onEdit, onDelete }) {
  const navigate = useNavigate();
  // Collect all unique custom field keys from all records
  const customFieldKeys = new Set();
  data.forEach(record => {
    if (record.customFields) {
      Object.keys(record.customFields).forEach(key => customFieldKeys.add(key));
    }
  });
  const customFieldColumns = Array.from(customFieldKeys).sort();

  const groups = [
    {
      title: "Actions",
      columns: ["Actions"]
    },
    {
      title: "Basic Information",
      columns: ["ID", "Source", "Location", "Primary Species", "Beneficial Role", "Risk Group", "Uses", "Accession", "Identity Percent", "Date of Collection", "Location Coordinates", "Sequence Data"]
    },
    {
      title: "Morphological Characteristics",
      columns: ["Shape", "Colour", "Gram Nature", "Spore Formation"]
    },
    {
      title: "Biochemical Tests",
      columns: ["Catalase", "Oxidase", "Nitrate Reduction", "Salt Tolerance", "pH Range"]
    },
    {
      title: "Plant Growth Promoting Activities",
      columns: ["Phosphate Solubilization", "Potassium Solubilization", "Nitrogen Fixation", "Zinc Solubilization", "Iron Mobilization", "Sulphur Oxidation", "Silicate Solubilization", "IAA Production", "GA3 Production", "Cytokinin Production", "ACC Deaminase Activity", "Ammonia Production", "ROS Scavenging", "Salt Drought Tolerance"]
    },
    {
      title: "Antagonistic Activities",
      columns: ["Antifungal Activity", "Antibacterial Activity"]
    },
    {
      title: "Enzyme Activities",
      columns: ["Chitinase", "Glucanase", "Cellulase", "Amylase", "Protease", "Lipase", "Phytase"]
    },
    {
      title: "Other Activities",
      columns: ["VOC Production", "Biofilm Formation", "EPS"]
    },
    {
      title: "Analytical Techniques",
      columns: ["Whole Genome Sequencing", "Metabolite Extraction", "UV Spectroscopy", "HPLC", "GCMS LCMS"]
    },
    {
      title: "Compatibility/Uses",
      columns: ["Bioagents", "Fertilizer", "Pesticide"]
    },
    {
      title: "Accession Numbers",
      columns: ["NCBI", "NBAIM", "MTCC"]
    },
    ...(customFieldColumns.length > 0 ? [{
      title: "Custom Fields",
      columns: customFieldColumns
    }] : [])
  ];

  return (
    <div className="mt-8 shadow-lg rounded-lg bg-white" style={{ overflowX: 'auto', maxWidth: '100%', scrollbarWidth: 'thin', scrollbarColor: '#16a34a #f0fdf4' }}>
      <table className="border border-green-200 rounded-lg" style={{ minWidth: '2500px', width: '2500px' }}>
        <thead>
          <tr>
            {groups.map((group) => (
              <th key={group.title} colSpan={group.columns.length} className="px-3 py-2 text-center font-bold text-green-900 bg-green-200 whitespace-nowrap border border-green-300">
                {group.title}
              </th>
            ))}
          </tr>
          <tr>
            {groups.flatMap((group) =>
              group.columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left font-semibold text-green-800 bg-green-100 whitespace-nowrap border border-green-300">
                  {col}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id}
              className={`${
                i % 2 === 0 ? "bg-green-50" : "bg-white"
              } hover:bg-green-100 transition`}
            >
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(row)}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    title="Edit"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => onDelete(row)}
                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    title="Delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">{row.id}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.sourceCode}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.location}</td>
              <td className="px-3 py-2 whitespace-nowrap font-medium text-green-700">{row.primarySpecies}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    row.beneficialRole?.toLowerCase().includes("pgpr")
                      ? "bg-green-200 text-green-800"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {row.beneficialRole || "—"}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">{row.riskGroup}</td>
              <td className="px-3 py-2 whitespace-nowrap italic text-gray-600">{row.uses}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.accession}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.identityPercent}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.dateOfCollection}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.locationCoordinates}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.sequenceData}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.shape}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.colour}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.gramNature}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.sporeFormation}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.catalase}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.oxidase}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.nitrateReduction}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.saltTolerance}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.pHRange}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.phosphateSolubilization}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.potassiumSolubilization}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.nitrogenFixation}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.zincSolubilization}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.ironMobilization}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.sulphurOxidation}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.silicateSolubilization}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.iaaProduction}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.ga3Production}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.cytokininProduction}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.accDeaminaseActivity}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.ammoniaProduction}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.rosScavenging}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.saltDroughtTolerance}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.antifungalActivity}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.antibacterialActivity}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.chitinase}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.glucanase}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.cellulase}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.vocProduction}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.biofilmFormation}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.eps}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.amylase}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.protease}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.lipase}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.phytase}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.wholeGenomeSequencing}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.metaboliteExtraction}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.uvSpectroscopy}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.hplc}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.gcmsLcms}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.bioagents}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.fertilizer}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.pesticide}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.ncbi}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.nbaim}</td>
              <td className="px-3 py-2 whitespace-nowrap">{row.mtcc}</td>
              {customFieldColumns.map(key => {
                const value = row.customFields?.[key];
                let displayValue = "—";
                
                if (value !== null && value !== undefined && value !== "") {
                  if (typeof value === 'object') {
                    displayValue = JSON.stringify(value);
                  } else {
                    displayValue = String(value);
                  }
                }
                
                return (
                  <td key={key} className="px-3 py-2 whitespace-nowrap">
                    {displayValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* View Enzyme Quantification Button */}
      <div className="text-center mt-6">
        <button
          onClick={() => navigate('/enzyme-quantification')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          View Enzyme Quantification
        </button>
      </div>
    </div>
  );
}
