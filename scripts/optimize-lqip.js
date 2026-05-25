const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputFolder = path.join(__dirname, '../public/img');
const outputFolder = path.join(__dirname, '../public/optimized/lqip');

const supportedExtensions = ['.jpg', '.jpeg', '.png'];

// Create output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

const generateLQIP = async (file) => {
  const inputPath = path.join(inputFolder, file);
  const baseName = path.parse(file).name;
  const outputPath = path.join(outputFolder, `${baseName}.jpg`);

  try {
    await sharp(inputPath)
      .resize({ width: 20 }) // Tiny width
      .jpeg({ quality: 30 }) // Compressed JPEG
      .toFile(outputPath);

    console.log(`✅ LQIP generated: ${baseName}.jpg`);
  } catch (err) {
    console.error(`❌ Error generating LQIP for ${file}:`, err.message);
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

  imageFiles.forEach(file => generateLQIP(file));
});
