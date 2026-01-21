export default function DetailModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 sm:w-2/3 lg:w-1/2 shadow-lg">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          {item.primarySpecies}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <p><b>Location:</b> {item.location}</p>
          <p><b>Host:</b> {item.host}</p>
          <p><b>Risk Group:</b> {item.riskGroup}</p>
          <p><b>Uses:</b> {item.uses}</p>
          <p><b>GenBank Accession:</b>{" "}
            {item.accession ? (
              <a
                href={`https://www.ncbi.nlm.nih.gov/nuccore/${encodeURIComponent(item.accession)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                {item.accession}
              </a>
            ) : "N/A"}
          </p>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
