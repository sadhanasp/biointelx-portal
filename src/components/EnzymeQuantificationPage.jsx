import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import logo from "../assets/logo1.png";

// All possible enzymes
const ALL_ENZYMES = ["chitinase", "glucanase", "cellulase", "amylase", "protease", "lipase", "phytase"];

// Convert qualitative values to numeric (1-5 scale)
const convertToNumeric = (value) => {
  if (!value || value === "-" || value === "") return 0; // Not present
  if (value === "Yes" || value === "+") return 2; // Low
  if (value === "Low") return 1; // Low
  if (value === "Moderate") return 3; // Moderate
  if (value === "High") return 5; // High
  if (value === "Low-Moderate") return 2; // Low-Moderate -> Low
  if (value === "Variable") return 3; // Variable -> Moderate
  
  // Try to parse as number
  const num = parseFloat(value);
  if (!isNaN(num)) return Math.min(5, Math.max(0, num));
  
  return 0; // Default not present
};

// Get color based on numeric value
const getValueColor = (value) => {
  if (value === 0) return "bg-gray-100 text-gray-700";
  if (value < 1.5) return "bg-red-100 text-red-800";
  if (value < 2.5) return "bg-orange-100 text-orange-800";
  if (value < 3.5) return "bg-yellow-100 text-yellow-800";
  if (value < 4.5) return "bg-blue-100 text-blue-800";
  return "bg-green-100 text-green-800";
};

// Get label based on numeric value
const getValueLabel = (value) => {
  if (value === 0) return "Not Present";
  if (value < 1.5) return "Low";
  if (value < 2.5) return "Low-Moderate";
  if (value < 3.5) return "Moderate";
  if (value < 4.5) return "Mod-High";
  return "High";
};

export default function EnzymeQuantificationPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("demo_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

  // State for user inputs
  const [enzymeValues, setEnzymeValues] = useState({}); // {organism: {enzyme: value}}
  const [selectedEnzymes, setSelectedEnzymes] = useState({}); // {organism: [enzyme1, enzyme2]}
  const [comparisonEnzyme, setComparisonEnzyme] = useState(null);

  const logout = () => {
    try { localStorage.removeItem("demo_user"); } catch {}
    setUser(null);
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/cultureBankData.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const cultureData = await response.json();
        setData(cultureData);
        
        // Initialize user inputs based on data
        initializeUserInputs(cultureData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Initialize user inputs based on loaded data
  const initializeUserInputs = (cultureData) => {
    const newEnzymeValues = {};
    const newSelectedEnzymes = {};
    
    // Group data by organism
    const organismsMap = {};
    cultureData.forEach(record => {
      const organism = record.primarySpecies;
      if (!organism) return;
      
      if (!organismsMap[organism]) {
        organismsMap[organism] = [];
      }
      organismsMap[organism].push(record);
    });
    
    // For each organism, find available enzymes and set initial values
    Object.keys(organismsMap).forEach(organism => {
      const orgRecords = organismsMap[organism];
      newSelectedEnzymes[organism] = [];
      newEnzymeValues[organism] = {};
      
      ALL_ENZYMES.forEach(enzyme => {
        // Check if this enzyme has any non-empty values for this organism
        const hasEnzyme = orgRecords.some(record => 
          record[enzyme] && record[enzyme] !== "-" && record[enzyme] !== ""
        );
        
        if (hasEnzyme) {
          newSelectedEnzymes[organism].push(enzyme);
          
          // Calculate average value for this enzyme across all records
          const values = orgRecords
            .map(record => record[enzyme])
            .filter(val => val && val !== "-" && val !== "");
          
          if (values.length > 0) {
            const numericValues = values.map(convertToNumeric);
            const avgValue = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
            newEnzymeValues[organism][enzyme] = parseFloat(avgValue.toFixed(2));
          } else {
            newEnzymeValues[organism][enzyme] = 0;
          }
        }
      });
    });
    
    setEnzymeValues(newEnzymeValues);
    setSelectedEnzymes(newSelectedEnzymes);
  };

  // Get unique organisms from data
  const organisms = useMemo(() => {
    return [...new Set(data.map(record => record.primarySpecies).filter(Boolean))].sort();
  }, [data]);

  // Handle enzyme selection for an organism
  const handleEnzymeSelect = (organism, enzyme, isSelected) => {
    setSelectedEnzymes(prev => {
      const newSelected = { ...prev };
      if (isSelected) {
        // Add enzyme
        if (!newSelected[organism]?.includes(enzyme)) {
          newSelected[organism] = [...(newSelected[organism] || []), enzyme];
          
          // Initialize value if not set
          setEnzymeValues(prevValues => {
            const newValues = { ...prevValues };
            if (!newValues[organism] || newValues[organism][enzyme] === undefined) {
              newValues[organism] = { ...newValues[organism], [enzyme]: 0 };
            }
            return newValues;
          });
        }
      } else {
        // Remove enzyme
        newSelected[organism] = (newSelected[organism] || []).filter(e => e !== enzyme);
      }
      return newSelected;
    });
  };

  // Handle enzyme value change
  const handleValueChange = (organism, enzyme, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 5) return;
    
    setEnzymeValues(prev => ({
      ...prev,
      [organism]: {
        ...prev[organism],
        [enzyme]: numValue
      }
    }));
  };

  // Calculate intra-organism analysis (highest enzyme and ranking)
  const intraOrganismAnalysis = useMemo(() => {
    const analysis = {};
    
    organisms.forEach(organism => {
      const orgEnzymes = selectedEnzymes[organism] || [];
      const orgValues = enzymeValues[organism] || {};
      
      // Get enzymes with values > 0
      const activeEnzymes = orgEnzymes.filter(enzyme => orgValues[enzyme] > 0);
      
      if (activeEnzymes.length > 0) {
        // Sort by value descending
        const ranked = [...activeEnzymes].sort((a, b) => orgValues[b] - orgValues[a]);
        
        analysis[organism] = {
          highestEnzyme: ranked[0],
          highestValue: orgValues[ranked[0]],
          rankedEnzymes: ranked,
          totalScore: activeEnzymes.reduce((sum, enzyme) => sum + orgValues[enzyme], 0),
          averageScore: activeEnzymes.length > 0 ? 
            activeEnzymes.reduce((sum, enzyme) => sum + orgValues[enzyme], 0) / activeEnzymes.length : 0
        };
      } else {
        analysis[organism] = {
          highestEnzyme: null,
          highestValue: 0,
          rankedEnzymes: [],
          totalScore: 0,
          averageScore: 0
        };
      }
    });
    
    return analysis;
  }, [organisms, selectedEnzymes, enzymeValues]);

  // Calculate inter-organism comparison for selected enzyme
  const interOrganismComparison = useMemo(() => {
    if (!comparisonEnzyme) return [];
    
    return organisms
      .map(organism => {
        const value = enzymeValues[organism]?.[comparisonEnzyme] || 0;
        return {
          organism,
          value,
          label: getValueLabel(value),
          color: getValueColor(value)
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [comparisonEnzyme, organisms, enzymeValues]);

  // Get highest value organism for comparison enzyme
  const highestComparisonOrganism = useMemo(() => {
    if (interOrganismComparison.length === 0) return null;
    return interOrganismComparison[0];
  }, [interOrganismComparison]);

  // Get all enzymes selected across all organisms
  const allSelectedEnzymes = useMemo(() => {
    const enzymesSet = new Set();
    organisms.forEach(organism => {
      (selectedEnzymes[organism] || []).forEach(enzyme => enzymesSet.add(enzyme));
    });
    return Array.from(enzymesSet).sort();
  }, [organisms, selectedEnzymes]);

  // Calculate enzyme distribution across organisms
  const enzymeDistribution = useMemo(() => {
    const distribution = {};
    
    allSelectedEnzymes.forEach(enzyme => {
      let count = 0;
      let totalValue = 0;
      
      organisms.forEach(organism => {
        const value = enzymeValues[organism]?.[enzyme] || 0;
        if (value > 0) {
          count++;
          totalValue += value;
        }
      });
      
      distribution[enzyme] = {
        count,
        averageValue: count > 0 ? totalValue / count : 0,
        totalValue
      };
    });
    
    return distribution;
  }, [allSelectedEnzymes, organisms, enzymeValues]);

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enzyme quantification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-white p-4 md:p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 border-b border-green-300 pb-4 gap-4">
        <div className="flex items-center gap-4">
          <img src={logo} alt="BioIntelX" className="h-16 w-36 md:h-18 md:w-40 object-contain" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-green-700">🧪 Enzyme Quantification Module</h1>
            <p className="text-sm text-gray-600">Dynamic enzyme analysis with organism-specific quantification</p>
          </div>
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

      {/* Navigation */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => navigate("/table")}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Data Table
        </button>
        <button
          onClick={() => navigate("/enzyme-analytics")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Analytics Dashboard
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-600">
          <div className="text-sm font-semibold text-green-800 mb-1">Total Organisms</div>
          <div className="text-2xl md:text-3xl font-bold text-green-700">{organisms.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-600">
          <div className="text-sm font-semibold text-blue-800 mb-1">Active Enzymes</div>
          <div className="text-2xl md:text-3xl font-bold text-blue-700">{allSelectedEnzymes.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-purple-600">
          <div className="text-sm font-semibold text-purple-800 mb-1">Total Records</div>
          <div className="text-2xl md:text-3xl font-bold text-purple-700">{data.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-amber-600">
          <div className="text-sm font-semibold text-amber-800 mb-1">Avg. Enzyme Value</div>
          <div className="text-2xl md:text-3xl font-bold text-amber-700">
            {Object.values(intraOrganismAnalysis).length > 0
              ? (Object.values(intraOrganismAnalysis).reduce((sum, analysis) => sum + analysis.averageScore, 0) /
                 Object.values(intraOrganismAnalysis).length).toFixed(2)
              : "0.00"}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Organism-wise Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow border border-green-200 overflow-hidden">
            <div className="p-4 bg-green-50 border-b border-green-200">
              <h2 className="text-lg font-bold text-green-700">Organism-wise Enzyme Quantification</h2>
              <p className="text-sm text-gray-600 mt-1">Select enzymes and enter values (0-5 scale) for each organism</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-green-800 min-w-[180px]">Organism</th>
                    <th className="px-4 py-3 text-left font-semibold text-green-800 min-w-[200px]">Available Enzymes</th>
                    <th className="px-4 py-3 text-left font-semibold text-green-800">Values (0-5)</th>
                    <th className="px-4 py-3 text-left font-semibold text-green-800">Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {organisms.map((organism, index) => {
                    const orgSelectedEnzymes = selectedEnzymes[organism] || [];
                    const orgEnzymeValues = enzymeValues[organism] || {};
                    const analysis = intraOrganismAnalysis[organism] || {};
                    
                    return (
                      <tr key={organism} className={`border-t border-green-100 ${index % 2 === 0 ? 'bg-white' : 'bg-green-50'}`}>
                        {/* Organism Name */}
                        <td className="px-4 py-3 font-medium text-green-800 sticky left-0 bg-inherit">
                          <div className="font-semibold">{organism}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {data.filter(r => r.primarySpecies === organism).length} records
                          </div>
                        </td>
                        
                        {/* Enzyme Selection */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {ALL_ENZYMES.map(enzyme => {
                              const isSelected = orgSelectedEnzymes.includes(enzyme);
                              const isAvailable = data.some(r => 
                                r.primarySpecies === organism && 
                                r[enzyme] && 
                                r[enzyme] !== "-" && 
                                r[enzyme] !== ""
                              );
                              
                              return (
                                <button
                                  key={enzyme}
                                  onClick={() => handleEnzymeSelect(organism, enzyme, !isSelected)}
                                  disabled={!isAvailable}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    isSelected
                                      ? 'bg-green-600 text-white hover:bg-green-700'
                                      : isAvailable
                                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  }`}
                                  title={isAvailable ? `Click to ${isSelected ? 'remove' : 'add'} ${enzyme}` : `${enzyme} not available for ${organism}`}
                                >
                                  {enzyme}
                                  {isSelected && ' ✓'}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        
                        {/* Value Inputs */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {orgSelectedEnzymes.map(enzyme => {
                              const value = orgEnzymeValues[enzyme] || 0;
                              return (
                                <div key={enzyme} className="flex items-center gap-1">
                                  <span className="text-xs text-gray-600 min-w-[80px]">{enzyme}:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={value}
                                    onChange={(e) => handleValueChange(organism, enzyme, e.target.value)}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  />
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getValueColor(value)}`}>
                                    {getValueLabel(value)}
                                  </span>
                                </div>
                              );
                            })}
                            {orgSelectedEnzymes.length === 0 && (
                              <span className="text-gray-400 text-sm">No enzymes selected</span>
                            )}
                          </div>
                        </td>
                        
                        {/* Intra-Organism Analysis */}
                        <td className="px-4 py-3">
                          {analysis.highestEnzyme ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">Highest:</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getValueColor(analysis.highestValue)}`}>
                                  {analysis.highestEnzyme} ({analysis.highestValue.toFixed(1)})
                                </span>
                              </div>
                              <div className="text-xs">
                                <div className="text-gray-600 mb-1">Ranking:</div>
                                <div className="flex flex-wrap gap-1">
                                  {analysis.rankedEnzymes.slice(0, 3).map((enzyme, idx) => (
                                    <span key={enzyme} className={`px-2 py-0.5 rounded ${idx === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                      {idx + 1}. {enzyme}
                                    </span>
                                  ))}
                                  {analysis.rankedEnzymes.length > 3 && (
                                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                      +{analysis.rankedEnzymes.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-gray-600">
                                Avg: <span className="font-semibold">{analysis.averageScore.toFixed(2)}</span> | 
                                Total: <span className="font-semibold">{analysis.totalScore.toFixed(2)}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No enzyme data</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-green-50 border-t border-green-200 text-sm text-gray-700">
              <p><strong>Instructions:</strong> Click enzyme buttons to select/deselect. Enter values (0-5) for selected enzymes. Analysis updates in real-time.</p>
            </div>
          </div>
        </div>
        
        {/* Right Column: Inter-Organism Comparison & Analytics */}
        <div className="space-y-6">
          {/* Inter-Organism Comparison */}
          <div className="bg-white rounded-xl shadow border border-blue-200 overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <h2 className="text-lg font-bold text-blue-700">Inter-Organism Comparison</h2>
              <p className="text-sm text-gray-600 mt-1">Compare specific enzyme across all organisms</p>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Enzyme to Compare:
                </label>
                <div className="flex flex-wrap gap-2">
                  {allSelectedEnzymes.map(enzyme => (
                    <button
                      key={enzyme}
                      onClick={() => setComparisonEnzyme(enzyme)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        comparisonEnzyme === enzyme
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {enzyme}
                    </button>
                  ))}
                </div>
              </div>
              
              {comparisonEnzyme && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {comparisonEnzyme} Comparison Across Organisms
                  </h3>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {interOrganismComparison.map((item, index) => (
                      <div
                        key={item.organism}
                        className={`p-3 rounded-lg border ${
                          index === 0
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-800">{item.organism}</div>
                            <div className="text-xs text-gray-500">
                              {data.filter(r => r.primarySpecies === item.organism).length} records
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`px-3 py-1 rounded-lg font-bold ${item.color}`}>
                              {item.value.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{item.label}</div>
                          </div>
                        </div>
                        
                        {index === 0 && (
                          <div className="mt-2 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                            🏆 Highest value across all organisms
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {highestComparisonOrganism && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-semibold text-blue-800">Summary:</div>
                      <div className="text-sm text-gray-700 mt-1">
                        <strong>{highestComparisonOrganism.organism}</strong> has the highest {comparisonEnzyme} activity 
                        with a value of <strong>{highestComparisonOrganism.value.toFixed(2)}</strong> ({highestComparisonOrganism.label}).
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!comparisonEnzyme && allSelectedEnzymes.length > 0 && (
                <div className="text-center py-8 text-gray-400">
                  Select an enzyme to compare across organisms
                </div>
              )}
              
              {!comparisonEnzyme && allSelectedEnzymes.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No enzymes selected. Select enzymes in the table to enable comparison.
                </div>
              )}
            </div>
          </div>
          
          {/* Enzyme Distribution Analytics */}
          <div className="bg-white rounded-xl shadow border border-purple-200 overflow-hidden">
            <div className="p-4 bg-purple-50 border-b border-purple-200">
              <h2 className="text-lg font-bold text-purple-700">Enzyme Distribution Analytics</h2>
              <p className="text-sm text-gray-600 mt-1">Overview of enzyme presence and values</p>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                {allSelectedEnzymes.map(enzyme => {
                  const dist = enzymeDistribution[enzyme];
                  if (!dist) return null;
                  
                  return (
                    <div key={enzyme} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium text-gray-800 capitalize">{enzyme}</div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${getValueColor(dist.averageValue)}`}>
                          Avg: {dist.averageValue.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-2">
                        Present in {dist.count} of {organisms.length} organisms
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(dist.count / organisms.length) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>{Math.round((dist.count / organisms.length) * 100)}% presence</span>
                        <span>100%</span>
                      </div>
                    </div>
                  );
                })}
                
                {allSelectedEnzymes.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No enzymes selected. Select enzymes in the table to see analytics.
                  </div>
                )}
              </div>
              
              {allSelectedEnzymes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-semibold text-gray-800 mb-2">Summary Statistics</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Total Organisms</div>
                      <div className="font-bold text-gray-800">{organisms.length}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Active Enzymes</div>
                      <div className="font-bold text-gray-800">{allSelectedEnzymes.length}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Avg. Enzyme Value</div>
                      <div className="font-bold text-gray-800">
                        {Object.values(enzymeDistribution).length > 0
                          ? (Object.values(enzymeDistribution).reduce((sum, dist) => sum + dist.averageValue, 0) /
                             Object.values(enzymeDistribution).length).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Total Enzyme Score</div>
                      <div className="font-bold text-gray-800">
                        {Object.values(enzymeDistribution).reduce((sum, dist) => sum + dist.totalValue, 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-3">📊 Activity Scale Legend (0-5)</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-gray-100 rounded font-bold text-center text-xs">0</span>
            <span>Not Present</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-red-100 rounded font-bold text-center text-xs text-red-800">1</span>
            <span>Low (1.0-1.49)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-orange-100 rounded font-bold text-center text-xs text-orange-800">2</span>
            <span>Low-Moderate (1.5-2.49)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-yellow-100 rounded font-bold text-center text-xs text-yellow-800">3</span>
            <span>Moderate (2.5-3.49)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-blue-100 rounded font-bold text-center text-xs text-blue-800">4</span>
            <span>Mod-High (3.5-4.49)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-green-100 rounded font-bold text-center text-xs text-green-800">5</span>
            <span>High (4.5-5.0)</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>All enzyme values are on a 0-5 scale. Values update in real-time as you make changes.</p>
        <p className="mt-1">Data source: cultureBankData.json ({data.length} records, {organisms.length} organisms)</p>
      </div>
    </div>
  );
}
