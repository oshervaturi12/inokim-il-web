
const dynamicStyles = [
  {
    condition: () => window.location.pathname.includes('find-us'),
    importPath: () => import(/* webpackPreload: true, webpackChunkName: "map-styles" */ '~/css/_map.scss'),
    logMessage: '🗺️ Map styles preloaded dynamically.',
  },
  {
    condition: () => window.location.pathname.includes('login'),
    importPath: () => import(/* webpackPreload: true, webpackChunkName: "login-styles" */ '~/css/_login.scss'),
    logMessage: '🔐 Login styles preloaded dynamically.',
  },
  {
    condition: () => window.location.pathname.includes('about-inokim'),
    importPath: () => import(/* webpackPreload: true, webpackChunkName: "about-styles" */ '~/css/_aboutUs.scss'),
    logMessage: 'About Us styles preloaded dynamically.',
  },
  {
    condition: () => window.location.pathname.includes('sitemap'),
    importPath: () => import(/* webpackPrefetch: true, webpackChunkName: "sitemap-styles" */ '~/css/_sitemap.scss'),
    logMessage: '🗺️ Sitemap styles prefetched dynamically.',
  },
  {
    condition: () => ['contact-us', 'dealers', 'trade-in'].some(path => window.location.pathname.includes(path)),
    importPath: () => import(/* webpackPreload: true, webpackChunkName: "contact-styles" */ '~/css/_contact.scss'),
    logMessage: '📞 Contact styles preloaded dynamically.',
  },
  {
    condition: () => ['account', 'user'].some(path => window.location.pathname.includes(path)),
    importPath: () => import(/* webpackPreload: true, webpackChunkName: "userPage-styles" */ '~/css/_userPage.scss'),
    logMessage: '📞 UserPage styles preloaded dynamically.',
  },
  {
    condition: () => window.location.pathname.includes('category'),
    importPath: () => import(/* webpackPreload: true, webpackChunkName: "category-styles" */ '~/css/_category.scss'),
    logMessage: '📞 Category styles preloaded dynamically.',
  },
  {
    condition: () => window.location.pathname.includes('blog'),
    importPath: () => import(/* webpackPrefetch: true, webpackChunkName: "blog-styles" */ '~/css/_blog.scss'),
    logMessage: '📝 Blog styles prefetched dynamically.',
  },
  {
    condition: () => window.location.pathname.includes('faq'),
    importPath: () => import(/* webpackPreload: true, webpackChunkName: "faq-styles" */ '~/css/_faq.scss'),
    logMessage: '❓ FAQ styles preloaded dynamically.',
  },
  {
    condition: () => window.location.pathname.includes('overview'),
    importPath: () => import(/* webpackPreload: true, webpackChunkName: "overview-styles" */ '~/css/_overview.scss'),
    logMessage: '📊 Overview styles preloaded dynamically.',
  },
  {
    condition: () => window.location.pathname.includes('support'),
    importPath: () => import(/* webpackPrefetch: true, webpackChunkName: "support-styles" */ '~/css/_support.scss'),
    logMessage: '🛠️ Support styles prefetched dynamically.',
  },
  {
    condition: () => !!document.querySelector('.footer'),
    importPath: () => import(/* webpackPrefetch: true, webpackChunkName: "footer-styles" */ '~/css/_footer.scss'),
    logMessage: '📥 Footer styles prefetched dynamically.',
  },
  {
    condition: () => !!document.querySelector('#dash-404'),
    importPath: () => import(/* webpackPreload: true, webpackChunkName: "404-styles" */ '~/css/_404.scss'),
    logMessage: '❌ 404 styles preloaded dynamically.',
  },
  {
    condition: () => window.location.pathname === '/products/cyborg/overview',
    importPath: () => import(/* webpackPreload: true, webpackChunkName: "overview-special-styles" */ '~/css/_specialProduct.scss'),
    logMessage: '📊 Overview styles preloaded dynamically for Cyborg overview.',
  },
  {
    condition: () => window.location.pathname.includes('admin'),
    importPath: () => import(/* webpackPreload: true, webpackChunkName: "adminHeader-styles" */ '~/css/_adminHeader.scss'),
    logMessage: '🔐 admin styles preloaded dynamically.',
  }
];


export async function loadDynamicStyles() {
  try {
    await Promise.all(
      dynamicStyles
        .filter(style => style.condition()) 
        .map(async (style) => {
          await style.importPath();
          // console.log(style.logMessage);
        })
    );
  } catch (error) {
    console.error(` Failed to load dynamic styles:`, error);
  }
}
