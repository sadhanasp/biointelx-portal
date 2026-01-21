import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./components/Login";
import logo from "./assets/logo1.png";

export default function EnzymePage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("demo_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

  const logout = () => {
    try { localStorage.removeItem("demo_user"); } catch {}
    setUser(null);
  };

  useEffect(() => {
    fetch("../data/cultureBankData.json")
      .then((response) => response.json())
      .then((cultureData) => {
        setData(cultureData);
        setFilteredData(cultureData);
      })
      .catch((error) => console.error("Error loading data:", error));
  }, []);

  useEffect(() => {
    let filtered = data;

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.primarySpecies?.toLowerCase().includes(search.toLowerCase()) ||
          item.location?.toLowerCase().includes(search.toLowerCase()) ||
          item.uses?.toLowerCase().includes(search.toLowerCase()) ||
          item.host?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((item) => {
        const normalizedLoc = item.location?.replace(/\(.*?\)/g, "").trim().toLowerCase();
        return normalizedLoc === locationFilter.toLowerCase();
      });
    }

    setFilteredData(filtered);
  }, [data, search, locationFilter]);

  const quantifyEnzyme = (value) => {
    if (!value || value === "-" || value === "") return 0;
    if (value === "Yes" || value === "+") return 1;
    if (value === "Low") return 1;
    if (value === "Moderate") return 2;
    if (value === "High") return 3;
    if (value === "Low-Moderate") return 1.5;
    if (value === "Variable") return 2; // assuming moderate
    // Try to parse as number if it's already a numerical value
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) return numValue;
    return 0; // default
  };

  const enzymes = ["chitinase", "glucanase", "cellulase", "amylase", "protease", "lipase", "phytase"];

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-white p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-green-300 pb-4">
        <div className="flex items-center gap-4">
          <img src={logo} alt="BioIntelX" className="h-18 w-40 object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-green-800">
            Logged in as <strong>{user?.name ?? user?.email}</strong>
          </p>
          <button
            onClick={logout}
            className="text-sm bg-white border border-green-300 text-green-700 px-3 py-1 rounded hover:bg-green-50"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Back to Table Button */}
      <div className="text-center mb-6">
        <button
          onClick={() => navigate("/table")}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Table
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by species, location, etc."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Locations</option>
            {[...new Set(data.map((d) => d.location?.replace(/\(.*?\)/g, "").trim()))].map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enzyme Quantification Table */}
      <div className="bg-white rounded-xl shadow border border-green-200 overflow-x-auto">
        <h2 className="text-xl font-bold text-green-700 p-4">Enzyme Quantification</h2>
        <table className="w-full text-sm">
          <thead className="bg-green-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Primary Species</th>
              <th className="px-4 py-2 text-left">Location</th>
              {enzymes.map((enzyme) => (
                <th key={enzyme} className="px-4 py-2 text-center capitalize">
                  {enzyme}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="border-t border-green-100">
                <td className="px-4 py-2">{item.id}</td>
                <td className="px-4 py-2">{item.primarySpecies}</td>
                <td className="px-4 py-2">{item.location}</td>
                {enzymes.map((enzyme) => {
                  const value = item[enzyme];
                  const quantified = quantifyEnzyme(value);
                  return (
                    <td key={enzyme} className="px-4 py-2 text-center">
                      {quantified > 0 ? quantified : "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
