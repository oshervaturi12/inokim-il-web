export default function initModelsMenu() {
    const backToMenu = document.querySelector(".back-to-menu");
    const mainMenu = document.querySelector(".main-menu");
    const modelsSection = document.querySelector(".models-section");
    const modelsToggle = document.querySelector(".models-toggle");
  
    if (modelsToggle && backToMenu) {
      modelsToggle.addEventListener("click", function (e) {
        e.preventDefault();
        mainMenu.classList.add("d-none");
        modelsSection.classList.remove("d-none");
      });
  
      backToMenu.addEventListener("click", function () {
        mainMenu.classList.remove("d-none");
        modelsSection.classList.add("d-none");
      });
    }
  }
  