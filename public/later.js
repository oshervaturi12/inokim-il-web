

const moduleLoaders = [
    {
      element: checkoutPage,
      importPath: './CheckoutFormHandler',
      callback: ({ initCheckoutForm }) => {
        initCheckoutForm();
        console.log('🛒 Checkout form logic loaded dynamically.');
      },
    },
    {
      element: cartButton,
      importPath: './miniCartHandler',
      callback: ({ initMiniCart }) => {
        initMiniCart();
        console.log('🛒 Mini cart logic loaded dynamically.');
      },
    },
    {
      element: addToCartForm,
      importPath: './addToCartModule',
      callback: ({ default: setupAddToCart }) => setupAddToCart(),
    },
    {
      element: cartCount,
      importPath: './cartCount',
      callback: ({ default: initCartCount }) => initCartCount(),
    },
    {
      element: productSection,
      importPath: './ProductOptions',
      callback: ({ default: ProductOptions }) => new ProductOptions(),
    },
    {
      element: modelsToggle,
      importPath: './modelsMenu',
      callback: (module) => module.default(),
    },
    {
      element: testDriveSection,
      importPath: './Testride.js',
      callback: ({ default: TestDriveImageChanger }) =>
        new TestDriveImageChanger('#test-ride-img'),
    },
    {
      element: galleryElement,
      importPath: './SplideGallery',
      callback: ({ default: SplideGallery }) => {
        const gallery = new SplideGallery('.splide');
        gallery.initGallery();
      },
    },
    {
      element: ridersSlides,
      importPath: './SplideGallery',
      callback: ({ default: SplideGallery }) => {
        const customOptions = {
          autoplay: true,
          speed: 1000,
          gap: '3rem',
          breakpoints: {
            1024: { perPage: 2, padding: '20%' },
            768: { perPage: 1, padding: '15%' },
            480: { perPage: 1, padding: '5%' },
          },
        };
        const gallery = new SplideGallery('#riders', customOptions);
        gallery.initGallery();
      },
    },
  ];
  
  // 🚀 Load modules
  moduleLoaders.forEach(({ element, importPath, callback }) => {
    if (element) {
      import(/* webpackChunkName: "[request]" */ importPath)
        .then(callback)
        .catch((err) => console.error(`❌ Failed to load ${importPath}:`, err));
    }
  });
  