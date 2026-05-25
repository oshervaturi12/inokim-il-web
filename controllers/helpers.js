exports.formatter = new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });


  exports.extractYouTubeId = function(url) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }


   exports.generateSeoData = (product) => {
    if (!product || !product.name || !product.title) {
      throw new Error("Invalid product data for SEO generation");
    }
  
    const baseUrl = "https://yourdomain.com";
    const productUrl = `${baseUrl}/products/${encodeURIComponent(product.name.replace(/\s+/g, "-").toLowerCase())}`;
    
    // Extract variant info
    const variantNames = product.variants.map(v => v.subModel).join(", ");
    const availabilityText = product.variants.map(v => `${v.subModel}: ${v.availability}`).join("; ");
    
    // Description combining product title & variants
    const metaDescription = `${product.title} - ${product.overviewSubtitle}. דגמים זמינים: ${variantNames}. זמינות: ${availabilityText}.`;
  
    // JSON-LD structured data (Rich Snippet)
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.title,
      "image": `${baseUrl}${product.overviewImage}`,
      "brand": {
        "@type": "Brand",
        "name": "Inokim"
      },
      "offers": product.variants.map(variant => ({
        "@type": "Offer",
        "priceCurrency": "ILS",
        "availability": "https://schema.org/InStock",
        "price": variant.colors?.[0]?.price || "N/A",
        "url": productUrl,
        "itemCondition": "https://schema.org/NewCondition"
      }))
    };
  
    return {
      pageTitle: `${product.name} - קורקינט חשמלי איכותי | INOKIM`,
      metaDescription,
      urlHandle: `/products/${encodeURIComponent(product.name.replace(/\s+/g, "-").toLowerCase())}`,
      canonicalUrl: productUrl,
      ogTitle: product.title,
      ogDescription: metaDescription,
      ogImage: `${baseUrl}${product.overviewImage}`,
      twitterTitle: product.title,
      twitterDescription: metaDescription,
      twitterImage: `${baseUrl}${product.overviewImage}`,
      jsonLd,
      noIndex: false
    };
  };
  

  