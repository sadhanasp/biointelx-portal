export function exportToCSV(data, filename = "culture_bank.csv") {
  const csv = [
    Object.keys(data[0]).join(","),
    ...data.map((r) => Object.values(r).map((v) => `"${v}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
