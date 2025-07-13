const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Al-Hidaya Translation Files...\n');

const localesDir = path.join(__dirname, '../public/locales');

// Check if locales directory exists
if (!fs.existsSync(localesDir)) {
  console.error('❌ Locales directory not found at:', localesDir);
  process.exit(1);
}

console.log('✅ Locales directory found at:', localesDir);

// List all language directories
const languages = fs.readdirSync(localesDir).filter(file => {
  return fs.statSync(path.join(localesDir, file)).isDirectory();
});

console.log(`\n📁 Found ${languages.length} language directories:`, languages.slice(0, 10).join(', '), '...\n');

// Check specific important languages
const importantLangs = ['en', 'fr', 'ar', 'es', 'de'];
const namespaces = ['common', 'navigation', 'quran', 'hadith', 'prayer', 'prayers', 'calendar', 'zakat', 'settings'];

importantLangs.forEach(lang => {
  console.log(`\n🌐 Checking ${lang}:`);
  
  const langDir = path.join(localesDir, lang);
  if (!fs.existsSync(langDir)) {
    console.error(`  ❌ Language directory not found`);
    return;
  }
  
  console.log(`  ✅ Language directory exists`);
  
  // Check each namespace
  namespaces.forEach(ns => {
    const filePath = path.join(langDir, `${ns}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);
        const keys = Object.keys(json).length;
        
        // Check if it's still using placeholder values
        const hasPlaceholders = content.includes(`[${lang}]`);
        
        console.log(`  ✅ ${ns}.json - ${keys} keys ${hasPlaceholders ? '⚠️  (has placeholders)' : '✨'}`);
        
        // For common.json, check specific keys
        if (ns === 'common') {
          const requiredKeys = ['app.name', 'navigation.home', 'auth.signIn'];
          requiredKeys.forEach(key => {
            const value = key.split('.').reduce((obj, k) => obj?.[k], json);
            if (value) {
              console.log(`     - ${key}: "${value}"`);
            } else {
              console.log(`     ❌ Missing key: ${key}`);
            }
          });
        }
      } catch (error) {
        console.error(`  ❌ ${ns}.json - Invalid JSON:`, error.message);
      }
    } else {
      console.log(`  ⚠️  ${ns}.json - File missing`);
    }
  });
});

// Check if translation files are accessible via HTTP
console.log('\n\n🌐 HTTP Accessibility Test:');
console.log('To test HTTP access, start your dev server and visit:');
console.log('- http://localhost:3000/locales/en/common.json');
console.log('- http://localhost:3000/locales/fr/common.json');
console.log('- http://localhost:3000/locales/ar/common.json');

console.log('\n✨ Translation check complete!');