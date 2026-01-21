import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Migrate old field names to new ones
  const migrateData = (data) => {
    return data.map(record => {
      // If record has 'compatibility' field, rename it to 'bioagents'
      if ('compatibility' in record && !('bioagents' in record)) {
        const { compatibility, ...rest } = record;
        return { ...rest, bioagents: compatibility };
      }
      return record;
    });
  };

  // Load data from localStorage or fallback to JSON file
  const loadData = async () => {
    setIsLoading(true);
    try {
      // First, try to get data from localStorage
      const storedData = localStorage.getItem('cultureBankData');
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Migrate old field names
        const migratedData = migrateData(parsedData);
        setData(migratedData);
        // Update localStorage with migrated data
        localStorage.setItem('cultureBankData', JSON.stringify(migratedData));
      } else {
        // If no localStorage data, load from JSON file
        const response = await fetch('../data/cultureBankData.json');
        const jsonData = await response.json();
        const migratedData = migrateData(jsonData);
        setData(migratedData);
        // Save to localStorage for future use
        localStorage.setItem('cultureBankData', JSON.stringify(migratedData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save data to localStorage
  const saveData = (newData) => {
    try {
      localStorage.setItem('cultureBankData', JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  };

  // Add a new record
  const addRecord = (record) => {
    try {
      // Generate a unique ID if not provided
      const newId = record.id || `NEW_${Date.now()}`;
      const newRecord = { ...record, id: newId };
      
      const updatedData = [...data, newRecord];
      saveData(updatedData);
      return { success: true, record: newRecord };
    } catch (error) {
      console.error('Error adding record:', error);
      return { success: false, error: error.message };
    }
  };

  // Update an existing record
  const updateRecord = (id, updatedRecord) => {
    try {
      const updatedData = data.map(item => 
        item.id === id ? { ...item, ...updatedRecord, id } : item
      );
      saveData(updatedData);
      return { success: true };
    } catch (error) {
      console.error('Error updating record:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete a record
  const deleteRecord = (id) => {
    try {
      const updatedData = data.filter(item => item.id !== id);
      saveData(updatedData);
      return { success: true };
    } catch (error) {
      console.error('Error deleting record:', error);
      return { success: false, error: error.message };
    }
  };

  // Reset data to original JSON file
  const resetData = async () => {
    try {
      const response = await fetch('../data/cultureBankData.json');
      const jsonData = await response.json();
      saveData(jsonData);
      return { success: true };
    } catch (error) {
      console.error('Error resetting data:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    data,
    isLoading,
    addRecord,
    updateRecord,
    deleteRecord,
    resetData,
    refreshData: loadData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
