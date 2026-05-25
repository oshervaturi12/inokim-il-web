import { addGlobalEventListener } from './helpers';


export default class TestDriveImageChanger {
    constructor(imageContainerSelector) {
      this.imageContainer = document.querySelector(imageContainerSelector);
      this.init();
    }
  
    // Initialize event listener
    init() {
      addGlobalEventListener('click', '.option__section', (event, element) => {
        this.handleOptionClick(element);
      });
    }
  
    // Handle click event
    handleOptionClick(optionElement) {
      const imgUrl = optionElement.dataset.img;
      const productName = optionElement.dataset.prd || "inokim ox dubai";
      if (imgUrl && this.imageContainer) {
        this.updateImageWithFade(imgUrl, productName);
        this.highlightSelected(optionElement);
      }
    }
  
    // Update the image with a fade animation
    updateImageWithFade(imgUrl, productName) {
      const imgElement = this.imageContainer.querySelector('img');
      const chhosenModelInput = document.getElementById('testDriveModelCoose'); 

      if (imgElement) {
        // Add fade-out class
        imgElement.classList.add('fade-out');

        chhosenModelInput.value = productName; 
  
        // Wait for the fade-out transition to end before changing the source
        imgElement.addEventListener(
          'transitionend',
          () => {
            imgElement.src = imgUrl;
            imgElement.classList.remove('fade-out');
          },
          { once: true }
        );
      }
    }
  
    // Highlight the selected option visually
    highlightSelected(selectedElement) {
      document.querySelectorAll('.option__section').forEach((element) => {
        element.classList.remove('active');
      });
      selectedElement.classList.add('active');
    }
  }