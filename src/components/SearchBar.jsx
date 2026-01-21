export default function SearchBar({ value, onChange }) {
  return (
    <input
      className="border border-gray-400 rounded px-4 py-2 mt-4 w-full shadow-sm focus:ring-2 focus:ring-green-600"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search species, location, uses..."
    />
  );
}
