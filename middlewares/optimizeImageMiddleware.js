// const path = require('path');

// module.exports = (req, res, next) => {
//   res.locals.optimizeImage = (src, alt = '', className = '', sizes = '100vw') => {
//     const baseName = path.basename(src, path.extname(src));
//     const avifSrc = `/optimized/${baseName}.avif`;
//     const webpSrc = `/optimized/${baseName}.webp`;

//     console.log(src)
//     return `
//       <picture class="${className}">
//         <source srcset="${avifSrc}" type="image/avif" sizes="${sizes}">
//         <source srcset="${webpSrc}" type="image/webp" sizes="${sizes}">
//         <img src="${src}" alt="${alt}" loading="lazy">
//       </picture>
//     `;
//   };
//   next();
// };


// const path = require('path');
// const fs = require('fs');


// module.exports = (req, res, next) => {
//   res.locals.optimizeImage = (src, alt = '', className = '', sizes = '100vw') => {
//     const baseName = path.basename(src, path.extname(src)); // e.g. blog-image
//     const ext = path.extname(src); // e.g. .jpg

//     const isBlog = src.includes('/blog/');
//     const optimizedBaseUrl = isBlog ? `/optimized/blog` : `/optimized`;
//     const optimizedBasePath = path.join(__dirname, '..', 'public', isBlog ? 'optimized/blog' : 'optimized');

//     const avifSrc = `${optimizedBaseUrl}/${baseName}.avif`;
//     const webpSrc = `${optimizedBaseUrl}/${baseName}.webp`;
//     const lqipSrc = `${optimizedBaseUrl}/lqip/${baseName}.jpg`;

//     const avifPath = path.join(optimizedBasePath, `${baseName}.avif`);
//     const webpPath = path.join(optimizedBasePath, `${baseName}.webp`);
//     const lqipPath = path.join(optimizedBasePath, 'lqip', `${baseName}.jpg`);

//     const avifExists = fs.existsSync(avifPath);
//     const webpExists = fs.existsSync(webpPath);
//     const lqipExists = fs.existsSync(lqipPath);

//     let sources = '';
//     if (avifExists) {
//       sources += `<source srcset="${avifSrc}" type="image/avif" sizes="${sizes}">\n`;
//     }
//     if (webpExists) {
//       sources += `<source srcset="${webpSrc}" type="image/webp" sizes="${sizes}">\n`;
//     }

//     return `
//       <picture class="${className} progressive-image">
//         ${sources}
//         <img 
//           src="${lqipExists ? lqipSrc : src}" 
//           data-src="${src}" 
//           alt="${alt}" 
//           loading="lazy" 
//           class="lazyload"
//         >
//       </picture>
//     `;
//   };

//   next();
// };



// const path = require('path');

// module.exports = (req, res, next) => {
//   const S3_BASE_URL = 'https://inokim-web.s3.us-east-1.amazonaws.com';

//   res.locals.optimizeImage = (
//     src,
//     alt = '',
//     className = '',
//     sizes = '100vw'
//   ) => {
//     const baseName = path.basename(src, path.extname(src)); // e.g. inokim-map
//     const ext = path.extname(src); // e.g. .webp
//     const folder = src.includes('/blog/') ? 'uploads/optimized/blog' : 'uploads/optimized';

//     const avifSrc = `${S3_BASE_URL}/${folder}/${baseName}.avif`;
//     const webpSrc = `${S3_BASE_URL}/${folder}/${baseName}.webp`;
//     const lqipSrc = `${S3_BASE_URL}/${folder}/lqip/${baseName}.jpg`;

//     return `
//       <picture class="${className} progressive-image">
//         <source srcset="${avifSrc}" type="image/avif" sizes="${sizes}">
//         <source srcset="${webpSrc}" type="image/webp" sizes="${sizes}">
//         <img 
//           src="${lqipSrc}" 
//           data-src="${src.startsWith('http') ? src : `${S3_BASE_URL}${src}`}" 
//           alt="${alt}" 
//           loading="lazy" 
//           class="lazyload"
//         >
//       </picture>
//     `;
//   };

//   next();
// };


// const path = require('path');

// module.exports = (req, res, next) => {
//   const S3_BASE_URL = 'https://inokim-web.s3.us-east-1.amazonaws.com';

//   res.locals.optimizeImage = (
//     src,
//     alt = '',
//     className = '',
//     sizes = '100vw'
//   ) => {
//     const ext = path.extname(src); // Get file extension
//     const baseName = path.basename(src, ext);

//     // 🛑 Skip optimization for SVGs
//     if (ext === '.svg') {
//       return `<img src="${src.startsWith('http') ? src : `${S3_BASE_URL}${src}`}" alt="${alt}" class="${className}" loading="lazy">`;
//     }

//     const folder = src.includes('/blog/') ? 'uploads/optimized/blog' : 'uploads/optimized';

//     const avifSrc = `${S3_BASE_URL}/${folder}/${baseName}.avif`;
//     const webpSrc = `${S3_BASE_URL}/${folder}/${baseName}.webp`;
//     const lqipSrc = `${S3_BASE_URL}/${folder}/lqip/${baseName}.jpg`;

//     return `
//       <picture class="${className} progressive-image">
//         <source srcset="${avifSrc}" type="image/avif" sizes="${sizes}">
//         <source srcset="${webpSrc}" type="image/webp" sizes="${sizes}">
//         <img 
//           src="${lqipSrc}" 
//           data-src="${src.startsWith('http') ? src : `${S3_BASE_URL}${src}`}" 
//           alt="${alt}" 
//           loading="lazy" 
//           class="lazyload"
//         >
//       </picture>
//     `;
//   };

//   next();
// };


const path = require('path');

module.exports = (req, res, next) => {
  const S3_BASE_URL = 'https://d3kxrpm9y5cv3a.cloudfront.net';

  res.locals.optimizeImage = (
    src,
    alt = '',
    className = '',
    sizes = '100vw'
  ) => {
    if (!src || typeof src !== 'string') return '';

    const ext = path.extname(src).toLowerCase(); // e.g. .jpg
    const baseName = path.basename(src, ext);
    const isSVG = ext === '.svg';

    // Clean base name (in case it contains spaces or special characters)
    const encodedBaseName = encodeURIComponent(baseName);

    const isAbsoluteS3 = src.startsWith(S3_BASE_URL);
    const relativePath = isAbsoluteS3 ? src.replace(S3_BASE_URL, '') : src;

    const folder = relativePath.includes('/blog/')
      ? 'optimized/blog'
      : 'optimized';

    const avifSrc = `${S3_BASE_URL}/${folder}/${encodedBaseName}.avif`;
    const webpSrc = `${S3_BASE_URL}/${folder}/${encodedBaseName}.webp`;
    const lqipSrc = `${S3_BASE_URL}/${folder}/lqip/${encodedBaseName}.jpg`;
    const fullImageSrc = `${S3_BASE_URL}${encodeURI(relativePath)}`;

    // Return raw img for SVGs
    if (isSVG) {
      return `<img src="${fullImageSrc}" alt="${alt}" class="${className}" loading="lazy">`;
    }

    // Return <picture> for optimized formats
    return `
      <picture class="${className} progressive-image">
        <source srcset="${avifSrc}" type="image/avif" sizes="${sizes}">
        <source srcset="${webpSrc}" type="image/webp" sizes="${sizes}">
        <img 
          src="${lqipSrc}" 
          data-src="${fullImageSrc}" 
          alt="${alt}" 
          loading="lazy" 
          class="lazyload"
        >
      </picture>
    `;
  };

  next();
};


// const path = require('path');

// module.exports = (req, res, next) => {
//   const S3_BASE_URL = 'https://d3kxrpm9y5cv3a.cloudfront.net';

//   res.locals.optimizeImage = (
//     src,
//     alt = '',
//     className = '',
//     sizes = '100vw'
//   ) => {
//     if (!src || typeof src !== 'string') return '';

//     const ext = path.extname(src).toLowerCase();
//     const isSVG = ext === '.svg';

//     // Full URL (either already CloudFront or S3)
//     const isFullUrl = src.startsWith('http');
//     const isOptimized = src.includes('/optimized/') || src.includes('/uploads/optimized');

//     const baseName = path.basename(src, ext);
//     const encodedBaseName = encodeURIComponent(baseName);
//     const folder = src.includes('/blog/') ? 'optimized/blog' : 'optimized';

//     const avifSrc = `${S3_BASE_URL}/${folder}/${encodedBaseName}.avif`;
//     const webpSrc = `${S3_BASE_URL}/${folder}/${encodedBaseName}.webp`;
//     const lqipSrc = `${S3_BASE_URL}/${folder}/lqip/${encodedBaseName}.jpg`;
//     const fallbackSrc = isFullUrl ? src : `${S3_BASE_URL}${src}`;

//     // For SVGs, just return a clean <img>
//     if (isSVG) {
//       return `<img src="${fallbackSrc}" alt="${alt}" class="${className}" loading="lazy">`;
//     }

//     // If already optimized image (e.g., ends in .webp/.avif), skip building new paths
//     if (ext === '.webp' || ext === '.avif') {
//       return `
//         <picture class="${className} progressive-image">
//           <source srcset="${fallbackSrc}" type="image/${ext.replace('.', '')}" sizes="${sizes}">
//           <img src="${fallbackSrc}" alt="${alt}" loading="lazy" class="lazyload">
//         </picture>
//       `;
//     }

//     // Final picture with dynamic formats
//     return `
//       <picture class="${className} progressive-image">
//         <source srcset="${avifSrc}" type="image/avif" sizes="${sizes}">
//         <source srcset="${webpSrc}" type="image/webp" sizes="${sizes}">
//         <img 
//           src="${lqipSrc}" 
//           data-src="${fallbackSrc}" 
//           alt="${alt}" 
//           loading="lazy" 
//           class="lazyload"
//         >
//       </picture>
//     `;
//   };

//   next();
// };
