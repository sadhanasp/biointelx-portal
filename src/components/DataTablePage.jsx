import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CompleteMicrobeTable from "./CompleteMicrobeTable";
import FilterBar from "./FilterBar";

export default function DataTablePage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from public folder first
        const response = await fetch("/bioIntelXData_perfect.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();

        // Handle both direct array and wrapped data
        let rawData = result.data || result;

        if (!Array.isArray(rawData)) {
          throw new Error("Data is not an array");
        }

        console.log(`Loaded ${rawData.length} records`);
        console.log("First record:", rawData[0]);
        console.log("Columns:", rawData[0] ? Object.keys(rawData[0]) : "None");

        setData(rawData);
        setFilteredData(rawData);

        // Calculate stats
        const organisms = rawData.map(d => d.organism).filter(Boolean);
        const locations = rawData.map(d => d.Location).filter(Boolean);

        setStats({
          total: rawData.length,
          uniqueOrganisms: new Set(organisms).size,
          uniqueLocations: new Set(locations).size,
          columns: rawData[0] ? Object.keys(rawData[0]).length : 0,
          commonOrganism: organisms.length > 0 ?
            organisms.reduce((a, b, i, arr) =>
              arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
            ) : "N/A"
        });

        setLoading(false);

      } catch (err) {
        console.error("Error loading data:", err);
        console.error("Please ensure bioIntelXData_perfect.json exists in the public folder");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = data;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(row => {
        // Search across all string fields
        return Object.entries(row).some(([key, value]) => {
          if (value && typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          return false;
        });
      });
    }

    if (locationFilter && locationFilter !== "All") {
      filtered = filtered.filter(row => {
        const location = row.Location || row.location;
        return location && location.toLowerCase().includes(locationFilter.toLowerCase());
      });
    }

    setFilteredData(filtered);
  }, [data, search, locationFilter]);

  // Get unique locations for filter dropdown
  const locations = ["All", ...new Set(data.map(row => row.Location).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-6"></div>
          <h2 className="text-xl font-bold text-green-700 mb-2">Loading Complete Microbial Database</h2>
          <p className="text-gray-600">Loading all data from Excel file...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-white p-4 md:p-6">
      {/* Header */}
      <header className="mb-8 border-b border-green-300 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-700 flex items-center gap-2">
              🌿 BioIntelX - Complete Microbial Database
            </h1>
            <p className="text-gray-600 mt-1">
              Full dataset with {stats.total} records and {stats.columns} data points per record
            </p>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
            <div className="text-sm text-green-700">
              <span className="font-semibold">Last Updated:</span> {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="mb-8">
        <FilterBar
          search={search}
          onSearch={setSearch}
          onFilter={setLocationFilter}
          locations={locations}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-600">
          <div className="text-sm font-semibold text-green-800 mb-1">Total Records</div>
          <div className="text-3xl font-bold text-green-700">{stats.total || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-600">
          <div className="text-sm font-semibold text-blue-800 mb-1">Showing</div>
          <div className="text-3xl font-bold text-blue-700">{filteredData.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-purple-600">
          <div className="text-sm font-semibold text-purple-800 mb-1">Unique Species</div>
          <div className="text-3xl font-bold text-purple-700">{stats.uniqueOrganisms || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-amber-600">
          <div className="text-sm font-semibold text-amber-800 mb-1">Data Columns</div>
          <div className="text-3xl font-bold text-amber-700">{stats.columns || 0}</div>
        </div>
      </div>

      {/* Search Results Info */}
      {(search || (locationFilter && locationFilter !== "All")) && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 text-green-700">
            <span className="text-lg">🔍</span>
            <div>
              <p className="font-medium">Found {filteredData.length} records</p>
              <p className="text-sm">
                {search && `Search: "${search}"`}
                {search && locationFilter && locationFilter !== "All" && " • "}
                {locationFilter && locationFilter !== "All" && `Location: ${locationFilter}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <CompleteMicrobeTable data={filteredData} />

      {/* Export Section */}
      <div className="mt-8 p-6 bg-white rounded-xl shadow border border-green-200">
        <h3 className="text-lg font-bold text-green-700 mb-4">📥 Export Data</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              // Export as CSV
              const headers = Object.keys(data[0] || {});
              const csvContent = [
                headers.join(','),
                ...data.map(row =>
                  headers.map(header =>
                    `"${(row[header] || '').toString().replace(/"/g, '""')}"`
                  ).join(',')
                )
              ].join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `biointelx_complete_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Export Full Dataset as CSV
          </button>

          <button
            onClick={() => {
              // Export visible data as JSON
              const exportData = {
                metadata: {
                  exported: new Date().toISOString(),
                  records: filteredData.length,
                  search: search || "none",
                  filter: locationFilter !== "All" ? locationFilter : "none"
                },
                data: filteredData
              };

              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `biointelx_filtered_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Export Filtered Data as JSON
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          CSV export includes all {stats.total} records. JSON export includes only filtered records.
        </p>
      </div>

      {/* Enzyme Quantification Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/enzyme-quantification")}
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          🧪 View Enzyme Quantification
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Analyze enzyme activity levels across all microbial records
        </p>
      </div>
    </div>
  );
}
