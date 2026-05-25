const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputFolder = path.join(__dirname, '../public/test');
const outputFolder = path.join(__dirname, '../public/test/paletteOptimized');

const supportedExtensions = ['.jpg', '.jpeg', '.png'];

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

const optimizeImage = async (file) => {
  const filePath = path.join(inputFolder, file);
  const fileName = path.parse(file).name;

  const webpOutput = path.join(outputFolder, `${fileName}.webp`);
  const avifOutput = path.join(outputFolder, `${fileName}.avif`);

  try {
    // Convert to WebP
    await sharp(filePath)
      .toFormat('webp')
      .toFile(webpOutput);

    // Convert to AVIF
    await sharp(filePath)
      .toFormat('avif')
      .toFile(avifOutput);

    console.log(`✅ Optimized: ${file}`);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error);
  }
};

fs.readdir(inputFolder, (err, files) => {
  if (err) return console.error('❌ Failed to read directory:', err);

  const imageFiles = files.filter(file =>
    supportedExtensions.includes(path.extname(file).toLowerCase())
  );

  if (imageFiles.length === 0) {
    return console.log('⚠️ No supported images found.');
  }

  imageFiles.forEach(file => optimizeImage(file));
});
