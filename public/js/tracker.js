// import axios from 'axios';

// let maxScroll = 0;
// let startTime = Date.now();
// const sessionId = document.cookie.match(/connect.sid=([^;]+)/)?.[1] || null;
// const isProductPage = window.location.pathname.startsWith('/products/');
// const isCheckoutPage = window.location.pathname.startsWith('/checkout');
// const isThankYouPage = window.location.pathname.startsWith('/thank-you');


// const sendEvent = async (type, details = {}) => {
//   try {
//     await axios.post('/api/v1/tracker', {
//       sessionId,  // Include session ID
//       action: {
//         type,
//         pageUrl: window.location.href,
//         timestamp: new Date(),
//         ...details,
//       },
//     });
//   } catch (err) {
//     console.error('❌ Tracker Error:', err);
//   }
// };

// if (isCheckoutPage) {
//   sendEvent('checkout_start');
// }

// if (isThankYouPage) {
//   sendEvent('conversion');
// }

// //  Product View Tracking
// if (isProductPage) {
//   const slug = window.location.pathname.split('/products/')[1]?.split('/')[0];
//   sendEvent('product_view', { productSlug: slug });
// } else if (!isCheckoutPage && !isThankYouPage) {
//   sendEvent('page_view', { referrer: document.referrer, title: document.title });
// }

// //  A/B Test Action Tracking
// export const logABTestAction = (testName, variant) => {
//   sendEvent('ab_test_action', {
//     abTestName: testName,
//     abTestVariant: variant,
//   });
// };


// // Scroll Depth Tracking
// window.addEventListener('scroll', () => {
//   const scrolled = Math.round(((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100);
//   if (scrolled > maxScroll) maxScroll = scrolled;
// });

// //  Track Checkout Abandonment
// window.addEventListener('beforeunload', () => {
//   const timeSpent = (Date.now() - startTime) / 1000;
  
//   // ✅ If user leaves checkout without reaching "thank-you"
//   if (isCheckoutPage && !document.referrer.includes('/thank-you')) {
//     sendEvent('checkout_abandonment', { timeSpent });
//   }

//   sendEvent('time_spent', { timeSpent });
//   sendEvent('scroll_depth', { scrollDepth: maxScroll });
// });

// // ✅ Button and Link Click Tracking
// document.addEventListener('click', (e) => {
//   const target = e.target.closest('button, a');
//   if (target) {
//     sendEvent('button_click', {
//       buttonId: target.id || null,
//       buttonText: target.innerText.trim(),
//       classes: target.className,
//     });
//   }
// });

// // ✅ Form Submission Tracking
// document.addEventListener('submit', (e) => {
//   const form = e.target;
//   sendEvent('form_submit', {
//     formId: form.id || null,
//     formAction: form.action,
//     classes: form.className,
//   });
// });

// // ✅ Unified beforeunload to send both time_spent and scroll_depth
// window.addEventListener('beforeunload', () => {
//   const timeSpent = (Date.now() - startTime) / 1000;

//   navigator.sendBeacon(
//     '/api/v1/tracker',
//     JSON.stringify({
//       action: {
//         type: 'time_spent',
//         pageUrl: window.location.href,
//         timestamp: new Date(),
//         timeSpent,
//       },
//     })
//   );
//   navigator.sendBeacon(
//     '/api/v1/tracker',
//     JSON.stringify({
//       action: {
//         type: 'scroll_depth',
//         pageUrl: window.location.href,
//         timestamp: new Date(),
//         scrollDepth: maxScroll,
//       },
//     })
//   );
// });



//  const trackABTestImpression = (key, variantName) => {
//   if (!key || !variantName) return;

//   axios.post('/api/v1/ab-test/impression', { key, variantName })
//     .then(() => {
//       console.log(`👁️ Tracked A/B impression: ${key} → ${variantName}`);
//     })
//     .catch(err => {
//       console.warn(`❌ Failed to track impression for ${key}:`, err);
//     });
// };

//  const trackABTestClick = (key, variantName) => {
//   if (!key || !variantName) return;

//   axios.post('/api/v1/ab-test/click', { key, variantName })
//     .then(() => {
//       console.log(`🖱️ Tracked A/B click: ${key} → ${variantName}`);
//     })
//     .catch(err => {
//       console.warn(`❌ Failed to track click for ${key}:`, err);
//     });
// };

// const trackABTestConversion = (key, variantName) => {
//   if (!key || !variantName) return;

//   axios.post('/api/v1/ab-test/conversion', { key, variantName })
//     .then(() => {
//       console.log(`💰 Tracked A/B conversion: ${key} → ${variantName}`);
//     })
//     .catch(err => {
//       console.warn(`❌ Failed to track conversion for ${key}:`, err);
//     });
// };

// // Auto-track impressions on page load
// window.addEventListener('DOMContentLoaded', () => {
//   if (window.AB_TESTS && typeof window.AB_TESTS === 'object') {
//     console.log('📊 Auto-tracking A/B tests:', window.AB_TESTS);

//     Object.entries(window.AB_TESTS).forEach(([key, variant]) => {
//       trackABTestImpression(key, variant?.name);
//     });
//   }

//   // Track clicks on any element with `data-ab-test`
//   document.body.addEventListener('click', (e) => {
//     const el = e.target.closest('[data-ab-test]');
//     if (!el) return;

//     const key = el.getAttribute('data-ab-test');
//     const variantName = window.AB_TESTS?.[key]?.name;
//     if (!key || !variantName) return;

//     trackABTestClick(key, variantName);
//   });
// });


// if (isCheckoutPage && window.AB_TESTS) {
//   console.log('🎯 Conversion page detected. Tracking conversions for active A/B tests...');
//   Object.entries(window.AB_TESTS).forEach(([key, variant]) => {
//     trackABTestConversion(key, variant?.name);
//   });
// }


// import axios from 'axios';

// const sessionId = document.cookie.match(/connect.sid=([^;]+)/)?.[1] || null;
// const startTime = Date.now();
// let maxScroll = 0;

// const PAGE = {
//   url: window.location.href,
//   referrer: document.referrer,
//   title: document.title,
//   path: window.location.pathname,
//   isProduct: window.location.pathname.startsWith('/products/'),
//   isCheckout: window.location.pathname.includes('/checkout'),
//   isThankYou: window.location.pathname.includes('/thank-you'),
// };

// const sendEvent = async (type, details = {}) => {
//   try {
//     await axios.post('/api/v1/tracker', {
//       sessionId,
//       action: {
//         type,
//         pageUrl: PAGE.url,
//         timestamp: new Date(),
//         ...details,
//       },
//     });
//   } catch (err) {
//     console.error(`❌ Tracker Error: ${type}`, err);
//   }
// };

// // ---------- INIT EVENT FLOW ----------
// if (PAGE.isCheckout) sendEvent('checkout_start');
// if (PAGE.isThankYou) sendEvent('conversion');
// if (PAGE.isProduct) {
//   const slug = PAGE.path.split('/products/')[1]?.split('/')[0];
//   sendEvent('product_view', { productSlug: slug });
// } else if (!PAGE.isThankYou && !PAGE.isCheckout) {
//   sendEvent('page_view', { referrer: PAGE.referrer, title: PAGE.title });
// }

// // ---------- SCROLL + TIME TRACKING ----------
// window.addEventListener('scroll', () => {
//   const scrolled = Math.round(((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100);
//   if (scrolled > maxScroll) maxScroll = scrolled;
// });

// window.addEventListener('beforeunload', () => {
//   const timeSpent = (Date.now() - startTime) / 1000;

//   if (PAGE.isCheckout && !document.referrer.includes('/thank-you')) {
//     sendEvent('checkout_abandonment', { timeSpent });
//   }

//   // Dual send with beacon for reliability
//   const payload = (type, data = {}) => {
//     return JSON.stringify({
//       sessionId,
//       action: {
//         type,
//         pageUrl: PAGE.url,
//         timestamp: new Date(),
//         ...data
//       }
//     });
//   };

//   navigator.sendBeacon('/api/v1/tracker', payload('time_spent', { timeSpent, referrer: PAGE.referrer  }));
//   navigator.sendBeacon('/api/v1/tracker', payload('scroll_depth', { scrollDepth: maxScroll }));
// });

// // ---------- CLICK TRACKING ----------
// document.addEventListener('click', (e) => {
//   const target = e.target.closest('button, a');
//   if (target) {
//     sendEvent('button_click', {
//       buttonId: target.id || null,
//       buttonText: target.innerText.trim(),
//       classes: target.className,
//     });
//   }

//   // AB Click Tracking
//   const abEl = e.target.closest('[data-ab-test]');
//   if (abEl && window.AB_TESTS) {
//     const key = abEl.getAttribute('data-ab-test');
//     const variant = window.AB_TESTS?.[key]?.name;
//     if (key && variant) trackABTestClick(key, variant);
//   }
// });

// // ---------- FORM SUBMISSION ----------
// document.addEventListener('submit', (e) => {
//   const form = e.target;
//   sendEvent('form_submit', {
//     formId: form.id || null,
//     formAction: form.action,
//     classes: form.className,
//   });
// });

// // ---------- A/B TEST TRACKERS ----------
// const trackABTestEvent = (type, key, variantName) => {
//   if (!key || !variantName) return;

//   axios.post(`/api/v1/ab-test/${type}`, { key, variantName })
//     .then(() => {
//       console.log(`✅ A/B ${type}: ${key} → ${variantName}`);
//     })
//     .catch(err => {
//       console.warn(`❌ Failed to track A/B ${type} for ${key}:`, err);
//     });
// };

// const trackABTestImpression = (key, variantName) => trackABTestEvent('impression', key, variantName);
// const trackABTestClick = (key, variantName) => trackABTestEvent('click', key, variantName);
// const trackABTestConversion = (key, variantName) => trackABTestEvent('conversion', key, variantName);

// // ---------- A/B AUTO-TRACK ----------
// window.addEventListener('DOMContentLoaded', () => {
//   if (window.AB_TESTS && typeof window.AB_TESTS === 'object') {
//     console.log('📊 Auto-tracking A/B tests:', window.AB_TESTS);

//     Object.entries(window.AB_TESTS).forEach(([key, variant]) => {
//       if (variant?.name) {
//         trackABTestImpression(key, variant.name);
//       }
//     });

//     // Track conversions if on thank-you page
//     if (PAGE.isThankYou && !sessionStorage.getItem('ab_conversion_tracked')) {
//       sessionStorage.setItem('ab_conversion_tracked', 'true');
//       Object.entries(window.AB_TESTS).forEach(([key, variant]) => {
//         if (variant?.name) {
//           trackABTestConversion(key, variant.name);
//         }
//       });
//     }
//   }
// });

// // ---------- OPTIONAL EXPORTS ----------
// export const logABTestAction = (testName, variant) =>
//   sendEvent('ab_test_action', { abTestName: testName, abTestVariant: variant });



import axios from 'axios';

const sessionId = document.cookie.match(/connect.sid=([^;]+)/)?.[1] || null;
const startTime = Date.now();
let maxScroll = 0;

const PAGE = {
  url: window.location.href,
  referrer: document.referrer || 'ישיר / לא ידוע',
  title: document.title,
  path: window.location.pathname,
  isProduct: window.location.pathname.startsWith('/products/'),
  isCheckout: window.location.pathname.includes('/checkout'),
  isThankYou: window.location.pathname.includes('/thank-you'),
};

// ---------- Send Event ----------
const sendEvent = async (type, details = {}) => {
  try {
    await axios.post('/api/v1/tracker', {
      sessionId,
      action: {
        type,
        pageUrl: PAGE.url,
        timestamp: new Date(),
        ...details,
      },
    });
  } catch (err) {
    console.error(`❌ Tracker Error: ${type}`, err);
  }
};

// ---------- Init Tracking ----------
if (PAGE.isCheckout) sendEvent('checkout_start');
if (PAGE.isThankYou) sendEvent('checkout_complete');

if (PAGE.isProduct) {
  const slug = PAGE.path.split('/products/')[1]?.split('/')[0];
  sendEvent('product_view', { productSlug: slug });
} else if (!PAGE.isThankYou && !PAGE.isCheckout) {
  sendEvent('page_view', {
    referrer: PAGE.referrer,
    title: PAGE.title,
  });
}

// ---------- Scroll & Time Tracking ----------
window.addEventListener('scroll', () => {
  const scrolled = Math.round(((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100);
  if (scrolled > maxScroll) maxScroll = scrolled;
});

window.addEventListener('beforeunload', () => {
  const timeSpent = (Date.now() - startTime) / 1000;

  if (PAGE.isCheckout && !document.referrer.includes('/thank-you')) {
    sendEvent('checkout_dropoff', { timeSpent });
  }

  const beaconPayload = (type, data = {}) =>
    JSON.stringify({
      sessionId,
      action: {
        type,
        pageUrl: PAGE.url,
        timestamp: new Date(),
        referrer: PAGE.referrer,
        ...data,
      },
    });

  navigator.sendBeacon('/api/v1/tracker', beaconPayload('time_spent', { timeSpent }));
  navigator.sendBeacon('/api/v1/tracker', beaconPayload('scroll_depth', { scrollDepth: maxScroll }));
});

// ---------- Click Tracking ----------
document.addEventListener('click', (e) => {
  const target = e.target.closest('button, a');
  console.log(target)
  if (target) {
    sendEvent('button_click', {
      buttonId: target.id || null,
      buttonText: target.innerText.trim(),
      classes: target.className,
    });
  }

  // A/B Click Tracking
  const abEl = e.target.closest('[data-ab-test]');
  if (abEl && window.AB_TESTS) {
    const key = abEl.getAttribute('data-ab-test');
    console.log( window.AB_TESTS?.[key])
    const variant = window.AB_TESTS?.[key]?.name;

    if (key && variant) trackABTestClick(key, variant);
  }
});

// ---------- Form Submission ----------
document.addEventListener('submit', (e) => {
  const form = e.target;
  sendEvent('form_submit', {
    formId: form.id || null,
    formAction: form.action,
    classes: form.className,
  });
});

// ---------- A/B Testing ----------
const trackABTestEvent = (type, key, variantName) => {
  if (!key || !variantName) return;
  axios.post(`/api/v1/ab-test/${type}`, { key, variantName })
    .then(() => console.log(`✅ A/B ${type}: ${key} → ${variantName}`))
    .catch(err => console.warn(`❌ A/B ${type} failed:`, err));
};

const trackABTestImpression = (key, variantName) => trackABTestEvent('impression', key, variantName);
const trackABTestClick = (key, variantName) => trackABTestEvent('click', key, variantName);
const trackABTestConversion = (key, variantName) => trackABTestEvent('conversion', key, variantName);

// Auto-track impressions + conversion on thank-you
window.addEventListener('DOMContentLoaded', () => {
  if (window.AB_TESTS && typeof window.AB_TESTS === 'object') {
    Object.entries(window.AB_TESTS).forEach(([key, variant]) => {
      if (variant?.name) trackABTestImpression(key, variant.name);
    });

    if (PAGE.isThankYou && !sessionStorage.getItem('ab_conversion_tracked')) {
      sessionStorage.setItem('ab_conversion_tracked', 'true');
      Object.entries(window.AB_TESTS).forEach(([key, variant]) => {
        if (variant?.name) trackABTestConversion(key, variant.name);
      });
    }
  }
});

// ---------- Manual A/B Event Export ----------
export const logABTestAction = (testName, variant) =>
  sendEvent('ab_test_action', { abTestName: testName, abTestVariant: variant });
