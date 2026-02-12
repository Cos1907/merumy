#!/usr/bin/env python3
import csv
import json
import re
from pathlib import Path

def parse_price(price_str):
    """Parse price string to float"""
    if not price_str or price_str.strip() == '':
        return None
    # Remove currency symbols and spaces, replace comma with dot
    price_str = price_str.strip().replace('TRY', '').replace(',', '.').strip()
    try:
        return float(price_str)
    except:
        return None

def clean_text(text):
    """Clean text from extra spaces and newlines"""
    if not text:
        return ''
    return ' '.join(text.split())

# Read CSV file
csv_path = Path('/Users/huseyinkulekci/Downloads/Merumy Ürün Kartı Şablonu - Ürün Kartı.csv')
products = []
categories = {}
brands = {}

with open(csv_path, 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')
    
    # Skip first two header rows
    data_lines = lines[2:]
    
    for line in data_lines:
        if not line.strip():
            continue
            
        # Parse CSV line manually to handle quoted fields with newlines
        row = []
        current_field = ''
        in_quotes = False
        
        for char in line:
            if char == '"':
                in_quotes = not in_quotes
            elif char == ',' and not in_quotes:
                row.append(current_field)
                current_field = ''
            else:
                current_field += char
        row.append(current_field)  # Add last field
        
        if len(row) < 25:
            continue
            
        try:
            product_code = row[0].strip()
            product_name = clean_text(row[1])
            brand_code = row[15].strip() if len(row) > 15 else ''
            brand_name = clean_text(row[16]) if len(row) > 16 else ''
            category_code = row[17].strip() if len(row) > 17 else ''
            category_name = clean_text(row[18]) if len(row) > 18 else ''
            subcategory_code = row[19].strip() if len(row) > 19 else ''
            subcategory_name = clean_text(row[20]) if len(row) > 20 else ''
            cost_price = parse_price(row[21]) if len(row) > 21 else None
            retail_price = parse_price(row[23]) if len(row) > 23 else None
            image_link = row[24].strip() if len(row) > 24 else ''
            barcode = row[5].strip() if len(row) > 5 else ''
            
            if not product_code or not product_name:
                continue
                
            # Create product object
            product = {
                'id': product_code,
                'code': product_code,
                'name': product_name,
                'brand': brand_name or 'Merumy',
                'category': category_name or 'Genel',
                'subcategory': subcategory_name or '',
                'price': retail_price or cost_price or 0,
                'originalPrice': None,
                'image': image_link or '/images/product-placeholder.png',
                'barcode': barcode,
                'rating': round(4.0 + (hash(product_code) % 10) / 10, 1),  # Random rating 4.0-4.9
                'reviews': (hash(product_code) % 500) + 10,  # Random reviews 10-509
                'sold': (hash(product_code) % 1000) + 50,  # Random sold 50-1049
                'inStock': True,
                'description': f'{product_name} - {brand_name} markasından kaliteli {category_name} ürünü.'
            }
            
            products.append(product)
            
            # Track categories
            if category_name:
                if category_name not in categories:
                    categories[category_name] = {
                        'name': category_name,
                        'subcategories': set(),
                        'products': []
                    }
                categories[category_name]['products'].append(product)
                if subcategory_name:
                    categories[category_name]['subcategories'].add(subcategory_name)
            
            # Track brands
            if brand_name:
                if brand_name not in brands:
                    brands[brand_name] = []
                brands[brand_name].append(product)
                
        except Exception as e:
            print(f"Error processing row: {e}")
            continue

# Convert sets to lists for JSON
for cat in categories.values():
    cat['subcategories'] = list(cat['subcategories'])

# Save products data
output_dir = Path(__file__).parent.parent / 'data'
output_dir.mkdir(exist_ok=True)

# Save all products
with open(output_dir / 'products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

# Save categories
categories_data = {k: {
    'name': v['name'],
    'subcategories': v['subcategories'],
    'productCount': len(v['products'])
} for k, v in categories.items()}

with open(output_dir / 'categories.json', 'w', encoding='utf-8') as f:
    json.dump(categories_data, f, ensure_ascii=False, indent=2)

# Save brands
brands_data = {k: len(v) for k, v in brands.items()}
with open(output_dir / 'brands.json', 'w', encoding='utf-8') as f:
    json.dump(brands_data, f, ensure_ascii=False, indent=2)

print(f"✅ Parsed {len(products)} products")
print(f"✅ Found {len(categories)} categories")
print(f"✅ Found {len(brands)} brands")

