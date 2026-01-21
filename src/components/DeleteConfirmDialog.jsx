export default function DeleteConfirmDialog({ isOpen, onClose, onConfirm, recordInfo }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 sm:w-96 shadow-xl">
        <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Confirm Delete</h2>
        <p className="text-gray-700 mb-2">
          Are you sure you want to delete this record?
        </p>
        {recordInfo && (
          <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
            <p><strong>ID:</strong> {recordInfo.id}</p>
            <p><strong>Species:</strong> {recordInfo.primarySpecies}</p>
            <p><strong>Location:</strong> {recordInfo.location}</p>
          </div>
        )}
        <p className="text-sm text-gray-600 mb-4">
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
