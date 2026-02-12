const fs = require('fs');
const path = require('path');

// Read products.json
const productsPath = path.join(__dirname, '../app/data/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Get all image directories
const imagesDir = path.join(__dirname, '../public/urun-gorselleri');
const imageDirs = fs.readdirSync(imagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`Found ${products.length} products`);
console.log(`Found ${imageDirs.length} image directories`);

// Function to normalize text for matching
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[–—]/g, '-') // Replace em/en dashes with regular dash
    .replace(/[^\w\s-]/g, ' ') // Replace special chars with space (keep dashes)
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/\s*-\s*/g, ' ') // Normalize dashes to spaces
    .trim();
}

// Calculate similarity score between two strings
function calculateSimilarity(str1, str2) {
  const words1 = str1.split(' ').filter(w => w.length > 1);
  const words2 = str2.split(' ').filter(w => w.length > 1);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Check if one contains the other (exact or near exact match)
  if (str1.includes(str2) || str2.includes(str1)) {
    return 0.95;
  }
  
  // Check if significant portion matches
  const minLen = Math.min(str1.length, str2.length);
  const maxLen = Math.max(str1.length, str2.length);
  if (minLen > 10 && maxLen / minLen < 1.5) {
    // Check character overlap
    let commonChars = 0;
    const shorter = str1.length < str2.length ? str1 : str2;
    const longer = str1.length >= str2.length ? str1 : str2;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) commonChars++;
    }
    if (commonChars / shorter.length > 0.7) {
      return 0.85;
    }
  }
  
  // Count matching words (more flexible)
  let matches = 0;
  let totalWords = Math.max(words1.length, words2.length);
  
  for (const word1 of words1) {
    if (word1.length < 2) continue;
    for (const word2 of words2) {
      if (word2.length < 2) continue;
      // Exact match
      if (word1 === word2) {
        matches += 2;
        break;
      }
      // One contains the other
      if (word1.includes(word2) || word2.includes(word1)) {
        matches += 1.5;
        break;
      }
      // Similar words (fuzzy match for short words)
      if (word1.length > 3 && word2.length > 3) {
        const similarity = wordSimilarity(word1, word2);
        if (similarity > 0.7) {
          matches += similarity;
          break;
        }
      }
    }
  }
  
  return matches / totalWords;
}

// Simple word similarity (Levenshtein-like)
function wordSimilarity(w1, w2) {
  if (w1 === w2) return 1;
  if (w1.includes(w2) || w2.includes(w1)) return 0.8;
  
  // Check if they share significant characters
  const chars1 = w1.split('').filter(c => c.match(/[a-z0-9]/));
  const chars2 = w2.split('').filter(c => c.match(/[a-z0-9]/));
  let common = 0;
  for (const c of chars1) {
    if (chars2.includes(c)) common++;
  }
  return common / Math.max(chars1.length, chars2.length);
}

// Function to find best matching image directory
function findMatchingImage(productName, brand) {
  const normalizedProduct = normalizeName(productName);
  const normalizedBrand = normalizeName(brand);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const imgDir of imageDirs) {
    const normalizedImgDir = normalizeName(imgDir);
    
    // Calculate similarity scores
    const productScore = calculateSimilarity(normalizedProduct, normalizedImgDir);
    const brandScore = normalizedImgDir.includes(normalizedBrand) ? 0.3 : 0;
    
    // Remove brand from product name for better matching
    const productWithoutBrand = normalizedProduct.replace(normalizedBrand, '').trim();
    const productWithoutBrandScore = calculateSimilarity(productWithoutBrand, normalizedImgDir);
    
    const totalScore = Math.max(productScore, productWithoutBrandScore) + brandScore;
    
    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMatch = imgDir;
    }
  }
  
  // Only return match if score is above threshold (lowered for better matching)
  if (bestScore >= 0.25 && bestMatch) {
    const imgPath = path.join(imagesDir, bestMatch);
    const files = fs.readdirSync(imgPath);
    const imageFile = files.find(f => /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(f));
    
    if (imageFile) {
      return {
        path: `/urun-gorselleri/${bestMatch}/${imageFile}`,
        score: bestScore
      };
    }
  }
  
  return null;
}

// Update products with matching images
let updatedCount = 0;
let notMatched = [];

for (const product of products) {
  // Try to match all products, but prioritize updating placeholders
  const isPlaceholder = product.image === '/images/product-placeholder.png' || 
                        product.image.includes('product-placeholder');
  
  const match = findMatchingImage(product.name, product.brand);
  if (match) {
    // Only update if it's a placeholder or if the match score is very high
    if (isPlaceholder || match.score > 0.7) {
      product.image = match.path;
      updatedCount++;
      if (updatedCount % 100 === 0) {
        console.log(`Updated ${updatedCount} products...`);
      }
    }
  } else if (isPlaceholder) {
    // Only track unmatched products that are placeholders
    notMatched.push({
      id: product.id,
      name: product.name,
      brand: product.brand
    });
  }
}

// Write updated products.json
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');

console.log(`\n✅ Updated ${updatedCount} products with matching images.`);
console.log(`❌ Could not match ${notMatched.length} products.`);

// Save unmatched products to a file for review
if (notMatched.length > 0) {
  const unmatchedPath = path.join(__dirname, '../unmatched-products.json');
  fs.writeFileSync(unmatchedPath, JSON.stringify(notMatched, null, 2), 'utf8');
  console.log(`📝 Unmatched products saved to: unmatched-products.json`);
}
