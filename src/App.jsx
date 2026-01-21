import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MicrobeTable from "./components/MicrobeTable";
import FilterBar from "./components/FilterBar";
import { useData } from "./context/DataContext";
import EnzymeQuantificationModule from "./components/EnzymeQuantificationModule";

import SpeciesPie from "./components/Charts/SpeciesPie";
import LocationBar from "./components/Charts/LocationBar";
import EnzymeBar from "./components/Charts/EnzymeBar";
import PgprGauge from "./components/Charts/PgprGauge";
import TrendLine from "./components/Charts/TrendLine";
import RiskGroupPie from "./components/Charts/RiskGroupPie";
import Login from "./components/Login";
import logo from "./assets/logo1.png";
export default function App() {
  const { data } = useData();
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [riskGroupFilter, setRiskGroupFilter] = useState("");
  const [uniqueLocations, setUniqueLocations] = useState([]);
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
    try {
      localStorage.removeItem("demo_user");
    } catch {
      // Ignore errors when removing from localStorage
    }
    setUser(null);
  };

  useEffect(() => {
    if (data.length > 0) {
      setFilteredData(data);
      // Compute unique locations
      const locations = [...new Set(data.map(item => item.location).filter(Boolean))].sort();
      setUniqueLocations(locations);
    }
  }, [data]);

  useEffect(() => {
    let filtered = data;

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.id?.toString().toLowerCase().includes(search.toLowerCase()) ||
          item.primarySpecies?.toLowerCase().includes(search.toLowerCase()) ||
          item.location?.toLowerCase().includes(search.toLowerCase()) ||
          item.uses?.toLowerCase().includes(search.toLowerCase()) ||
          item.host?.toLowerCase().includes(search.toLowerCase()) ||
          item.riskGroup?.toLowerCase().includes(search.toLowerCase()) ||
          item.beneficialRole?.toLowerCase().includes(search.toLowerCase()) ||
          item.sourceCode?.toLowerCase().includes(search.toLowerCase()) ||
          item.gramNature?.toLowerCase().includes(search.toLowerCase()) ||
          item.shape?.toLowerCase().includes(search.toLowerCase()) ||
          item.colour?.toLowerCase().includes(search.toLowerCase()) ||
          item.sporeFormation?.toLowerCase().includes(search.toLowerCase()) ||
          item.catalase?.toLowerCase().includes(search.toLowerCase()) ||
          item.oxidase?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((item) => {
        const normalizedLoc = item.location?.replace(/\(.*?\)/g, "").trim().toLowerCase();
        return normalizedLoc === locationFilter.toLowerCase();
      });
    }

    if (riskGroupFilter) {
      filtered = filtered.filter((item) => item.riskGroup === riskGroupFilter);
    }

    setFilteredData(filtered);
  }, [data, search, locationFilter, riskGroupFilter]);



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

      {/* Search and Filter */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        onFilter={setLocationFilter}
        onRiskGroupFilter={setRiskGroupFilter}
        uniqueLocations={uniqueLocations}
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-md border-l-4 border-green-600 rounded-xl p-4 text-center">
          <h2 className="text-lg font-semibold text-green-800">Culture ID</h2>
          <p className="text-3xl font-bold text-green-700">{filteredData.length}</p>
        </div>
        <div className="bg-white shadow-md border-l-4 border-green-600 rounded-xl p-4 text-center">
          <h2 className="text-lg font-semibold text-green-800">Species</h2>
          <p className="text-3xl font-bold text-green-700">{new Set(filteredData.map((d) => d.primarySpecies)).size}</p>
        </div>
        <div className="bg-white shadow-md border-l-4 border-green-600 rounded-xl p-4 text-center">
          <h2 className="text-lg font-semibold text-green-800">Collected</h2>
          <p className="text-3xl font-bold text-green-700">{filteredData.filter((d) => d.location).length}</p>
        </div>
      </div>

      {/* Visulization */}
      <div className="bg-gradient-to-b from-green-50 to-emerald-50 py-10 px-6 rounded-3xl">
        <h2 className="text-3xl font-bold text-green-800 mb-4 text-center flex items-center justify-center gap-1">
          <img src={logo} alt="BioIntelX" className="h-19 w-11.5 object-contain self-end" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <SpeciesPie data={filteredData} />
          <LocationBar data={filteredData} />
          <RiskGroupPie data={filteredData} />
          <PgprGauge data={filteredData} />
          <EnzymeBar data={filteredData} />
          <TrendLine data={filteredData} />
        </div>

        <div className="text-center mt-8 space-x-4">
          <button
            onClick={() => navigate("/table")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            View Table Data
          </button>
        </div>
      </div>
    </div>
  );
}
