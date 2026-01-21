import json

# Load the JSON data
with open('data/cultureBankData.json', 'r', encoding='utf-8') as f:
    records = json.load(f)

# Provided source values (excluding the first "Source" as it's the label)
source_values = ["Soil", "Soil", "Soil", "Soil", "Soil", "Soil", "Soil", "Soil", "Soil", "Soil", "Leaf water", "Sand dew soil", "Sand dew soil", "Sand dew soil", "Sand dew soil", "Sand dew soil", "soil", "Red Soil", "Pine Forest soil", "Soil"]

# Update the records
for i in range(len(records)):
    records[i]["sourceCode"] = source_values[i]

# Save the updated JSON
with open('data/cultureBankData.json', 'w', encoding='utf-8') as f:
    json.dump(records, f, ensure_ascii=False, indent=2)

print("Source data updated successfully!")
