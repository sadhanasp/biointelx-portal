import json

# Read the cultureBankData.json file
with open('public/cultureBankData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total records: {len(data)}")

# Get unique organisms (primarySpecies)
organisms = set()
for record in data:
    if record.get('primarySpecies') and record['primarySpecies'].strip():
        organisms.add(record['primarySpecies'])

print(f"Unique organisms (primarySpecies): {len(organisms)}")
print(f"First 10 organisms: {list(organisms)[:10]}")

# Enzyme fields
enzyme_fields = ['chitinase', 'glucanase', 'cellulase', 'amylase', 'protease', 'lipase', 'phytase']

# Check enzyme presence for first organism
if organisms:
    first_org = list(organisms)[0]
    org_data = [r for r in data if r.get('primarySpecies') == first_org]
    
    print(f"\nChecking enzyme presence for {first_org} ({len(org_data)} records):")
    for enzyme in enzyme_fields:
        values = [r.get(enzyme, '') for r in org_data if r.get(enzyme) and r.get(enzyme) not in ['-', '']]
        if values:
            print(f"  {enzyme}: Yes - {', '.join(values[:3])}{'...' if len(values) > 3 else ''}")
        else:
            print(f"  {enzyme}: No")

# Check what enzyme values look like
print(f"\nSample enzyme values across all data:")
for enzyme in enzyme_fields:
    all_values = [r.get(enzyme, '') for r in data if r.get(enzyme) and r.get(enzyme) not in ['-', '']]
    unique_values = set(all_values)
    print(f"  {enzyme}: {len(all_values)} non-empty values, unique: {list(unique_values)[:5]}")
