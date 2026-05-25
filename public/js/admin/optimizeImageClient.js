export function optimizeImageClient(src, alt = '', width = 40, height = 40) {
    const baseName = src.split('/').pop().split('.')[0]; // e.g. INSCOX010308
    const isBlog = src.includes('/blog/');
    const basePath = isBlog ? '/optimized/blog' : '/optimized';
  
    const avifSrc = `${basePath}/${baseName}.avif`;
    const webpSrc = `${basePath}/${baseName}.webp`;
    const lqipSrc = `${basePath}/lqip/${baseName}.jpg`;
  
    return `
      <picture class="progressive-image" style="width:${width}px; height:${height}px;">
        <source srcset="${avifSrc}" type="image/avif">
        <source srcset="${webpSrc}" type="image/webp">
        <img 
          src="${lqipSrc}" 
          data-src="${src}" 
          alt="${alt}" 
          width="${width}" 
          height="${height}"
          class="lazyload"
          loading="lazy"
          style="object-fit:cover; border-radius:4px;"
        />
      </picture>
    `;
  }
  