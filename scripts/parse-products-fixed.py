#!/usr/bin/env python3
import csv
import json
from pathlib import Path

def parse_price(price_str):
    """Parse price string to float"""
    if not price_str or price_str.strip() == '':
        return None
    # Remove currency symbols and spaces, replace comma with dot
    price_str = str(price_str).strip().replace('TRY', '').replace(',', '.').replace('"', '').replace('₺', '').strip()
    try:
        return float(price_str)
    except:
        return None

def clean_text(text):
    """Clean text from extra spaces and newlines"""
    if not text:
        return ''
    return ' '.join(str(text).split())

# Read CSV file
csv_path = Path('/Users/huseyinkulekci/Downloads/Merumy Ürün Kartı Şablonu - Ürün Kartı.csv')
products = []
categories = {}
brands = {}

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    
    # Skip first two header rows
    next(reader)  # Skip first header
    next(reader)  # Skip second header
    
    row_num = 2
    for row in reader:
        row_num += 1
        if len(row) < 20:
            if row_num <= 5:
                print(f"Row {row_num} too short: {len(row)} columns")
            continue
            
        try:
            product_code = row[0].strip() if len(row) > 0 and row[0] else ''
            product_name = clean_text(row[1]) if len(row) > 1 and row[1] else ''
            
            if not product_code or not product_name or product_code == '' or product_code.startswith(','):
                if row_num <= 5:
                    print(f"Row {row_num} skipped: code='{product_code}', name='{product_name[:30]}'")
                continue
            
            # Correct column indices based on CSV structure:
            # 0: UrunKodu, 1: UrunAdi, 5: Barkod, 14: Marka name, 
            # 16: Kategori name, 18: Alt Kategori name,
            # 20: MaliyetFiyati, 23: Görsel Linki
            brand_name = clean_text(row[14]) if len(row) > 14 and row[14] else 'Merumy'
            category_name = clean_text(row[16]) if len(row) > 16 and row[16] else 'Genel'
            subcategory_name = clean_text(row[18]) if len(row) > 18 and row[18] else ''
            cost_price = parse_price(row[20]) if len(row) > 20 else None
            retail_price = parse_price(row[22]) if len(row) > 22 else None  # PerakendeSatisFiyati
            image_link = row[23].strip() if len(row) > 23 else ''
            barcode = row[5].strip() if len(row) > 5 else ''
            
            # Use retail price, fallback to cost price
            final_price = retail_price or cost_price or 0
            
            # Generate slug from product name
            slug = product_name.lower().replace(' ', '-').replace('--', '-')
            slug = ''.join(c for c in slug if c.isalnum() or c == '-')[:50]
            slug = f"{product_code}-{slug}"
            
            # Create product object
            product = {
                'id': product_code,
                'code': product_code,
                'slug': slug,
                'name': product_name,
                'brand': brand_name or 'Merumy',
                'category': category_name or 'Genel',
                'subcategory': subcategory_name or '',
                'price': final_price,
                'originalPrice': None,
                'image': image_link or '/images/product-placeholder.png',
                'barcode': barcode,
                'rating': round(4.0 + (abs(hash(product_code)) % 10) / 10, 1),
                'reviews': (abs(hash(product_code)) % 500) + 10,
                'sold': (abs(hash(product_code)) % 1000) + 50,
                'inStock': True,
                'description': f'{product_name} - {brand_name} markasından kaliteli {category_name} ürünü.'
            }
            
            products.append(product)
            
            # Track categories
            if category_name and category_name != 'Genel':
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
            if brand_name and brand_name != 'Merumy':
                if brand_name not in brands:
                    brands[brand_name] = []
                brands[brand_name].append(product)
                
        except Exception as e:
            print(f"Error processing row {row_num}: {e}")
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
print(f"\nTop categories:")
for cat_name, cat_data in sorted(categories_data.items(), key=lambda x: x[1]['productCount'], reverse=True)[:10]:
    print(f"  - {cat_name}: {cat_data['productCount']} products")

