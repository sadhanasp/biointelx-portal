import { useState, useEffect } from "react";
import FilterBar from "./FilterBar";
import cultureData from "../../data/cultureBankData.json";
import SpeciesPie from "./Charts/SpeciesPie";
import LocationBar from "./Charts/LocationBar";
import EnzymeBar from "./Charts/EnzymeBar";
import EnzymeQuantificationChart from "./Charts/EnzymeQuantificationChart";
import PgprGauge from "./Charts/PgprGauge";
import TrendLine from "./Charts/TrendLine";
import RiskGroupPie from "./Charts/RiskGroupPie";

export default function AnalyticsPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    setData(cultureData);
    setFilteredData(cultureData);
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

  return (
    <div className="p-6">
      {/* Search and Filter */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        onFilter={setLocationFilter}
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

      {/* Visualization */}
      <div className="bg-gradient-to-b from-green-50 to-emerald-50 py-10 px-6 rounded-3xl">
        <h2 className="text-3xl font-bold text-green-800 mb-8 text-center flex items-center justify-center gap-2">
          🌾 BioIntelX Analytics Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <SpeciesPie data={filteredData} />
          <LocationBar data={filteredData} />
          <RiskGroupPie data={filteredData} />
          <PgprGauge data={filteredData} />
          <EnzymeBar data={filteredData} />
          <EnzymeQuantificationChart data={filteredData} />
          <TrendLine data={filteredData} />
        </div>
      </div>
    </div>
  );
}
