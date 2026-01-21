# convert_excel_to_json.py
import pandas as pd
import json
from pathlib import Path

# === path to your Excel file ===
xlsx_path = Path("Final format for BioIntel X.xlsx")
out_path = Path("data/cultureBankData.json")

raw = pd.read_excel(xlsx_path, header=None)

# Debug: write raw data to file
with open("debug_raw.txt", "w", encoding="utf-8") as f:
    f.write(f"Raw shape: {raw.shape}\n")
    f.write("First 10 rows:\n")
    for i in range(min(10, len(raw))):
        f.write(f"Row {i}: {list(raw.iloc[i])}\n")

# Detect correct header row
header_row = 1  # Set to 1 as row 1 contains the headers

df = pd.read_excel(xlsx_path, header=header_row)
df = df.dropna(axis=1, how="all")
df.columns = [str(c).strip() for c in df.columns]

rename_map = {
    "Sample ID": "Lab Sample ID",
    "Location": "Location",
    "Source ": "Source Code",
    "Date  of collection": "Date of Collection",
    "Location coordinates": "Location Coordinates",
    "Sequence data": "Sequence Data",
    "% identity": "Identity (%)",
    "Accession number": "GenBank Accession",
    "Characterized organism": "Primary Species",
    "Risk group": "Risk Group",
    "Image": "Image",
    "Shape ": "Shape",
    "Colour ": "Colour",
    "Gram nature": "Gram Nature",
    "Spore formation": "Spore Formation",
    "Catalase": "Catalase",
    "Oxidase": "Oxidase",
    "Nitrate reduction": "Nitrate Reduction",
    "Salt tolerance": "Salt Tolerance",
    "pH range": "pH Range",
    "Phosphate solubilization": "Phosphate Solubilization",
    "Potassium solubilization": "Potassium Solubilization",
    "Nitrogen fixation": "Nitrogen Fixation",
    "Zinc solubilization": "Zinc Solubilization",
    "Iron mobilization": "Iron Mobilization",
    "Sulphur oxidation": "Sulphur Oxidation",
    "Silicate solubilization": "Silicate Solubilization",
    "Indole-3-acetic acid (IAA) production (µg/ml)": "IAA Production",
    "Gibberellic acid (GA₃) (µg/ml)": "GA3 Production",
    "Cytokinin (zeatin) (µg/ml)": "Cytokinin Production",
    "ACC Deaminase Activity": "ACC Deaminase Activity",
    "Ammonia Production": "Ammonia Production",
    "H₂O₂ / ROS Scavenging": "ROS Scavenging",
    "Salt / Drought Tolerance": "Salt Drought Tolerance",
    "Antifungal Activity": "Antifungal Activity",
    "Antibacterial Activity": "Antibacterial Activity",
    "Chitinase": "Chitinase",
    "β-1,3-glucanase": "Glucanase",
    "Cellulase": "Cellulase",
    "VOC Production": "VOC Production",
    "Biofilm Formation": "Biofilm Formation",
    "EPS": "EPS",
    "Amylase": "Amylase",
    "Protease": "Protease",
    "Lipase": "Lipase",
    "Phytase": "Phytase",
    "Whole genome sequencing NGS/Activity based gene identification ": "Whole Genome Sequencing",
    "Metabolite extraction/ stability": "Metabolite Extraction",
    "UV Spectroscopy": "UV Spectroscopy",
    "HPLC": "HPLC",
    "GCMS/ LCMS": "GCMS LCMS",
    "Compatibility": "compatibility",
    "Fertilizer": "fertilizer",
    "Pesticide": "Pesticide",
    "bioagents": "Beneficial Role (PGPR)",
    "NCBI": "NCBI",
    "NBAIM": "NBAIM",
    "MTCC": "MTCC"
}
df = df.rename(columns={c: rename_map[c] for c in df.columns if c in rename_map})

# Ensure ID
if "Lab Sample ID" not in df.columns:
    df.insert(0, "Lab Sample ID", [f"GEN-{i+1}" for i in range(len(df))])
else:
    df["Lab Sample ID"] = df["Lab Sample ID"].fillna("").astype(str)
    missing_mask = df["Lab Sample ID"].str.strip() == ""
    df.loc[missing_mask, "Lab Sample ID"] = [f"GEN-{i+1}" for i in range(len(df)) if missing_mask.iloc[i]]

# Primary species rule (Option B)
if "Primary Species" not in df.columns:
    df["Primary Species"] = ""
if "Bacterial Species" in df.columns:
    df["Primary Species"] = df["Primary Species"].where(
        df["Primary Species"].str.strip() != "",
        df["Bacterial Species"].fillna("")
    )
if "Fungal Species" in df.columns:
    df["Primary Species"] = df["Primary Species"].where(
        df["Primary Species"].str.strip() != "",
        df["Fungal Species"].fillna("")
    )

# Build record list
records = []
for _, r in df.iterrows():
    def val(key):
        return "" if key not in r or pd.isna(r[key]) else str(r[key]).strip()

    records.append({
        "id": val("Lab Sample ID"),
        "sourceCode": val("Source Code"),
        "location": val("Location"),
        "host": val("Host"),
        "primarySpecies": val("Primary Species"),
        "bacterialSpecies": val("Bacterial Species"),
        "fungalSpecies": val("Fungal Species"),
        "beneficialRole": val("Beneficial Role (PGPR)"),
        "uses": val("Uses"),
        "riskGroup": val("Risk Group"),
        "accession": val("GenBank Accession"),
        "identityPercent": val("Identity (%)"),
        "isolationMedia": val("Isolation Media"),
        "bacteriaCount": val("Bacteria Count"),
        "fungiCount": val("Fungi Count"),
        "plantPathogen": val("Plant Pathogen"),
        "animalPathogen": val("Animal Pathogen"),
        "microscopy": val("Microscopy"),
        "antagonisticActivity": val("Antagonistic Activity"),
        "enzymeActivity": val("Enzyme Activity"),
        "nutrientActivity": val("Nutrient Activity"),
        "dateOfCollection": val("Date of Collection"),
        "locationCoordinates": val("Location Coordinates"),
        "sequenceData": val("Sequence Data"),
        "characterizedOrganism": val("Characterized organism"),
        "image": val("Image"),
        "shape": val("Shape"),
        "colour": val("Colour"),
        "gramNature": val("Gram Nature"),
        "sporeFormation": val("Spore Formation"),
        "catalase": val("Catalase"),
        "oxidase": val("Oxidase"),
        "nitrateReduction": val("Nitrate Reduction"),
        "saltTolerance": val("Salt Tolerance"),
        "pHRange": val("pH Range"),
        "phosphateSolubilization": val("Phosphate Solubilization"),
        "potassiumSolubilization": val("Potassium Solubilization"),
        "nitrogenFixation": val("Nitrogen Fixation"),
        "zincSolubilization": val("Zinc Solubilization"),
        "ironMobilization": val("Iron Mobilization"),
        "sulphurOxidation": val("Sulphur Oxidation"),
        "silicateSolubilization": val("Silicate Solubilization"),
        "iaaProduction": val("IAA Production"),
        "ga3Production": val("GA3 Production"),
        "cytokininProduction": val("Cytokinin Production"),
        "accDeaminaseActivity": val("ACC Deaminase Activity"),
        "ammoniaProduction": val("Ammonia Production"),
        "rosScavenging": val("ROS Scavenging"),
        "saltDroughtTolerance": val("Salt Drought Tolerance"),
        "antifungalActivity": val("Antifungal Activity"),
        "antibacterialActivity": val("Antibacterial Activity"),
        "chitinase": val("Chitinase"),
        "glucanase": val("Glucanase"),
        "cellulase": val("Cellulase"),
        "vocProduction": val("VOC Production"),
        "biofilmFormation": val("Biofilm Formation"),
        "eps": val("EPS"),
        "amylase": val("Amylase"),
        "protease": val("Protease"),
        "lipase": val("Lipase"),
        "phytase": val("Phytase"),
        "wholeGenomeSequencing": val("Whole Genome Sequencing"),
        "metaboliteExtraction": val("Metabolite Extraction"),
        "uvSpectroscopy": val("UV Spectroscopy"),
        "hplc": val("HPLC"),
        "gcmsLcms": val("GCMS LCMS"),
        "compatibility": val("Compatibility"),
        "fertilizer": val("Fertilizer"),
        "pesticide": val("Pesticide"),
        "ncbi": val("NCBI"),
        "nbaim": val("NBAIM"),
        "mtcc": val("MTCC")
    })

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False, indent=2)

print("✅ Conversion complete!")
print("🎯 File Generated:", out_path.resolve())
print("📌 Total Records:", len(records))
