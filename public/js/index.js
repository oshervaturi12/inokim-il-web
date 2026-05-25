
import { Modal, Tooltip, Offcanvas, Collapse } from "bootstrap";
import "lazysizes";
import {extractFormData} from './helpers.js'
import { loadDynamicStyles } from './features/dynamicStyles.js';
import { registerServiceWorker } from './features/registerServiceWorker';
import axios from "axios";

// DOM ELEMENT
const map = document.getElementById('map')
const productSection = document.querySelector('.choose-model');
const galleryElement = document.getElementById('p-gallery')
const testDriveSection = document.querySelector('.test-drive');
const loginForm = document.getElementById('loginForm')
const modelsToggle = document.querySelector(".models-toggle");
const checkoutPage = document.getElementById('cart-page');
const addToCartForm = document.getElementById('addToCart');
const cartButton = document.getElementById('topmenucart');
const cartCount = document.querySelector("#topmenucart")
const ridersSlides = document.getElementById('riders')
const overviewHeader = document.querySelector('.overview-header');
const scrollContainer = document.querySelector('.wd-product-overview') || window;
const form = document.querySelector('.dynamic-form');
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const isScooterPage = document.getElementById("editScooterForm");
const noVat = document.getElementById('noVat')
const includeVAT = document.getElementById('includeVAT')



document.addEventListener('DOMContentLoaded', () => {
  loadDynamicStyles();
   registerServiceWorker();



});


import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';


// document.addEventListener("DOMContentLoaded", () => {
//   const swiper = new Swiper('.swiper', {
//     modules: [Navigation, Pagination],
//     slidesPerView: 'auto',
//     spaceBetween: 20,
//     loop: true,
//     pagination: {
//       el: '.swiper-pagination',
//       clickable: true,
//     },
//     breakpoints: {
//       768: { slidesPerView: 2 },
//       1200: { slidesPerView: 3 }
//     }
//   });
// });








if (includeVAT) {
  includeVAT.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get('/api/v1/vat-mode/unset-no-vat');
      
      await axios.get('/api/v1/carts/update-vat');

      if (data.success === true) {
        const time = Date.now(); 
        const url = new URL(window.location.href);
        url.searchParams.set("refresh", time);
        window.location.href = url.toString();
      }
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  });

const swiper = new Swiper(".swiper", {
  modules: [Pagination],
  slidesPerView: "auto",
  spaceBetween: 20,
  freeMode: {
    enabled: true,
    momentum: true,
    momentumRatio: 0.35, // מהירות האטה
    momentumVelocityRatio: 0.8, // עד כמה להחליק
    sticky: false
  },
  grabCursor: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    dynamicBullets: true
  },
  // תמיכה ב־RTL
  direction: "horizontal",


  breakpoints: {
    480: { slidesPerView: 1.2, spaceBetween: 15 },
    768: { slidesPerView: 2, spaceBetween: 20 },
    1200: { slidesPerView: 2, spaceBetween: 25 }
  }
});

}


if (noVat) {
  noVat.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get('/api/v1/vat-mode/set-no-vat');
      
      await axios.get('/api/v1/carts/update-vat');

      if (data.noVAT === true) {
        const url = new URL(window.location.href);
        url.searchParams.set("refresh", "true");
        window.location.href = url.toString(); 
      }
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  });
}


// document.addEventListener("DOMContentLoaded", async () => {
//   const chatToggle = document.getElementById("chatToggle");
//   if (!chatToggle) return; // ✅ Load only if chat button exists

//   console.log("📢 Chat module loading...");

//   import(/* webpackChunkName: "chat-module" */ "./chat")
//     .then(({ default: Chat }) => {
//       const socketUrl = "/" // ✅ Set dynamic WebSocket URL
//       new Chat(socketUrl);
//       console.log("✅ Chat module loaded successfully!");
//     })
//     .catch((error) => console.error("❌ Failed to load chat module:", error));
// });



if(tooltipTriggerList){
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));

}


if (map) {
  import('./features/initMap').then(({ default: initMap }) => initMap());
}


// if (galleryElement) {
//   (async () => {
//     try {
//       const { default: SplideGallery } = await import(
//         /* webpackChunkName: "SplideGallery" */ './SplideGallery'
//       );
//       const gallery = new SplideGallery('.splide');
//       gallery.initGallery();
//     } catch (error) {
//       console.error('Failed to load the Splide Gallery module:', error);
//     }
//   })();
// }

// const modalSlider = document.getElementById('multiSlideModal');
// if (modalSlider) {
//   const customOptions = {
//     type: 'slide',
//     speed: 1000,
//     gap: '3rem', // slightly tighter gap
//     autoplay: false,
//     perPage: 1,
//     padding: '20%', 
//     breakpoints: {
//       1024: { perPage: 1, padding: '10%' },
//       768: { perPage: 1, padding: '5%' },
//       480: { perPage: 1, padding: '0' }
//     }
//   };

//   (async () => {
//     try {
//       const { default: SplideGallery } = await import(
//         /* webpackChunkName: "SplideGallery" */ './SplideGallery'
//       );
//       const gallery = new SplideGallery('#multiSlideModal', customOptions);
//       gallery.initGallery();
//     } catch (error) {
//       console.error('❌ Failed to initialize Splide Gallery:', error);
//     }
//   })();
// }

// (async () => {
//   try {
//     const { default: SplideGallery } = await import(
//       /* webpackChunkName: "SplideGallery" */ './SplideGallery'
//     );

//     // Modal config – specific
//     const modalSlider = document.getElementById('multiSlideModal');
//     if (modalSlider) {
//       const modalOptions = {
//         type: 'slide',
//         speed: 1000,
//         gap: '3rem',
//         autoplay: false,
//         perPage: 1,
//         padding: '20%',
//         breakpoints: {
//           1024: { perPage: 1, padding: '10%' },
//           768: { perPage: 1, padding: '5%' },
//           480: { perPage: 1, padding: '0' }
//         }
//       };

//       const modalGallery = new SplideGallery(modalSlider, modalOptions);
//       await modalGallery.initGallery();
//     }

//     // Other sliders: auto-init with default or data attributes
//     const otherSliders = document.querySelectorAll('.splide:not(#multiSlideModal)');
//     await Promise.all(
//       Array.from(otherSliders).map(async (el) => {
//         const gallery = new SplideGallery(el);
//         await gallery.initGallery();
//       })
//     );

//   } catch (error) {
//     console.error('❌ Failed to load SplideGallery:', error);
//   }
// })();
(async () => {
  try {
    const { default: SplideGallery } = await import(
      /* webpackChunkName: "SplideGallery" */ './SplideGallery'
    );

    // Other sliders: auto-init with default or data attributes
    const otherSliders = document.querySelectorAll('.splide:not(#multiSlideModal)');
    await Promise.all(
      Array.from(otherSliders).map(async (el) => {
        const gallery = new SplideGallery(el);
        await gallery.initGallery();
      })
    );

    // Modal slider: lazy init on first open
    const modal = document.getElementById('moreModal');
    let isModalSliderInitialized = false;

    modal?.addEventListener('shown.bs.modal', async () => {
      if (isModalSliderInitialized) return;

      const modalSlider = document.getElementById('multiSlideModal');
      if (modalSlider) {
        const modalOptions = {
          type: 'slide',
          speed: 1000,
          gap: '3rem',
          autoplay: false,
          perPage: 1,
          padding: '20%',
          focus: 'center',
          breakpoints: {
            1024: { perPage: 1, padding: '10%' },
            768: { perPage: 1, padding: '5%' },
            480: { perPage: 1, padding: '0' }
          }
        };

        const modalGallery = new SplideGallery(modalSlider, modalOptions);
        await modalGallery.initGallery();
        isModalSliderInitialized = true;
      }
    });

  } catch (error) {
    console.error('❌ Failed to initialize SplideGallery:', error);
  }
})();




if (productSection) {
  (async () => {
    try {
      const { default: ProductOptions } = await import(/* webpackChunkName: "product-options" */ './ProductOptions');
      new ProductOptions();
    } catch (error) {
      console.error("Failed to load Product Options module", error);
    }
  })();

}



if (testDriveSection) {
  // Dynamically import the class with Webpack's chunk naming
  const { default: TestRide } = await import(
    /* webpackChunkName: "test-drive" */ './Testride.js'
  );

  // Initialize the class
  new TestRide();
}


// if (loginForm) {
//   const btnLogin = loginForm.querySelector('.btn-block')
//   // console.log(btnLogin)
//     loginForm.addEventListener('submit', async (e) => {
//       try {
//         e.preventDefault();
//         const { login } = await import(
//           /* webpackChunkName: "login" */ './login'
//         );
//         const dataObj = extractFormData(loginForm)
//         login(dataObj, btnLogin);
//       } catch (error) {
//         console.log(error)
//       }
//     });
//   }

if (loginForm) {
  const { login } = await import(
    /* webpackChunkName: "login" */ './login'
  );

  const btnLogin = loginForm.querySelector('.btn-block');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const dataObj = extractFormData(loginForm);
      login(dataObj, btnLogin);
    } catch (error) {
      console.error('Login error:', error);
    }
  });
}




  if (modelsToggle) {
    import(/* webpackChunkName: "modelsMenu" */ "./modelsMenu")
      .then((module) => {
        module.default(); // Call the function
      })
      .catch((err) => console.error("❌ Failed to load modelsMenu.js:", err));
  }
  

  if (checkoutPage) {
    import(/* webpackChunkName: "checkout-handler" */ './CheckoutFormHandler')
      .then(({ initCheckoutForm }) => {
        initCheckoutForm();
        console.log('Checkout form logic loaded dynamically.');
      })
      .catch(error => console.error('Failed to load checkout handler:', error));
  }




if (cartButton) {
  import(/* webpackChunkName: "mini-cart" */ './miniCartHandler')
    .then(({ default: MiniCart }) => {
      new MiniCart(); // ✅ Instantiate the class
      console.log('🛒 Mini cart logic loaded dynamically.');
    })
    .catch(error => console.error('❌ Failed to load mini cart handler:', error));
}



if (addToCartForm) {
  import(/* webpackChunkName: "addToCartModule" */ './addToCartModule')
    .then(({ default: setupAddToCart }) => setupAddToCart())
    .catch((err) => console.error("❌ Failed to load Add to Cart module:", err));
}



if (ridersSlides) {
  const customOptions = {
    autoplay: true,      
    speed: 1000,       
    gap: "3rem",      
    breakpoints: {
      1024: { perPage: 2, padding: "20%" },
      768: { perPage: 1, padding: "15%" },
      480: { perPage: 1, padding: "5%" }
    }
  };
  (async () => {
    try {
      const { default: SplideGallery } = await import(
        /* webpackChunkName: "SplideGallery" */ './SplideGallery'
      );
      const gallery = new SplideGallery('#riders', customOptions);
      gallery.initGallery();
    } catch (error) {
      console.error('Failed to load the Splide Gallery module:', error);
    }
  })();
}




if (cartCount) {
  import(/* webpackChunkName: "cartCount" */ "./cartCount")
      .then(module => {
          module.default();
      })
      .catch(error => console.error("Failed to load cartCount module:", error));
}





  if (overviewHeader) {
    scrollContainer.addEventListener('scroll', () => {
      const scrollTop = scrollContainer === window ? window.scrollY : scrollContainer.scrollTop;
      const scrollLimit = 6 * parseFloat(getComputedStyle(document.documentElement).fontSize);
  
      if (scrollTop > scrollLimit) {
        overviewHeader.classList.add('sticky');
      } else {
        overviewHeader.classList.remove('sticky');
      }
    });
  }




  if (form) {
    import(
      /* webpackChunkName: "testRideForm" */
      './forms/testRideForm'
    ).then(({ default: initTestRideForm }) => {
      initTestRideForm();
    }).catch(err => {
      console.error('❌ Failed to load test ride form handler:', err);
    });
  }



  // document.addEventListener("DOMContentLoaded", () => {
  //   const videoCover = document.getElementById("videoCover");
  //   const bgVideo = document.getElementById("bgVideo");
  //   const playButton = document.getElementById("playVideo");
  
  //   const loadVideo = () => {
  //     bgVideo.classList.add("visible"); // Show Video
  //     videoCover.style.display = "none"; // Hide Cover
  //     bgVideo.play(); // ✅ Start playing when loaded
  //   };
  
  //   // ✅ Play when user clicks
  //   playButton.addEventListener("click", loadVideo);
  
  //   // ✅ Auto-load when visible
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       if (entries[0].isIntersecting) {
  //         loadVideo();
  //         observer.disconnect(); // ✅ Stop observing after loading
  //       }
  //     },
  //     { threshold: 0.3 } // Load when 30% visible
  //   );
  
  //   observer.observe(bgVideo);
  // });
  


  if (document.querySelector(".video-container")) {
    console.log(true)
    import(/* webpackChunkName: "lazy-video-loader" */ "./lazyVideoLoader")
      .then(({ default: initializeLazyVideoLoader }) => initializeLazyVideoLoader())
      .catch(err => console.error("Failed to load LazyVideoLoader:", err));
  }


  if (document.querySelector("[data-table-manager]")) {
    import(/* webpackChunkName: "table-loader" */ "./admin/tableLoader")
      .then(({ default: initializeTableManager }) => initializeTableManager())
      .catch(err => console.error("❌ Failed to load TableManager:", err));
  }
  


  if (isScooterPage) {
      import(/* webpackChunkName: "scooterManager" */ "./admin/ScooterManager")
          .then(({ default: ScooterManager }) => {
              new ScooterManager("editScooterForm");
          })
          .catch((error) => console.error("Error loading ScooterManager:", error));
  }


  if (document.getElementById('orderChart')) {
    import(/* webpackChunkName: "order-chart" */ './admin/OrderChart')
      .then(({ default: OrderChart }) => {
        new OrderChart();
      })
      .catch((err) => {
        console.error('🛑 Failed to load OrderChart module:', err);
      });
  }


  if (document.getElementById('clicksChart')) {
    import(/* webpackChunkName: "google-ads-chart" */ './admin/charts/GoogleAdsChart.js')
      .then(({ default: GoogleAdsChart }) => {
        new GoogleAdsChart();
      })
      .catch((err) => {
        console.error('🛑 Failed to load GoogleAdsChart module:', err);
      });
  }


  if (document.querySelector('textarea#content')) {
    import(/* webpackChunkName: "tinymce-editor" */ './admin/TinyMCE')
      .then(({ default: initTinyMCE }) => {
        initTinyMCE('#content');
      })
      .catch((err) => {
        console.error('🛑 Failed to load TinyMCE init module:', err);
      });
  }



  document.querySelectorAll("img.lazyload[data-src]").forEach(img => {
    const highRes = img.dataset.src;
    const preloadImg = new Image();
    preloadImg.src = highRes;
    preloadImg.onload = () => {
      img.src = highRes;
      img.classList.add("loaded");
    };
  });
  


  document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('videoUpsellProduct');

    if(modal) {
      const video = modal.querySelector('.video-player');

      // Pause the video when modal is hidden
      modal.addEventListener('hidden.bs.modal', () => {
        video.pause();
        video.currentTime = 0; // optional: reset to start
      });
  
      // Optional: play video on open (if autoplay removed and no custom button used)
      modal.addEventListener('shown.bs.modal', () => {
        video.play();
      });
    }


  });


  document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('couponForm');
    if (!form) return;
  
    try {
      const { CouponManager } = await import(
        /* webpackChunkName: "coupon" */ './CouponManager'
      );
      const coupon = new CouponManager();
      coupon.init();
    } catch (error) {
      console.error('Error loading coupon module:', error);
    }
  });



  const orderFormEl = document.querySelector('#orderForm');
  if (orderFormEl) {
    import(/* webpackChunkName: "order-manager" */ './admin/OrderManager').then(({ default: OrderManager }) => {
      const orderId = orderFormEl.getAttribute('data-order-id');
      const manager = new OrderManager(orderId);
      manager.bindFormSubmission();
    });
  }


const locations = {
  bursa: {
    name: 'היצירה 3 רמת גן',
    lat: 32.084041,
    lng: 34.801176
  },
  haifa: {
    name: 'קדושי יאסי 2 חיפה',
    lat: 32.7920982,
    lng: 34.9643913
  }
};

function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = angle => angle * (Math.PI / 180);
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// function setWazeLink(closest) {
//   const wazeLink = document.getElementById('dynamicWaze');
//   if (wazeLink) {
//     wazeLink.href = `https://waze.com/ul?ll=${closest.lat},${closest.lng}&navigate=yes`;
//   }
// }

// const saved = localStorage.getItem('closestLocation');
// if (saved) {
//   setWazeLink(JSON.parse(saved));
// } else {
//   navigator.geolocation.getCurrentPosition(
//     position => {
//       const userLat = position.coords.latitude;
//       const userLng = position.coords.longitude;

//       const distanceToBursa = getDistance(userLat, userLng, locations.bursa.lat, locations.bursa.lng);
//       const distanceToHaifa = getDistance(userLat, userLng, locations.haifa.lat, locations.haifa.lng);

//       const closest = distanceToBursa < distanceToHaifa ? locations.bursa : locations.haifa;

//       localStorage.setItem('closestLocation', JSON.stringify(closest));
//       setWazeLink(closest);
//     },
//     error => {
//       console.warn('Geolocation error:', error);
//     }
//   );
// }

