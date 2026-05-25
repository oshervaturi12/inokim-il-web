export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('✅ Service Worker:', reg.scope))
        .catch(err => console.error('❌ SW Error:', err));
    }
  }