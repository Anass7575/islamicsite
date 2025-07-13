const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Crée un SVG simple avec croissant islamique
const svgIcon = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#10B981"/>
  <g transform="translate(256,256)">
    <path d="M -50,-100 A 100,100 0 1,1 -50,100 A 80,80 0 1,0 -50,-100" 
          fill="white" transform="rotate(-20)"/>
    <circle cx="70" cy="-20" r="25" fill="white"/>
  </g>
</svg>
`;

// Génère les icônes
async function generateIcons() {
  const sizes = [192, 384, 512, 96];
  
  console.log('🎨 Génération des icônes PWA...\n');
  
  for (const size of sizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '..', 'public', `icon-${size}x${size}.png`));
    console.log(`✅ icon-${size}x${size}.png`);
  }
  
  // Apple touch icon
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'));
  console.log('✅ apple-touch-icon.png');
    
  // Favicon PNG
  await sharp(Buffer.from(svgIcon))
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon.png'));
  console.log('✅ favicon.png');
  
  // Favicon ICO (16x16)
  await sharp(Buffer.from(svgIcon))
    .resize(16, 16)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon-16.png'));
    
  console.log('\n✨ Toutes les icônes ont été générées avec succès!');
}

generateIcons().catch(err => {
  console.error('❌ Erreur lors de la génération des icônes:', err);
  process.exit(1);
});