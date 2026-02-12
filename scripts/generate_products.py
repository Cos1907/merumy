#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import csv
import json
import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
CSV_PATH = BASE_DIR / "public" / "markalar" / "urunler.csv"
OUTPUT_PATH = BASE_DIR / "app" / "data" / "products.json"
YENI_GORSELLER_DIR = BASE_DIR / "public" / "yeniurungorselleri"
BARKODLU_DIR = BASE_DIR / "public" / "barkodlurunler"
DEFAULT_IMAGE = "/gorselsizurun.jpg"

def slugify(text):
    """Türkçe karakterleri dönüştür ve slug oluştur"""
    text = text.lower().strip()
    replacements = {
        'ı': 'i', 'İ': 'i', 'ş': 's', 'Ş': 's',
        'ğ': 'g', 'Ğ': 'g', 'ü': 'u', 'Ü': 'u',
        'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c'
    }
    for tr, en in replacements.items():
        text = text.replace(tr, en)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def parse_price(price_str):
    """Fiyat stringini sayıya çevir"""
    if not price_str:
        return 0
    price_str = price_str.replace(',', '').replace('.', '').strip()
    try:
        return int(float(price_str) / 100)  # 16,499.00 -> 16499
    except:
        return 0

def find_image_for_barcode(barcode, row_num):
    """Barkoda göre görsel bul"""
    # İlk 249 satır için yeniurungorselleri klasörüne bak
    if row_num <= 249:
        for ext in ['.jpg', '.jpeg', '.png', '.webp']:
            img_path = YENI_GORSELLER_DIR / f"{barcode}{ext}"
            if img_path.exists():
                return f"/yeniurungorselleri/{barcode}{ext}"
    
    # 250+ satır için barkodlurunler klasörüne bak
    if BARKODLU_DIR.exists():
        for folder in BARKODLU_DIR.iterdir():
            if folder.is_dir() and folder.name.startswith(barcode):
                # Klasör içindeki ilk görseli bul
                for img_file in folder.iterdir():
                    if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp', '.avif']:
                        return f"/barkodlurunler/{folder.name}/{img_file.name}"
    
    return DEFAULT_IMAGE

def get_category_mapping(category_str):
    """CSV kategori adını site kategorisine eşle"""
    category_map = {
        'Cilt Bakımı': 'cilt-bakimi',
        'Makyaj': 'makyaj',
        'Saç Bakımı': 'sac-bakimi',
        'Kişisel Bakım': 'kisisel-bakim',
        'Mask Bar': 'mask-bar',
        'Bebek ve Çocuk Bakımı': 'bebek-ve-cocuk-bakimi'
    }
    return category_map.get(category_str, 'cilt-bakimi')

def main():
    products = []
    
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row_num, row in enumerate(reader, start=2):  # 2'den başla (header 1. satır)
            barcode = row.get('Barkod', '').strip()
            if not barcode:
                continue
            
            brand = row.get('Marka', '').strip()
            name = row.get('UrunAdi', '').strip()
            category = row.get('Kategori', '').strip()
            kore_trend = row.get('Kore Trendleri', '').strip()
            
            # Fiyatları parse et
            original_price_str = row.get('psf', '0')
            discount_price_str = row.get('indirimli fiyat', '0')
            stock_str = row.get('Stok', '0')
            
            # Fiyatları temizle
            original_price = parse_price(original_price_str)
            discount_price = parse_price(discount_price_str)
            
            try:
                stock = int(stock_str) if stock_str else 0
            except:
                stock = 0
            
            # Görsel bul
            image = find_image_for_barcode(barcode, row_num)
            
            # Slug oluştur
            product_id = str(row_num - 1).zfill(5)
            slug = f"{product_id}-{slugify(name)}"[:80]
            
            product = {
                "id": product_id,
                "barcode": barcode,
                "name": name,
                "brand": brand,
                "category": get_category_mapping(category),
                "categoryDisplay": category,
                "price": discount_price if discount_price > 0 else original_price,
                "originalPrice": original_price if original_price > discount_price else None,
                "image": image,
                "slug": slug,
                "inStock": stock > 0,
                "stock": stock,
                "isKoreTrend": kore_trend.lower() == 'kore trendleri',
                "description": f"{brand} - {name}"
            }
            
            products.append(product)
    
    # JSON olarak kaydet
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    print(f"Toplam {len(products)} ürün oluşturuldu.")
    print(f"Kore Trendleri: {sum(1 for p in products if p['isKoreTrend'])}")
    print(f"Stokta: {sum(1 for p in products if p['inStock'])}")

if __name__ == "__main__":
    main()

