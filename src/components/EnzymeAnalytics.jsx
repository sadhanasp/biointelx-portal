import { useState } from 'react';
import Plot from 'react-plotly.js';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.png';

export default function EnzymeAnalytics() {
  const navigate = useNavigate();
  const [enzymeData, setEnzymeData] = useState([
    { id: 1, value: 28, label: 'Sample 1' },
    { id: 2, value: 30, label: 'Sample 2' },
    { id: 3, value: 40, label: 'Sample 3' },
    { id: 4, value: 20, label: 'Sample 4' },
    { id: 5, value: 10, label: 'Sample 5' },
    { id: 6, value: 8, label: 'Sample 6' }
  ]);

  const handleValueChange = (id, value) => {
    const numValue = parseFloat(value) || 0;
    setEnzymeData(prev =>
      prev.map(item =>
        item.id === id ? { ...item, value: numValue } : item
      )
    );
  };

  const handleLabelChange = (id, label) => {
    setEnzymeData(prev =>
      prev.map(item =>
        item.id === id ? { ...item, label } : item
      )
    );
  };

  const maxEnzyme = enzymeData.reduce((max, current) =>
    current.value > max.value ? current : max
  );

  const data = [{
    x: enzymeData.map(item => item.label),
    y: enzymeData.map(item => item.value),
    type: 'bar',
    marker: {
      color: enzymeData.map(item =>
        item.id === maxEnzyme.id ? '#16a34a' : '#cbd5e1' // Green-600 vs Gray-300
      )
    },
    text: enzymeData.map(item =>
      item.id === maxEnzyme.id ? `${item.value} (Highest)` : item.value.toString()
    ),
    textposition: 'auto',
    hovertemplate: '%{x}<br>Value: %{y}<extra></extra>'
  }];

  const layout = {
    title: {
      text: 'Enzyme Activity Comparison',
      font: { size: 24, file: 'Inter', color: '#15803d' },
      y: 0.95
    },
    xaxis: {
      title: {
        text: 'Enzyme Samples',
        font: { size: 14, color: '#374151' }
      },
      tickfont: { color: '#4b5563' }
    },
    yaxis: {
      title: {
        text: 'Activity Value (U/mL)',
        font: { size: 14, color: '#374151' }
      },
      tickfont: { color: '#4b5563' }
    },
    annotations: [{
      x: maxEnzyme.label,
      y: maxEnzyme.value,
      xref: 'x',
      yref: 'y',
      text: 'Greatest Potential',
      showarrow: true,
      arrowhead: 2,
      ax: 0,
      ay: -40,
      font: { color: '#16a34a', size: 14, weight: 'bold' },
      bgcolor: '#f0fdf4',
      bordercolor: '#16a34a',
      borderwidth: 1,
      borderpad: 4,
      opacity: 0.9
    }],
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 80, r: 40, b: 60, l: 60 },
    showlegend: false
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-green-200">
          <div className="flex items-center gap-4">
            <img src={logo} alt="BioIntelX" className="h-14 w-auto object-contain" />
            <div className="h-10 w-px bg-green-200 mx-2"></div>
            <h1 className="text-2xl font-bold text-green-800 tracking-tight">
              Enzyme Analytics System
            </h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:text-green-700 hover:border-green-200 transition-all shadow-sm"
          >
            ← Back to Dashboard
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 p-1.5 rounded-lg text-sm">Input</span>
                Sample Values
              </h2>

              <div className="space-y-4">
                {enzymeData.map((enzyme) => (
                  <div key={enzyme.id} className="group">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-500 group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                        {enzyme.id}
                      </span>
                      <input
                        type="text"
                        value={enzyme.label}
                        onChange={(e) => handleLabelChange(enzyme.id, e.target.value)}
                        className="text-xs font-semibold text-gray-500 uppercase tracking-wide bg-transparent border-none focus:ring-0 p-0 w-full"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        value={enzyme.value}
                        onChange={(e) => handleValueChange(enzyme.id, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-lg"
                        placeholder="0.00"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                        U/mL
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <h3 className="text-lg font-semibold mb-2 opacity-90">Highest Potential</h3>
              <div className="text-4xl font-bold mb-1 tracking-tight">{maxEnzyme.label}</div>
              <div className="text-2xl font-medium opacity-80 mb-4">{maxEnzyme.value} U/mL</div>
              <p className="text-sm text-green-50 leading-relaxed opacity-90">
                This sample demonstrates the highest enzymatic activity and shows the greatest potential for product development.
              </p>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full min-h-[600px] flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg text-sm">Analysis</span>
                Comparative Visualization
              </h2>
              <div className="flex-1 w-full bg-gray-50/50 rounded-xl border border-gray-100 p-4">
                <Plot
                  data={data}
                  layout={layout}
                  style={{ width: '100%', height: '100%' }}
                  useResizeHandler={true}
                  config={{ responsive: true, displayModeBar: false }}
                />
              </div>
              <div className="mt-6 flex gap-6 text-sm text-gray-500 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <span>Highest Potential</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span>Standard Activity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
