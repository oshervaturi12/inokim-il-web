

// export default class SplideGallery {
//   constructor(selector, options = {}) {
//     this.selector = selector;
//     this.splide = null;
//     this.defaultOptions = {
//       type: 'loop',
//       perPage: 1,
//       autoplay: false,
//       pagination: true,
//       focus: 'center',
//       arrows: true,
//       direction: 'rtl',
//       lazyLoad: 'nearby',
//     };
//     this.options = { ...this.defaultOptions, ...options };
//   }

//   async initGallery() {
//     const galleryElement = document.querySelector(this.selector);

//     if (!galleryElement) {
//       console.error('❌ Splide element not found:', this.selector);
//       return;
//     }

//     try {
//       // ✅ Dynamically load Splide JS
//       const { default: Splide } = await import('@splidejs/splide');

//       // ✅ Dynamically inject the CSS as a <link> tag
//       if (!document.getElementById('splide-css')) {
//         const link = document.createElement('link');
//         link.id = 'splide-css';
//         link.rel = 'stylesheet';
//         link.href = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css';
//         document.head.appendChild(link);
//       }

//       this.splide = new Splide(galleryElement, this.options);
//       this.splide.mount();
//     } catch (error) {
//       console.error('❌ Failed to load Splide dynamically:', error);
//     }
//   }
// }


export default class SplideGallery {
  constructor(selector, options = {}) {
    this.element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    this.splide = null;
    this.defaultOptions = {
      type: 'loop',
      perPage: 1,
      autoplay: false,
      pagination: true,
      focus: 'center',
      arrows: true,
      direction: 'rtl',
      lazyLoad: 'nearby',
    };
    this.options = options;
  }

  async initGallery() {
    if (!this.element) {
      console.error('❌ Splide element not found.');
      return;
    }

    try {
      const { default: Splide } = await import('@splidejs/splide');

      // Inject CSS once
      if (!document.getElementById('splide-css')) {
        const link = document.createElement('link');
        link.id = 'splide-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css';
        document.head.appendChild(link);
      }

      // Parse inline options if present
      let finalOptions = { ...this.defaultOptions };

      const datasetOptions = this.element.dataset.splideOptions;
      if (datasetOptions) {
        try {
          finalOptions = { ...finalOptions, ...JSON.parse(datasetOptions) };
        } catch (e) {
          console.warn('⚠️ Failed to parse data-splide-options JSON:', e);
        }
      }

      // If passed options override them
      finalOptions = { ...finalOptions, ...this.options };

      this.splide = new Splide(this.element, finalOptions);
      this.splide.mount();
    } catch (error) {
      console.error('❌ Failed to initialize Splide:', error);
    }
  }
}
