import { useState, useEffect } from "react";

export default function CompleteMicrobeTable({ data }) {
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchColumns, setSearchColumns] = useState("");

  // Define column categories
  const columnCategories = {
    "basic": ["id", "sample_id", "Location", "Source", "Date of collection", "organism", "risk_group"],
    "morphology": ["Shape", "Colour", "gram_stain", "spore_formation", "Image"],
    "biochemistry": ["Catalase", "Oxidase", "Nitrate reduction", "salt_tolerance", "ph_range"],
    "nutrients": ["Phosphate solubilization", "Potassium solubilization", "Nitrogen fixation",
                  "Zinc solubilization", "Iron mobilization", "Sulphur oxidation", "Silicate solubilization"],
    "pgp": ["iaa_production", "gibberellic_acid", "cytokinin", "acc_deaminase",
            "ammonia_production", "ros_scavenging", "drought_tolerance"],
    "biocontrol": ["antifungal_activity", "antibacterial_activity", "Chitinase",
                   "β-1,3-glucanase", "Cellulase", "VOC Production", "Biofilm Formation", "EPS"],
    "enzymes": ["Amylase", "Protease", "Lipase", "Phytase"],
    "molecular": ["Sequence data", "identity_percent", "accession",
                  "Whole genome sequencing NGS/Activity based gene identification"],
    "metabolite": ["Metabolite extraction/ stability", "UV Spectroscopy", "HPLC", "GCMS/ LCMS"],
    "compatibility": ["Ferilizer", "Pesticide", "bioagents"],
    "deposition": ["NCBI", "NBAIM", "MTCC"]
  };

  // Initialize column visibility
  useEffect(() => {
    if (data && data.length > 0) {
      const allColumns = Object.keys(data[0]);
      const initialVisible = allColumns.filter(col =>
        columnCategories["basic"].includes(col) ||
        columnCategories["morphology"].includes(col)
      );
      setVisibleColumns(initialVisible);
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="mt-8 p-8 text-center bg-white rounded-xl shadow-md">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No data available</h3>
        <p className="text-gray-500">The data table is empty</p>
      </div>
    );
  }

  const allColumns = Object.keys(data[0]);

  // Filter columns by category
  const getColumnsByCategory = (category) => {
    if (category === "all") return allColumns;
    return columnCategories[category] || [];
  };

  const toggleColumn = (column) => {
    if (visibleColumns.includes(column)) {
      setVisibleColumns(visibleColumns.filter(col => col !== column));
    } else {
      setVisibleColumns([...visibleColumns, column]);
    }
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
    if (category === "all") {
      setVisibleColumns(allColumns);
    } else {
      const categoryCols = getColumnsByCategory(category);
      setVisibleColumns(categoryCols);
    }
  };

  const selectAllColumns = () => {
    setVisibleColumns(allColumns);
    setSelectedCategory("all");
  };

  // Filter columns by search
  const filteredColumns = allColumns.filter(col =>
    col.toLowerCase().includes(searchColumns.toLowerCase())
  );

  const renderCellValue = (value, columnName) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-400 italic">-</span>;
    }

    // Handle objects - convert to JSON string
    if (typeof value === 'object' && value !== null) {
      try {
        return (
          <span className="text-xs text-gray-600 font-mono" title={JSON.stringify(value, null, 2)}>
            {JSON.stringify(value)}
          </span>
        );
      } catch (e) {
        return <span className="text-gray-400 italic">Invalid data</span>;
      }
    }

    // Handle long text (like sequence data)
    if (columnName === "Sequence data" && value.length > 30) {
      return (
        <div className="relative group">
          <code className="text-xs bg-gray-100 p-1 rounded truncate block" title={value}>
            {value.substring(0, 30)}...
          </code>
          <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block bg-gray-900 text-white p-2 rounded text-xs max-w-md break-all">
            <div className="font-mono whitespace-pre-wrap">{value}</div>
          </div>
        </div>
      );
    }

    // Color coding for certain columns
    if (columnName === "risk_group") {
      const bgColor = value.includes("1") ? "bg-green-100 text-green-800" :
                     value.includes("2") ? "bg-yellow-100 text-yellow-800" :
                     "bg-red-100 text-red-800";
      return <span className={`px-2 py-1 rounded text-xs font-semibold ${bgColor}`}>{value}</span>;
    }

    if (columnName === "Catalase" || columnName === "Oxidase" ||
        columnName === "Nitrate reduction" || columnName === "Phosphate solubilization" ||
        columnName === "Potassium solubilization" || columnName === "Nitrogen fixation") {
      const bgColor = value === "+" ? "bg-green-100 text-green-800" :
                     value === "-" ? "bg-red-100 text-red-800" :
                     "bg-gray-100 text-gray-800";
      return <span className={`px-2 py-1 rounded text-xs font-semibold ${bgColor}`}>{value}</span>;
    }

    if (columnName === "identity_percent") {
      const percent = parseFloat(value) * 100;
      const color = percent > 95 ? "text-green-600" : percent > 90 ? "text-yellow-600" : "text-red-600";
      return <span className={`font-bold ${color}`}>{(percent).toFixed(1)}%</span>;
    }

    if (columnName === "organism") {
      return <span className="font-semibold text-green-700">{value}</span>;
    }

    // Handle numeric ranges
    if (columnName === "iaa_production" || columnName === "gibberellic_acid" || columnName === "cytokinin") {
      if (!isNaN(value)) {
        return <span className="font-medium">{value} µg/ml</span>;
      }
    }

    return <span className="whitespace-nowrap truncate" title={String(value)}>{String(value)}</span>;
  };

  return (
    <div className="mt-8">
      {/* Column Management Panel */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-lg border border-green-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-green-700">📋 Column Management</h3>
            <p className="text-sm text-gray-600">
              Showing {visibleColumns.length} of {allColumns.length} columns
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={selectAllColumns}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              Show All Columns
            </button>
            <button
              onClick={() => setVisibleColumns([])}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Hide All
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.keys(columnCategories).map(category => (
              <button
                key={category}
                onClick={() => selectCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                  selectedCategory === category
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.replace("_", " ")}
              </button>
            ))}
            <button
              onClick={() => selectCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                selectedCategory === "all"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Columns
            </button>
          </div>
        </div>

        {/* Column Search and Selection */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search columns..."
            value={searchColumns}
            onChange={(e) => setSearchColumns(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredColumns.map((col, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                  visibleColumns.includes(col)
                    ? "bg-green-50 border border-green-200"
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(col)}
                  onChange={() => toggleColumn(col)}
                  className="rounded text-green-600"
                />
                <span className="text-sm truncate" title={col}>
                  {col.length > 30 ? `${col.substring(0, 30)}...` : col}
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  {col in columnCategories ? "★" : ""}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: "70vh" }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50 sticky top-0 z-10">
              <tr>
                {visibleColumns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider whitespace-nowrap border-r border-green-200"
                    title={col}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate max-w-[180px]">{col}</span>
                      <button
                        onClick={() => toggleColumn(col)}
                        className="ml-2 text-gray-400 hover:text-red-500 text-xs"
                        title="Hide column"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-green-50 transition-colors ${
                    rowIndex % 2 === 0 ? "bg-green-50/30" : "bg-white"
                  }`}
                >
                  {visibleColumns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-3 text-sm border-r border-green-100 max-w-xs"
                      title={row[col] ? String(row[col]) : ""}
                    >
                      <div className="truncate">
                        {renderCellValue(row[col], col)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-green-50 px-4 py-3 border-t border-green-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-green-700 mb-2 sm:mb-0">
              📊 Showing {data.length} records • {visibleColumns.length} columns
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span>Scroll horizontally →</span>
              <span className="hidden sm:inline">•</span>
              <span>{allColumns.length - visibleColumns.length} columns hidden</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-200">
        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          📋 Dataset Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-white p-3 rounded-lg">
            <div className="font-medium text-gray-700">Total Records</div>
            <div className="text-2xl font-bold text-green-600">{data.length}</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="font-medium text-gray-700">Total Columns</div>
            <div className="text-2xl font-bold text-blue-600">{allColumns.length}</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="font-medium text-gray-700">Visible Columns</div>
            <div className="text-2xl font-bold text-purple-600">{visibleColumns.length}</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="font-medium text-gray-700">Unique Organisms</div>
            <div className="text-2xl font-bold text-amber-600">
              {new Set(data.map(d => d.organism).filter(Boolean)).size}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-600">
          <p className="font-medium mb-1">Available Data Categories:</p>
          <div className="flex flex-wrap gap-1">
            {Object.keys(columnCategories).map(category => (
              <span key={category} className="px-2 py-1 bg-white rounded border">
                {category.replace("_", " ")} ({columnCategories[category].length})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
