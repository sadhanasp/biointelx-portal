import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import logo from "../assets/logo1.png";

export default function EnzymeQuantificationPage() {
  const [data, setData] = useState([]);
  const [quantification, setQuantification] = useState({});
  const [organismQuantification, setOrganismQuantification] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const itemsPerPage = 10;
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

  const enzymes = ["chitinase", "glucanase", "cellulase", "amylase", "protease", "lipase", "phytase"];

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/bioIntelXData_perfect.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        let rawData = result.data || result;
        if (!Array.isArray(rawData)) throw new Error("Data is not an array");
        setData(rawData);
      } catch (err) {
        console.error("Error loading data:", err);
        console.error("Please ensure bioIntelXData_perfect.json exists in the public folder");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      calculateQuantification();
    }
  }, [data]);

  const quantifyEnzyme = (value) => {
    if (!value || value === "-" || value === "") return 0; // Not present
    if (value === "Yes" || value === "+") return 2; // Low
    if (value === "Low") return 1; // Low
    if (value === "Moderate") return 3; // Moderate
    if (value === "High") return 5; // High
    if (value === "Low-Moderate") return 2; // Low-Moderate -> Low
    if (value === "Variable") return 3; // Variable -> Moderate
    return 0; // Default not present
  };

  const getCategory = (score) => {
    if (score === 0) return "Not Present";
    if (score >= 1 && score <= 2) return "Low";
    if (score === 3) return "Moderate";
    if (score >= 4 && score <= 5) return "High";
    return "Unknown";
  };

  const calculateQuantification = () => {
    const counts = {
      chitinase: { Low: 0, Moderate: 0, High: 0, "Not Present": 0 },
      glucanase: { Low: 0, Moderate: 0, High: 0, "Not Present": 0 },
      cellulase: { Low: 0, Moderate: 0, High: 0, "Not Present": 0 },
      amylase: { Low: 0, Moderate: 0, High: 0, "Not Present": 0 },
      protease: { Low: 0, Moderate: 0, High: 0, "Not Present": 0 },
      lipase: { Low: 0, Moderate: 0, High: 0, "Not Present": 0 },
      phytase: { Low: 0, Moderate: 0, High: 0, "Not Present": 0 }
    };

    data.forEach(record => {
      enzymes.forEach(enzyme => {
        const value = record[enzyme];
        const score = quantifyEnzyme(value);
        const category = getCategory(score);
        counts[enzyme][category]++;
      });
    });

    setQuantification(counts);
  };

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  // Pagination logic
  const totalPages = Math.ceil(organismQuantification.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = organismQuantification.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const calculateOrganismQuantification = () => {
    const organisms = [...new Set(data.map(record => record.organism).filter(Boolean))];
    
    const quantData = organisms.map(organism => {
      const organismsRecords = data.filter(record => record.organism === organism);
      
      const enzymePresence = {};
      const enzymeActivities = {};
      
      enzymes.forEach(enzyme => {
        let count = 0;
        let totalActivity = 0;
        let activityCount = 0;
        
        organismsRecords.forEach(record => {
          const value = record[enzyme];
          const score = quantifyEnzyme(value);
          
          if (score > 0) {
            count++;
            totalActivity += score;
            activityCount++;
          }
        });
        
        enzymePresence[enzyme] = count;
        enzymeActivities[enzyme] = activityCount > 0 ? (totalActivity / activityCount).toFixed(2) : 0;
      });
      
      // Calculate average activity level across all enzymes
      const allActivities = enzymes.map(e => parseFloat(enzymeActivities[e])).filter(a => a > 0);
      const avgActivityLevel = allActivities.length > 0 ? (allActivities.reduce((a, b) => a + b, 0) / allActivities.length).toFixed(2) : 0;
      
      return {
        organism,
        ...enzymePresence,
        ...Object.fromEntries(enzymes.map(e => [`${e}_activity`, enzymeActivities[e]])),
        totalEnzymes: enzymes.reduce((sum, e) => sum + enzymePresence[e], 0),
        recordCount: organismsRecords.length,
        averageEnzymesPerRecord: (enzymes.reduce((sum, e) => sum + enzymePresence[e], 0) / organismsRecords.length).toFixed(2),
        avgActivityLevel: avgActivityLevel
      };
    }).sort((a, b) => b.avgActivityLevel - a.avgActivityLevel);
    
    return quantData;
  };

  // When data changes, compute organism quantification asynchronously so the loading spinner can show
  useEffect(() => {
    if (data.length === 0) {
      setOrganismQuantification([]);
      return;
    }

    setIsCalculating(true);
    // Defer heavy computation so the spinner renders first
    const timer = setTimeout(() => {
      try {
        const result = calculateOrganismQuantification();
        setOrganismQuantification(result);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error computing organism quantification:', err);
      } finally {
        setIsCalculating(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [data]);

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

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">🧪 Enzyme Quantification Analytics</h1>
        <p className="text-gray-600">Classification of enzyme activities across all microbial records (1-5 scale)</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-600">
          <div className="text-sm font-semibold text-green-800 mb-1">Total Records</div>
          <div className="text-3xl font-bold text-green-700">{data.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-600">
          <div className="text-sm font-semibold text-blue-800 mb-1">High Activity</div>
          <div className="text-3xl font-bold text-blue-700">
            {Object.values(quantification).reduce((sum, enzyme) => sum + enzyme.High, 0)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-yellow-600">
          <div className="text-sm font-semibold text-yellow-800 mb-1">Moderate Activity</div>
          <div className="text-3xl font-bold text-yellow-700">
            {Object.values(quantification).reduce((sum, enzyme) => sum + enzyme.Moderate, 0)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-red-600">
          <div className="text-sm font-semibold text-red-800 mb-1">Low Activity</div>
          <div className="text-3xl font-bold text-red-700">
            {Object.values(quantification).reduce((sum, enzyme) => sum + enzyme.Low, 0)}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isCalculating && (
        <div className="bg-white rounded-xl shadow border border-green-200 overflow-x-auto mb-8 p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-green-600"></div>
            <p className="text-gray-600">Calculating enzyme quantification...</p>
          </div>
        </div>
      )}
      
      {/* Organism Enzyme Quantification Table */}
      {organismQuantification.length > 0 && paginatedData.length > 0 && (
        <div className="bg-white rounded-xl shadow border border-green-200 overflow-x-auto mb-8">
          <h2 className="text-xl font-bold text-green-700 p-4">🔬 Enzyme Quantification by Organism (Activity Level 1-5)</h2>
          <p className="px-4 pb-2 text-sm text-gray-600">Enzyme activity levels by organism: Values show average activity (1=Low to 5=High)</p>
          <table className="w-full text-xs md:text-sm">
          <thead className="bg-green-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-green-800">Organism</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800 text-xs">Chitinase</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800 text-xs">Glucanase</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800 text-xs">Cellulase</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800 text-xs">Amylase</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800 text-xs">Protease</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800 text-xs">Lipase</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800 text-xs">Phytase</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800 bg-green-100">Avg Activity</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800">Total</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800">Records</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((org) => {
              const getActivityColor = (activity) => {
                const val = parseFloat(activity);
                if (val === 0) return 'bg-gray-100 text-gray-700';
                if (val < 1.5) return 'bg-red-100 text-red-800';
                if (val < 2.5) return 'bg-orange-100 text-orange-800';
                if (val < 3.5) return 'bg-yellow-100 text-yellow-800';
                if (val < 4.5) return 'bg-blue-100 text-blue-800';
                return 'bg-green-100 text-green-800';
              };
              
              const getActivityLabel = (activity) => {
                const val = parseFloat(activity);
                if (val === 0) return '—';
                if (val < 1.5) return 'Low';
                if (val < 2.5) return 'L-M';
                if (val < 3.5) return 'Mod';
                if (val < 4.5) return 'M-H';
                return 'High';
              };
              
              return (
                <tr key={org.organism} className="border-t border-green-100 hover:bg-green-25">
                  <td className="px-4 py-3 font-medium text-green-800">{org.organism}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getActivityColor(org.chitinase_activity)}`}>
                      {org.chitinase_activity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getActivityColor(org.glucanase_activity)}`}>
                      {org.glucanase_activity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getActivityColor(org.cellulase_activity)}`}>
                      {org.cellulase_activity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getActivityColor(org.amylase_activity)}`}>
                      {org.amylase_activity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getActivityColor(org.protease_activity)}`}>
                      {org.protease_activity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getActivityColor(org.lipase_activity)}`}>
                      {org.lipase_activity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getActivityColor(org.phytase_activity)}`}>
                      {org.phytase_activity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center bg-green-50 font-bold">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getActivityColor(org.avgActivityLevel)}`}>
                      {org.avgActivityLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-blue-700">{org.totalEnzymes}</td>
                  <td className="px-4 py-3 text-center text-blue-700 font-semibold">{org.recordCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="p-4 bg-blue-50 border-t border-green-200 text-sm text-gray-700">
          <p><strong>Total Organisms: </strong>{organismQuantification.length}</p>
          <p><strong>Average Activity Level Across All Organisms: </strong>{(organismQuantification.reduce((sum, org) => sum + parseFloat(org.avgActivityLevel), 0) / Math.max(1, organismQuantification.length)).toFixed(2)}</p>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4 bg-white border-t border-green-200">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, organismQuantification.length)} of {organismQuantification.length} organisms
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-green-600 text-white rounded disabled:bg-gray-300 hover:bg-green-700 transition-colors"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageClick(pageNum)}
                  className={`px-3 py-1 rounded transition-colors ${
                    currentPage === pageNum
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-green-600 text-white rounded disabled:bg-gray-300 hover:bg-green-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
        </div>
      )}
      
      {/* Loading State */}
      {organismQuantification.length === 0 && data.length > 0 && (
        <div className="bg-white rounded-xl shadow border border-green-200 overflow-x-auto mb-8 p-6 text-center">
          <p className="text-gray-500">Processing organism quantification data...</p>
        </div>
      )}
      
      {/* Empty State */}
      {data.length === 0 && (
        <div className="bg-white rounded-xl shadow border border-green-200 overflow-x-auto mb-8 p-6 text-center">
          <p className="text-gray-500">Loading data...</p>
        </div>
      )}

      {/* Enzyme Quantification Table */}
      <div className="bg-white rounded-xl shadow border border-green-200 overflow-x-auto">
        <h2 className="text-xl font-bold text-green-700 p-4">Enzyme Activity Distribution</h2>
        <table className="w-full text-sm">
          <thead className="bg-green-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-green-800">Enzyme</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800">High (4-5)</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800">Moderate (3)</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800">Low (1-2)</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800">Not Present</th>
              <th className="px-4 py-3 text-center font-semibold text-green-800">Total</th>
            </tr>
          </thead>
          <tbody>
            {enzymes.map((enzyme) => {
              const counts = quantification[enzyme] || { Low: 0, Moderate: 0, High: 0, "Not Present": 0 };
              const total = counts.Low + counts.Moderate + counts.High + counts["Not Present"];
              return (
                <tr key={enzyme} className="border-t border-green-100 hover:bg-green-25">
                  <td className="px-4 py-3 font-medium text-green-800 capitalize">{enzyme}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {counts.High}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {counts.Moderate}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {counts.Low}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {counts["Not Present"]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-green-700">{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-3">📊 Activity Scale Legend (1-5)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-gray-100 rounded font-bold text-center text-xs">—</span>
            <span>Not Present (0)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-red-100 rounded font-bold text-center text-xs text-red-800">1</span>
            <span>Low (1.0-1.49)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-orange-100 rounded font-bold text-center text-xs text-orange-800">2</span>
            <span>Low-Mod (1.5-2.49)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-yellow-100 rounded font-bold text-center text-xs text-yellow-800">3</span>
            <span>Moderate (2.5-3.49)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-blue-100 rounded font-bold text-center text-xs text-blue-800">4-5</span>
            <span>Mod-High (3.5+)</span>
          </div>
        </div>
      </div>

      {/* Previous Legend for Reference */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Overall Activity Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-blue-100 rounded"></span>
            <span>High (4-5): Strong enzyme activity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-yellow-100 rounded"></span>
            <span>Moderate (3): Medium enzyme activity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-orange-100 rounded"></span>
            <span>Low (1-2): Weak enzyme activity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-gray-100 rounded"></span>
            <span>Not Present: No enzyme activity detected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
