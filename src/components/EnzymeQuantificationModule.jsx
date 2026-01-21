import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Define enzyme list
const ENZYMES = [
  "chitinase",
  "glucanase",
  "cellulase",
  "amylase",
  "protease",
  "lipase",
  "phytase"
];

// Sample organism data (20 organisms as requested)
const SAMPLE_ORGANISMS = [
  { id: 1, name: "Bacillus subtilis", enzymes: { chitinase: 5, glucanase: 4, cellulase: 3, amylase: 2, protease: 4, lipase: 3, phytase: 2 } },
  { id: 2, name: "Pseudomonas fluorescens", enzymes: { chitinase: 3, glucanase: 5, cellulase: 4, amylase: 3, protease: 2, lipase: 4, phytase: 3 } },
  { id: 3, name: "Trichoderma harzianum", enzymes: { chitinase: 4, glucanase: 3, cellulase: 5, amylase: 4, protease: 3, lipase: 2, phytase: 4 } },
  { id: 4, name: "Aspergillus niger", enzymes: { chitinase: 2, glucanase: 4, cellulase: 3, amylase: 5, protease: 4, lipase: 3, phytase: 2 } },
  { id: 5, name: "Streptomyces lydicus", enzymes: { chitinase: 3, glucanase: 2, cellulase: 4, amylase: 3, protease: 5, lipase: 4, phytase: 3 } },
  { id: 6, name: "Rhizobium leguminosarum", enzymes: { chitinase: 4, glucanase: 3, cellulase: 2, amylase: 4, protease: 3, lipase: 5, phytase: 2 } },
  { id: 7, name: "Azotobacter vinelandii", enzymes: { chitinase: 2, glucanase: 4, cellulase: 3, amylase: 5, protease: 2, lipase: 3, phytase: 4 } },
  { id: 8, name: "Methylobacterium extorquens", enzymes: { chitinase: 3, glucanase: 5, cellulase: 4, amylase: 2, protease: 3, lipase: 4, phytase: 3 } },
  { id: 9, name: "Paenibacillus polymyxa", enzymes: { chitinase: 4, glucanase: 3, cellulase: 5, amylase: 3, protease: 4, lipase: 2, phytase: 4 } },
  { id: 10, name: "Bacillus megaterium", enzymes: { chitinase: 5, glucanase: 4, cellulase: 3, amylase: 4, protease: 3, lipase: 5, phytase: 2 } },
  { id: 11, name: "Serratia marcescens", enzymes: { chitinase: 3, glucanase: 4, cellulase: 2, amylase: 5, protease: 4, lipase: 3, phytase: 4 } },
  { id: 12, name: "Pseudomonas putida", enzymes: { chitinase: 4, glucanase: 3, cellulase: 4, amylase: 3, protease: 5, lipase: 2, phytase: 3 } },
  { id: 13, name: "Burkholderia cepacia", enzymes: { chitinase: 2, glucanase: 5, cellulase: 3, amylase: 4, protease: 3, lipase: 4, phytase: 2 } },
  { id: 14, name: "Xanthomonas campestris", enzymes: { chitinase: 3, glucanase: 4, cellulase: 5, amylase: 2, protease: 4, lipase: 3, phytase: 4 } },
  { id: 15, name: "Streptomyces griseus", enzymes: { chitinase: 4, glucanase: 3, cellulase: 4, amylase: 5, protease: 2, lipase: 4, phytase: 3 } },
  { id: 16, name: "Rhizobium etli", enzymes: { chitinase: 3, glucanase: 5, cellulase: 2, amylase: 4, protease: 3, lipase: 5, phytase: 2 } },
  { id: 17, name: "Pseudomonas aeruginosa", enzymes: { chitinase: 5, glucanase: 4, cellulase: 3, amylase: 3, protease: 4, lipase: 2, phytase: 4 } },
  { id: 18, name: "Bacillus thuringiensis", enzymes: { chitinase: 4, glucanase: 3, cellulase: 5, amylase: 2, protease: 5, lipase: 3, phytase: 4 } },
  { id: 19, name: "Azospirillum brasilense", enzymes: { chitinase: 3, glucanase: 4, cellulase: 4, amylase: 5, protease: 2, lipase: 4, phytase: 3 } },
  { id: 20, name: "Methylobacterium nodulans", enzymes: { chitinase: 5, glucanase: 3, cellulase: 3, amylase: 4, protease: 3, lipase: 5, phytase: 2 } }
];

export default function EnzymeQuantificationModule() {
  const navigate = useNavigate();
  
  // State for enzyme values per organism
  const [enzymeValues, setEnzymeValues] = useState({});
  
  // State for selected organism
  const [selectedOrganism, setSelectedOrganism] = useState(null);
  
  // State for selected enzyme for comparison
  const [selectedEnzymeForComparison, setSelectedEnzymeForComparison] = useState(null);
  
  // State for view mode
  const [viewMode, setViewMode] = useState('organism'); // 'organism' or 'comparison'

  // Calculate highest enzyme per organism
  const getHighestEnzymePerOrganism = (organism) => {
    const enzymes = organism.enzymes;
    let highestEnzyme = null;
    let highestValue = 0;
    
    Object.entries(enzymes).forEach(([enzyme, value]) => {
      if (value > highestValue) {
        highestValue = value;
        highestEnzyme = enzyme;
      }
    });
    
    return { enzyme: highestEnzyme, value: highestValue };
  };

  // Calculate total enzymes measured per organism
  const getTotalEnzymesMeasured = (organism) => {
    const enzymes = organism.enzymes;
    return Object.values(enzymes).filter(v => v > 0).length;
  };

  // Get organism with highest value for a specific enzyme
  const getOrganismWithHighestEnzyme = (enzymeName) => {
    let highestOrganism = null;
    let highestValue = 0;
    
    SAMPLE_ORGANISMS.forEach(org => {
      const value = org.enzymes[enzymeName];
      if (value > highestValue) {
        highestValue = value;
        highestOrganism = org;
      }
    });
    
    return { organism: highestOrganism, value: highestValue };
  };

  // Get ranking for a specific enzyme across all organisms
  const getEnzymeRanking = (enzymeName) => {
    return SAMPLE_ORGANISMS
      .map(org => ({
        organism: org.name,
        value: org.enzymes[enzymeName] || 0,
        id: org.id
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    // Highest enzyme per organism
    const highestPerOrganism = SAMPLE_ORGANISMS.map(org => {
      const highest = getHighestEnzymePerOrganism(org);
      return {
        organism: org.name,
        highestEnzyme: highest.enzyme,
        highestValue: highest.value,
        totalEnzymes: getTotalEnzymesMeasured(org)
      };
    });

    // Overall highest enzyme across all organisms
    const overallHighest = {};
    ENZYMES.forEach(enzyme => {
      const result = getOrganismWithHighestEnzyme(enzyme);
      overallHighest[enzyme] = result;
    });

    return {
      highestPerOrganism,
      overallHighest,
      enzymeRankings: ENZYMES.reduce((acc, enzyme) => {
        acc[enzyme] = getEnzymeRanking(enzyme);
        return acc;
      }, {})
    };
  }, []);

  // Handle enzyme value change
  const handleEnzymeValueChange = (organismId, enzymeName, value) => {
    const numValue = parseFloat(value);
    
    // Validate: numeric only, no negative values
    if (isNaN(numValue) || numValue < 0) {
      return; // Invalid input
    }
    
    setEnzymeValues(prev => ({
      ...prev,
      [organismId]: {
        ...prev[organismId],
        [enzymeName]: numValue
      }
    }));
  };

  // Get applicable enzymes for an organism (enzymes with values > 0)
  const getApplicableEnzymes = (organism) => {
    const values = enzymeValues[organism.id] || organism.enzymes;
    return ENZYMES.filter(enzyme => {
      const value = values[enzyme];
      return value !== undefined && value !== null && value > 0;
    });
  };

  // Get color class for enzyme value
  const getValueColorClass = (value) => {
    if (value >= 5) return 'bg-green-100 text-green-800';
    if (value >= 4) return 'bg-blue-100 text-blue-800';
    if (value >= 3) return 'bg-yellow-100 text-yellow-800';
    if (value >= 2) return 'bg-orange-100 text-orange-800';
    if (value >= 1) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-white p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-green-300 pb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-green-700">🧪 Enzyme Quantification & Analytics</h1>
        </div>
        <button
          onClick={() => navigate('/table')}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Table
        </button>
      </header>

      {/* View Mode Toggle */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setViewMode('organism')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            viewMode === 'organism'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📊 Organism View
        </button>
        <button
          onClick={() => setViewMode('comparison')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            viewMode === 'comparison'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📈 Comparison View
        </button>
      </div>

      {/* Organism View */}
      {viewMode === 'organism' && (
        <div className="space-y-6">
          {/* Organism Selection */}
          <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Select Organism</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SAMPLE_ORGANISMS.map(org => (
                <button
                  key={org.id}
                  onClick={() => setSelectedOrganism(org)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedOrganism?.id === org.id
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🦠</div>
                    <div className="font-semibold text-green-800">{org.name}</div>
                    <div className="text-sm text-gray-600">
                      {getTotalEnzymesMeasured(org)} enzymes measured
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Organism Details */}
          {selectedOrganism && (
            <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-700">
                  {selectedOrganism.name} - Enzyme Quantification
                </h2>
                <div className="text-sm text-gray-600">
                  Total enzymes measured: {getTotalEnzymesMeasured(selectedOrganism)}
                </div>
              </div>

              {/* Highest Enzyme Highlight */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-300">
                <h3 className="text-lg font-bold text-green-800 mb-2">🏆 Highest Enzyme</h3>
                {(() => {
                  const highest = getHighestEnzymePerOrganism(selectedOrganism);
                  return (
                    <div className="flex items-center gap-4">
                      <span className="text-gray-700">Dominant enzyme:</span>
                      <span className={`px-4 py-2 rounded-lg font-bold text-xl ${getValueColorClass(highest.value)}`}>
                        {highest.enzyme.charAt(0).toUpperCase() + highest.enzyme.slice(1)}
                      </span>
                      <span className={`text-2xl font-bold ${getValueColorClass(highest.value)}`}>
                        {highest.value}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Enzyme Input Table */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-700 mb-4">Enter Enzyme Values</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-green-800">Enzyme</th>
                        <th className="px-4 py-3 text-left font-semibold text-green-800">Value (1-5)</th>
                        <th className="px-4 py-3 text-left font-semibold text-green-800">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ENZYMES.map(enzyme => (
                        <tr key={enzyme} className="hover:bg-green-50">
                          <td className="px-4 py-3 font-medium text-green-700 capitalize">
                            {enzyme}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              value={enzymeValues[selectedOrganism.id]?.[enzyme] || selectedOrganism.enzymes[enzyme] || ''}
                              onChange={(e) => handleEnzymeValueChange(selectedOrganism.id, enzyme, e.target.value)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="0-5"
                            />
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                              const value = enzymeValues[selectedOrganism.id]?.[enzyme] || selectedOrganism.enzymes[enzyme] || 0;
                              return (
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getValueColorClass(value)}`}>
                                  {value >= 5 ? 'Very High' : value >= 4 ? 'High' : value >= 3 ? 'Moderate' : value >= 2 ? 'Low' : 'Very Low'}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comparison View */}
      {viewMode === 'comparison' && (
        <div className="space-y-6">
          {/* Enzyme Selection for Comparison */}
          <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Select Enzyme for Comparison</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ENZYMES.map(enzyme => (
                <button
                  key={enzyme}
                  onClick={() => setSelectedEnzymeForComparison(enzyme)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedEnzymeForComparison === enzyme
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🧪</div>
                    <div className="font-semibold text-blue-800 capitalize">{enzyme}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Comparison Results */}
          {selectedEnzymeForComparison && (
            <div className="space-y-6">
              {/* Highest Organism for Selected Enzyme */}
              <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6">
                <h3 className="text-xl font-bold text-green-700 mb-4">
                  🏆 Highest {selectedEnzymeForComparison.charAt(0).toUpperCase() + selectedEnzymeForComparison.slice(1)} Value
                </h3>
                {(() => {
                  const result = getOrganismWithHighestEnzyme(selectedEnzymeForComparison);
                  return (
                    <div className="flex items-center gap-4">
                      <span className="text-gray-700">Organism:</span>
                      <span className="text-xl font-bold text-green-800">{result.organism?.name || 'N/A'}</span>
                      <span className="text-gray-700">Value:</span>
                      <span className={`text-3xl font-bold ${getValueColorClass(result.value)}`}>
                        {result.value || 0}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Ranking Table */}
              <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6">
                <h3 className="text-xl font-bold text-green-700 mb-4">
                  📊 {selectedEnzymeForComparison.charAt(0).toUpperCase() + selectedEnzymeForComparison.slice(1)} Ranking
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-green-800">Rank</th>
                        <th className="px-4 py-3 text-left font-semibold text-green-800">Organism</th>
                        <th className="px-4 py-3 text-left font-semibold text-green-800">Value</th>
                        <th className="px-4 py-3 text-left font-semibold text-green-800">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getEnzymeRanking(selectedEnzymeForComparison).map((item, index) => (
                        <tr key={item.id} className={index === 0 ? 'bg-yellow-50' : ''}>
                          <td className="px-4 py-3 font-bold text-yellow-600">
                            #{index + 1}
                          </td>
                          <td className="px-4 py-3 font-medium text-green-800">
                            {item.organism}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xl font-bold ${getValueColorClass(item.value)}`}>
                              {item.value || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getValueColorClass(item.value)}`}>
                              {item.value >= 5 ? 'Very High' : item.value >= 4 ? 'High' : item.value >= 3 ? 'Moderate' : item.value >= 2 ? 'Low' : 'Very Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Dashboard */}
      <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-6">📈 Analytics Dashboard</h2>
        
        {/* Highest Enzyme Per Organism */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Highest Enzyme Per Organism</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-green-800">Organism</th>
                  <th className="px-4 py-3 text-left font-semibold text-green-800">Highest Enzyme</th>
                  <th className="px-4 py-3 text-left font-semibold text-green-800">Value</th>
                  <th className="px-4 py-3 text-left font-semibold text-green-800">Total Enzymes</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.highestPerOrganism.map(item => (
                  <tr key={item.organism} className="hover:bg-green-50">
                    <td className="px-4 py-3 font-medium text-green-800">
                      {item.organism}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getValueColorClass(item.highestValue)}`}>
                        {item.highestEnzyme?.charAt(0).toUpperCase() + item.highestEnzyme?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xl font-bold ${getValueColorClass(item.highestValue)}`}>
                        {item.highestValue}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.totalEnzymes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overall Highest Enzymes */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Overall Highest Enzymes Across All Organisms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ENZYMES.map(enzyme => {
              const highest = analyticsData.overallHighest[enzyme];
              return (
                <div key={enzyme} className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border border-green-300">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🧪</div>
                    <div className="font-semibold text-blue-800 capitalize">{enzyme}</div>
                    <div className="text-sm text-gray-600 mb-1">
                      Highest: {highest.organism?.name || 'N/A'}
                    </div>
                    <div className={`text-3xl font-bold ${getValueColorClass(highest.value)}`}>
                      {highest.value || 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-700 mb-3">📊 Value Scale Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-8 h-8 rounded ${getValueColorClass(1)}`}></span>
              <span>Very Low (1)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-8 h-8 rounded ${getValueColorClass(2)}`}></span>
              <span>Low (2)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-8 h-8 rounded ${getValueColorClass(3)}`}></span>
              <span>Moderate (3)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-8 h-8 rounded ${getValueColorClass(4)}`}></span>
              <span>High (4)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-8 h-8 rounded ${getValueColorClass(5)}`}></span>
              <span>Very High (5)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
