// utils/abTestUtils.js
function assignVariant(variants) {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const rand = Math.random() * totalWeight;

  console.log(`🎯 Random: ${rand.toFixed(2)} / Total: ${totalWeight}`);
  let current = 0;

  for (const variant of variants) {
    current += variant.weight;
    console.log(`🔍 Checking variant ${variant.name} (weight: ${variant.weight}, cumulative: ${current})`);
    if (rand <= current) {
      console.log(`✅ Assigned variant: ${variant.name}`);
      return variant;
    }
  }

  console.warn(`⚠️ Fallback used — returning last variant`);
  return variants[variants.length - 1];
}



  
  module.exports = { assignVariant };
  