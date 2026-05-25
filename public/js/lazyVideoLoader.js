class LazyVideoLoader {
    constructor(videoSelector = ".info-video") {
      this.videoContainer = document.querySelector(".video-container");
      this.video = this.videoContainer?.querySelector(videoSelector);
      this.source = this.video?.querySelector("source");
  
      if (this.video) {
        this.init();
      }
    }
  
    init() {
      // Use Intersection Observer to detect when video is in viewport
      const observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadVideo();
              observer.unobserve(this.videoContainer);
            }
          });
        },
        { threshold: 0.5 }
      );
  
      observer.observe(this.videoContainer);
  
      // Also load if user interacts with the section
      this.videoContainer.addEventListener("click", () => this.loadVideo());
    }
  
    // loadVideo() {
    //   if (!this.video.dataset.loaded) {
    //     this.video.src = this.video.dataset.src;
    //     this.source.src = this.source.dataset.src;
    //     this.video.load();
    //     this.video.dataset.loaded = "true";
    //     console.log("🎬 Video loaded dynamically.");
    //   }
    // }

    loadVideo() {
      if (!this.video.dataset.loaded && this.source?.dataset.src) {
        this.source.src = this.source.dataset.src;
        this.video.load();
        this.video.dataset.loaded = "true";
        console.log("🎬 Video loaded dynamically.");
      }
    }
  }
  
  // Export function to load the class dynamically
  export default function initializeLazyVideoLoader() {
    new LazyVideoLoader();
  }
  