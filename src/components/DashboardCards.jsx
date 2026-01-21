export default function DashboardCards({ stats }) {
  const cardStyle =
    "bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-green-800 border-l-4 border-green-600 hover:shadow-lg transition";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      <div className={cardStyle}>
        <h2 className="text-xl font-semibold">Culture ID</h2>
        <p className="text-3xl font-bold text-green-700">{stats.cultures}</p>
      </div>
      <div className={cardStyle}>
        <h2 className="text-xl font-semibold">Species</h2>
        <p className="text-3xl font-bold text-green-700">{stats.species}</p>
      </div>
      <div className={cardStyle}>
        <h2 className="text-xl font-semibold">Collected</h2>
        <p className="text-3xl font-bold text-green-700">{stats.collected}</p>
      </div>
    </div>
  );
}
