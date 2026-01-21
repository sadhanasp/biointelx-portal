export default function FilterBar({ search, onSearch, onFilter, onRiskGroupFilter, uniqueLocations }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6 items-center">
      <input
        type="text"
        placeholder="🔍 Search ID, species, location, risk group, beneficial role, source, morphology..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="flex-1 border border-green-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
      />
      <select
        onChange={(e) => onFilter(e.target.value)}
        className="border border-green-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
      >
        <option value="">All Locations</option>
        {uniqueLocations?.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>
      <select
        onChange={(e) => onRiskGroupFilter(e.target.value)}
        className="border border-green-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
      >
        <option value="">All Risk Groups</option>
        <option value="RG -- 1">RG -- 1</option>
        <option value="RG - 2">RG - 2</option>
      </select>
    </div>
  );
}
