import { useState, useEffect, useCallback, useRef, memo } from 'react';

// Extract components outside to prevent re-creation on every render
const InputField = ({ label, name, value, onChange, mode, type = 'text', required = false, options = null }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && '*'}
    </label>
    {options ? (
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        disabled={mode === 'edit' && name === 'id'}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
      >
        <option value="">Select...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        rows="3"
        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        disabled={mode === 'edit' && name === 'id'}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
      />
    )}
  </div>
);

// New ActivityField component for standardized Yes/No + Zone of Inhibition workflow
const ActivityField = ({ label, name, zoneName, formData, setFormData, required = false }) => {
  const activityStatus = formData[name] || '';
  const zoneValue = formData[zoneName] || '';

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      [zoneName]: value === 'NO' ? null : prev[zoneName]
    }));
  };

  const handleZoneChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers with decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [zoneName]: value
      }));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <select
            name={name}
            value={activityStatus}
            onChange={handleStatusChange}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
        </div>
        {activityStatus === 'YES' && (
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                name={zoneName}
                value={zoneValue}
                onChange={handleZoneChange}
                placeholder="Zone of inhibition"
                required={activityStatus === 'YES'}
                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                mm
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomFieldsSection = memo(({ tabId, customFields = {}, onAdd, onChange, onRemove }) => {
  const hasCustomFields = Object.keys(customFields).length > 0;

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Custom Fields</h3>
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        >
          + Add Custom Field
        </button>
      </div>

      {hasCustomFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(customFields).map(([key, fieldData]) => (
            <div key={key} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name
                </label>
                <input
                  type="text"
                  value={fieldData.name || ''}
                  onChange={(e) => onChange(key, 'name', e.target.value)}
                  placeholder="Enter field name"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <textarea
                  value={fieldData.value || ''}
                  onChange={(e) => onChange(key, 'value', e.target.value)}
                  placeholder="Enter value"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(key)}
                className="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                title="Remove field"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {!hasCustomFields && (
        <p className="text-gray-500 text-sm italic">No custom fields added yet. Click "Add Custom Field" to create one.</p>
      )}
    </div>
  );
});

export default function RecordForm({ isOpen, onClose, onSubmit, initialData, mode = 'add' }) {
  const [formData, setFormData] = useState({
    id: '', sourceCode: '', location: '', host: '', primarySpecies: '', bacterialSpecies: '',
    fungalSpecies: '', beneficialRole: '', uses: '', riskGroup: '', accession: '', identityPercent: '',
    isolationMedia: '', bacteriaCount: '', fungiCount: '', plantPathogen: '', animalPathogen: '',
    microscopy: '', antagonisticActivity: '', enzymeActivity: '', nutrientActivity: '',
    dateOfCollection: '', locationCoordinates: '', sequenceData: '', characterizedOrganism: '',
    image: '', shape: '', colour: '', gramNature: '', sporeFormation: '', catalase: '', oxidase: '',
    nitrateReduction: '', saltTolerance: '', pHRange: '', 
    // PGPR Activities
    phosphateSolubilization: '', phosphateSolubilizationZone: '',
    potassiumSolubilization: '', potassiumSolubilizationZone: '',
    nitrogenFixation: '', nitrogenFixationZone: '',
    zincSolubilization: '', zincSolubilizationZone: '',
    ironMobilization: '', ironMobilizationZone: '',
    sulphurOxidation: '', sulphurOxidationZone: '',
    silicateSolubilization: '', silicateSolubilizationZone: '',
    iaaProduction: '', iaaProductionZone: '',
    ga3Production: '', ga3ProductionZone: '',
    cytokininProduction: '', cytokininProductionZone: '',
    accDeaminaseActivity: '', accDeaminaseActivityZone: '',
    ammoniaProduction: '', ammoniaProductionZone: '',
    rosScavenging: '', rosScavengingZone: '',
    saltDroughtTolerance: '', saltDroughtToleranceZone: '',
    // Antagonistic Activities
    antifungalActivity: '', antifungalActivityZone: '',
    antibacterialActivity: '', antibacterialActivityZone: '',
    // Enzyme Activities
    chitinase: '', chitinaseZone: '',
    glucanase: '', glucanaseZone: '',
    cellulase: '', cellulaseZone: '',
    amylase: '', amylaseZone: '',
    protease: '', proteaseZone: '',
    lipase: '', lipaseZone: '',
    phytase: '', phytaseZone: '',
    // Other Activities
    vocProduction: '', vocProductionZone: '',
    biofilmFormation: '', biofilmFormationZone: '',
    eps: '', epsZone: '',
    // Other fields
    droughtTolerance: '', wholeGenomeSequencing: '', metaboliteExtraction: '',
    uvSpectroscopy: '', hplc: '', gcmsLcms: '', bioagents: '', fertilizer: '', pesticide: '',
    ncbi: '', nbaim: '', mtcc: '',
    customFields: {
      basic: {},
      morphological: {},
      biochemical: {},
      pgpr: {},
      antagonistic: {},
      enzyme: {},
      other: {},
      analytical: {},
      compatibility: {},
      accession: {},
      custom: {} // Added custom tab
    }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const debounceRef = useRef({});

  useEffect(() => {
    if (initialData) {
      // Unflatten customFields from flat structure to tab-based structure for editing
      const unflattenedCustomFields = {
        basic: {},
        morphological: {},
        biochemical: {},
        pgpr: {},
        antagonistic: {},
        enzyme: {},
        other: {},
        analytical: {},
        compatibility: {},
        accession: {}
      };

      if (initialData.customFields) {
        Object.entries(initialData.customFields).forEach(([key, fieldData]) => {
          // For now, put all custom fields in the 'custom' tab since we don't know which tab they belong to
          // In a real implementation, you might want to store tab information with each custom field
          const fieldKey = `customField_${Date.now()}`;
          unflattenedCustomFields.custom[fieldKey] = {
            name: key,
            type: fieldData.type || 'text',
            value: fieldData.value || ''
          };
        });
      }

      setFormData({
        ...initialData,
        customFields: unflattenedCustomFields
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = useCallback((tabId, key, field, value) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [tabId]: {
          ...prev.customFields[tabId],
          [key]: {
            ...prev.customFields[tabId][key],
            [field]: value
          }
        }
      }
    }));
  }, []);

  const addCustomField = useCallback((tabId) => {
    const key = `customField_${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [tabId]: {
          ...prev.customFields[tabId],
          [key]: {
            name: '',
            type: 'text',
            value: ''
          }
        }
      }
    }));
  }, []);

  const removeCustomField = useCallback((tabId, key) => {
    setFormData(prev => {
      const newTabFields = { ...prev.customFields[tabId] };
      delete newTabFields[key];
      return {
        ...prev,
        customFields: {
          ...prev.customFields,
          [tabId]: newTabFields
        }
      };  
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Flatten customFields from tab-based structure to flat object
    const flattenedCustomFields = {};
    Object.values(formData.customFields).forEach(tabFields => {
      Object.entries(tabFields).forEach(([key, fieldData]) => {
        // Use the field name as the key, and store the value with type information
        if (fieldData.name && fieldData.name.trim()) {
          flattenedCustomFields[fieldData.name] = {
            value: fieldData.value,
            type: fieldData.type
          };
        }
      });
    });
    const dataToSubmit = {
      ...formData,
      customFields: flattenedCustomFields
    };
    onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'morphological', label: 'Morphological' },
    { id: 'biochemical', label: 'Biochemical' },
    { id: 'pgpr', label: 'PGPR Activities' },
    { id: 'antagonistic', label: 'Antagonistic' },
    { id: 'enzyme', label: 'Enzymes' },
    { id: 'other', label: 'Other' },
    { id: 'analytical', label: 'Analytical' },
    { id: 'compatibility', label: 'Compatibility' },
    { id: 'accession', label: 'Accession' },
    { id: 'custom', label: 'Custom Fields' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl my-8 shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-lg p-6 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-green-700">
              {mode === 'add' ? '➕ Add New Record' : '✏️ Edit Record'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="border-b border-gray-200 px-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'basic' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="ID" name="id" value={formData.id} onChange={handleChange} mode={mode} required />
                  <InputField label="Source" name="sourceCode" value={formData.sourceCode} onChange={handleChange} mode={mode} />
                  <InputField label="Location Coordinates" name="locationCoordinates" value={formData.locationCoordinates} onChange={handleChange} mode={mode} />
                  <InputField label="Location" name="location" value={formData.location} onChange={handleChange} mode={mode} />
                  <InputField label="Host" name="host" value={formData.host} onChange={handleChange} mode={mode} />
                  <InputField label="Primary Species" name="primarySpecies" value={formData.primarySpecies} onChange={handleChange} mode={mode} required />
                  <InputField label="Beneficial Role" name="beneficialRole" value={formData.beneficialRole} onChange={handleChange} mode={mode} options={['Yes', 'No']} />
                  <InputField label="Risk Group" name="riskGroup" value={formData.riskGroup} onChange={handleChange} mode={mode} options={['RG -- 1', 'RG - 2', 'RG - 3']} />
                  <InputField label="Uses" name="uses" value={formData.uses} onChange={handleChange} mode={mode} />
                  <InputField label="Accession" name="accession" value={formData.accession} onChange={handleChange} mode={mode} />
                  <InputField label="Identity Percent" name="identityPercent" value={formData.identityPercent} onChange={handleChange} mode={mode} />
                  <InputField label="Date of Collection" name="dateOfCollection" value={formData.dateOfCollection} onChange={handleChange} mode={mode} />

                  <div className="md:col-span-2">
                    <InputField label="Sequence Data" name="sequenceData" value={formData.sequenceData} onChange={handleChange} mode={mode} type="textarea" />
                  </div>
                </div>
                <CustomFieldsSection 
                  tabId="basic" 
                  customFields={formData.customFields.basic} 
                  onAdd={() => addCustomField('basic')}
                  onChange={(key, field, value) => handleCustomFieldChange('basic', key, field, value)}
                  onRemove={(key) => removeCustomField('basic', key)}
                />
              </div>
            )}

            {activeTab === 'morphological' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Shape" name="shape" value={formData.shape} onChange={handleChange} mode={mode} />
                  <InputField label="Colour" name="colour" value={formData.colour} onChange={handleChange} mode={mode} />
                  <InputField label="Gram Nature" name="gramNature" value={formData.gramNature} onChange={handleChange} mode={mode} options={['Gram +', 'Gram -', 'Not applicable (fungus)']} />
                  <InputField label="Spore Formation" name="sporeFormation" value={formData.sporeFormation} onChange={handleChange} mode={mode} options={['Yes', 'No', 'Yes (conidia)']} />
                </div>
                <CustomFieldsSection 
                  tabId="morphological"
                  customFields={formData.customFields.morphological}
                  onAdd={() => addCustomField('morphological')}
                  onChange={(key, field, value) => handleCustomFieldChange('morphological', key, field, value)}
                  onRemove={(key) => removeCustomField('morphological', key)}
                />
              </div>
            )}

            {activeTab === 'biochemical' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Catalase" name="catalase" value={formData.catalase} onChange={handleChange} mode={mode} options={['+', '-']} />
                  <InputField label="Oxidase" name="oxidase" value={formData.oxidase} onChange={handleChange} mode={mode} options={['+', '-']} />
                  <InputField label="Nitrate Reduction" name="nitrateReduction" value={formData.nitrateReduction} onChange={handleChange} mode={mode} options={['+', '-']} />
                  <InputField label="Salt Tolerance" name="saltTolerance" value={formData.saltTolerance} onChange={handleChange} mode={mode} />
                  <InputField label="pH Range" name="pHRange" value={formData.pHRange} onChange={handleChange} mode={mode} />
                </div>
                <CustomFieldsSection 
                  tabId="biochemical"
                  customFields={formData.customFields.biochemical}
                  onAdd={() => addCustomField('biochemical')}
                  onChange={(key, field, value) => handleCustomFieldChange('biochemical', key, field, value)}
                  onRemove={(key) => removeCustomField('biochemical', key)}
                />
              </div>
            )}

            {activeTab === 'pgpr' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActivityField label="Phosphate Solubilization" name="phosphateSolubilization" zoneName="phosphateSolubilizationZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Potassium Solubilization" name="potassiumSolubilization" zoneName="potassiumSolubilizationZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Nitrogen Fixation" name="nitrogenFixation" zoneName="nitrogenFixationZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Zinc Solubilization" name="zincSolubilization" zoneName="zincSolubilizationZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Iron Mobilization" name="ironMobilization" zoneName="ironMobilizationZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Sulphur Oxidation" name="sulphurOxidation" zoneName="sulphurOxidationZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Silicate Solubilization" name="silicateSolubilization" zoneName="silicateSolubilizationZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="IAA Production" name="iaaProduction" zoneName="iaaProductionZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="GA3 Production" name="ga3Production" zoneName="ga3ProductionZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Cytokinin Production" name="cytokininProduction" zoneName="cytokininProductionZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="ACC Deaminase Activity" name="accDeaminaseActivity" zoneName="accDeaminaseActivityZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Ammonia Production" name="ammoniaProduction" zoneName="ammoniaProductionZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="ROS Scavenging" name="rosScavenging" zoneName="rosScavengingZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Salt Drought Tolerance" name="saltDroughtTolerance" zoneName="saltDroughtToleranceZone" formData={formData} setFormData={setFormData} />
                </div>
                <CustomFieldsSection 
                  tabId="pgpr"
                  customFields={formData.customFields.pgpr}
                  onAdd={() => addCustomField('pgpr')}
                  onChange={(key, field, value) => handleCustomFieldChange('pgpr', key, field, value)}
                  onRemove={(key) => removeCustomField('pgpr', key)}
                />
              </div>
            )}

            {activeTab === 'antagonistic' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActivityField label="Antifungal Activity" name="antifungalActivity" zoneName="antifungalActivityZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Antibacterial Activity" name="antibacterialActivity" zoneName="antibacterialActivityZone" formData={formData} setFormData={setFormData} />
                </div>
                <CustomFieldsSection 
                  tabId="antagonistic"
                  customFields={formData.customFields.antagonistic}
                  onAdd={() => addCustomField('antagonistic')}
                  onChange={(key, field, value) => handleCustomFieldChange('antagonistic', key, field, value)}
                  onRemove={(key) => removeCustomField('antagonistic', key)}
                />
              </div>
            )}

            {activeTab === 'enzyme' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActivityField label="Chitinase" name="chitinase" zoneName="chitinaseZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Glucanase" name="glucanase" zoneName="glucanaseZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Cellulase" name="cellulase" zoneName="cellulaseZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Amylase" name="amylase" zoneName="amylaseZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Protease" name="protease" zoneName="proteaseZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Lipase" name="lipase" zoneName="lipaseZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Phytase" name="phytase" zoneName="phytaseZone" formData={formData} setFormData={setFormData} />
                </div>
                <CustomFieldsSection 
                  tabId="enzyme"
                  customFields={formData.customFields.enzyme}
                  onAdd={() => addCustomField('enzyme')}
                  onChange={(key, field, value) => handleCustomFieldChange('enzyme', key, field, value)}
                  onRemove={(key) => removeCustomField('enzyme', key)}
                />
              </div>
            )}

            {activeTab === 'other' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActivityField label="VOC Production" name="vocProduction" zoneName="vocProductionZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="Biofilm Formation" name="biofilmFormation" zoneName="biofilmFormationZone" formData={formData} setFormData={setFormData} />
                  <ActivityField label="EPS" name="eps" zoneName="epsZone" formData={formData} setFormData={setFormData} />
                </div>
                <CustomFieldsSection 
                  tabId="other"
                  customFields={formData.customFields.other}
                  onAdd={() => addCustomField('other')}
                  onChange={(key, field, value) => handleCustomFieldChange('other', key, field, value)}
                  onRemove={(key) => removeCustomField('other', key)}
                />
              </div>
            )}

            {activeTab === 'analytical' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Whole Genome Sequencing" name="wholeGenomeSequencing" value={formData.wholeGenomeSequencing} onChange={handleChange} mode={mode} options={['Yes', 'No']} />
                  <InputField label="Metabolite Extraction" name="metaboliteExtraction" value={formData.metaboliteExtraction} onChange={handleChange} mode={mode} options={['Yes', 'No']} />
                  <InputField label="UV Spectroscopy" name="uvSpectroscopy" value={formData.uvSpectroscopy} onChange={handleChange} mode={mode} options={['Yes', 'No']} />
                  <InputField label="HPLC" name="hplc" value={formData.hplc} onChange={handleChange} mode={mode} options={['Yes', 'No']} />
                  <InputField label="GCMS LCMS" name="gcmsLcms" value={formData.gcmsLcms} onChange={handleChange} mode={mode} options={['Yes', 'No']} />
                </div>
                <CustomFieldsSection 
                  tabId="analytical"
                  customFields={formData.customFields.analytical}
                  onAdd={() => addCustomField('analytical')}
                  onChange={(key, field, value) => handleCustomFieldChange('analytical', key, field, value)}
                  onRemove={(key) => removeCustomField('analytical', key)}
                />
              </div>
            )}

            {activeTab === 'compatibility' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Bioagents" name="bioagents" value={formData.bioagents} onChange={handleChange} mode={mode} options={['Yes', 'No']} />
                  <InputField label="Fertilizer" name="fertilizer" value={formData.fertilizer} onChange={handleChange} mode={mode} options={['Yes', 'No']} />
                  <InputField label="Pesticide" name="pesticide" value={formData.pesticide} onChange={handleChange} mode={mode} options={['Yes', 'No']} />
                </div>
                <CustomFieldsSection 
                  tabId="compatibility"
                  customFields={formData.customFields.compatibility}
                  onAdd={() => addCustomField('compatibility')}
                  onChange={(key, field, value) => handleCustomFieldChange('compatibility', key, field, value)}
                  onRemove={(key) => removeCustomField('compatibility', key)}
                />
              </div>
            )}

            {activeTab === 'accession' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="NCBI" name="ncbi" value={formData.ncbi} onChange={handleChange} mode={mode} />
                  <InputField label="NBAIM" name="nbaim" value={formData.nbaim} onChange={handleChange} mode={mode} />
                  <InputField label="MTCC" name="mtcc" value={formData.mtcc} onChange={handleChange} mode={mode} />
                </div>
                <CustomFieldsSection 
                  tabId="accession"
                  customFields={formData.customFields.accession}
                  onAdd={() => addCustomField('accession')}
                  onChange={(key, field, value) => handleCustomFieldChange('accession', key, field, value)}
                  onRemove={(key) => removeCustomField('accession', key)}
                />
              </div>
            )}

            {activeTab === 'custom' && (
               <CustomFieldsSection 
                  tabId="custom"
                  customFields={formData.customFields.custom}
                  onAdd={() => addCustomField('custom')}
                  onChange={(key, field, value) => handleCustomFieldChange('custom', key, field, value)}
                  onRemove={(key) => removeCustomField('custom', key)}
                />
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {mode === 'add' ? 'Add Record' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
