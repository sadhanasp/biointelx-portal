import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MicrobeTable from "./components/MicrobeTable";
import FilterBar from "./components/FilterBar";
import Login from "./components/Login";
import RecordForm from "./components/RecordForm";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import { useData } from "./context/DataContext";
import logo from "./assets/logo1.png";
import { exportToCSV } from "./utils/exportCsv";

export default function TablePage() {
  const { data, addRecord, updateRecord, deleteRecord } = useData();
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [formMode, setFormMode] = useState('add');
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

  const handleAddNew = () => {
    setFormMode('add');
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleEdit = (record) => {
    setFormMode('edit');
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (record) => {
    setDeletingRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (formMode === 'add') {
      const result = addRecord(formData);
      if (result.success) {
        setIsFormOpen(false);
        alert('Record added successfully!');
      } else {
        alert('Error adding record: ' + result.error);
      }
    } else {
      const result = updateRecord(editingRecord.id, formData);
      if (result.success) {
        setIsFormOpen(false);
        alert('Record updated successfully!');
      } else {
        alert('Error updating record: ' + result.error);
      }
    }
  };

  const handleDeleteConfirm = () => {
    const result = deleteRecord(deletingRecord.id);
    if (result.success) {
      setIsDeleteDialogOpen(false);
      setDeletingRecord(null);
      alert('Record deleted successfully!');
    } else {
      alert('Error deleting record: ' + result.error);
    }
  };

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

      {/* Back to Analytics Button */}
      <div className="text-center mb-6">
        <button
          onClick={() => navigate("/")}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Analytics
        </button>
      </div>

      {/* Search and Filter */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        onFilter={setLocationFilter}
        onRiskGroupFilter={setRiskGroupFilter}
        uniqueLocations={uniqueLocations}
      />

      {/* Add New Record Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleAddNew}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
        >
          <span className="text-xl">+</span> Add New Record
        </button>
      </div>

      {/* Table */}
      <MicrobeTable 
        data={filteredData} 
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Export Section */}
      <div className="mt-8 p-6 bg-white rounded-xl shadow border border-green-200">
        <h3 className="text-lg font-bold text-green-700 mb-4">📥 Export Data</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              if (data.length > 0) {
                exportToCSV(data, `biointelx_complete_${new Date().toISOString().split('T')[0]}.csv`);
              }
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Export Full Dataset as CSV
          </button>

          <button
            onClick={() => {
              if (filteredData.length > 0) {
                exportToCSV(filteredData, `biointelx_filtered_${new Date().toISOString().split('T')[0]}.csv`);
              }
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Export Filtered Data as CSV
          </button>
        </div>

      </div>

      {/* Record Form Modal */}
      <RecordForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingRecord}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingRecord(null);
        }}
        onConfirm={handleDeleteConfirm}
        recordInfo={deletingRecord}
      />
    </div>
  );
}

