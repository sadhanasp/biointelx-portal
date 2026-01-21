import json

# Load the JSON data
with open('data/cultureBankData.json', 'r', encoding='utf-8') as f:
    records = json.load(f)

# Provided data lists
fertilizer_values = ["No", "No", "No", "No", "No", "Yes", "Yes", "No", "Yes", "No", "No", "Yes", "Yes", "No", "Yes", "No", "Yes", "No", "Yes", "Yes"]
pesticide_values = ["Yes", "No", "Yes", "No", "No", "Yes", "Yes", "No", "Yes", "No", "Yes", "Yes", "Yes", "No", "Yes", "No", "Yes", "Yes", "Yes", "Yes"]
Bioagents_values = ["Yes", "No", "Yes", "No", "No", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes", "No", "Yes", "No", "Yes", "Yes"]

# Update the records
for i in range(len(records)):
    records[i]["fertilizer"] = fertilizer_values[i]
    records[i]["pesticide"] = pesticide_values[i]
    records[i]["bioagents"] = Bioagents_values[i]

# Save the updated JSON
with open('data/cultureBankData.json', 'w', encoding='utf-8') as f:
    json.dump(records, f, ensure_ascii=False, indent=2)

print("Compatibility data updated successfully!")
