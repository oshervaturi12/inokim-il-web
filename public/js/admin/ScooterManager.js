import axios from "axios";
import { showAlert } from '../alerts';

export default class ScooterManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.init();
    }

    init() {
        this.container.addEventListener("click", async (event) => {
            const target = event.target;

            if (target.matches("#addVariant")) this.addVariant();
            else if (target.matches(".remove-variant")) this.removeVariant(target);
            else if (target.matches(".addColor")) this.addColor(target);
            else if (target.matches(".remove-color")) this.removeColor(target);
            else if (target.matches(".addGalleryImage")) this.addGalleryImage(target);
            else if (target.matches(".remove-gallery")) this.removeGalleryImage(target);
            else if (target.matches(".addSpec")) this.addSpec();
            else if (target.matches(".remove-spec")) this.removeSpec(target);
            else if (target.matches(".add-spec-item")) this.addSpecItem(target);
            else if (target.matches(".remove-spec-item")) this.removeSpecItem(target);
        });

        this.container.addEventListener("submit", async (event) => {
            if (event.target.matches("#editScooterForm")) {
                event.preventDefault();
                await this.submitForm(event.target);
            }
        });
    }

    addVariant() {
        const index = document.querySelectorAll(".variant-card").length;
        const variantHTML = `
            <div class="variant-card box border p-3 mb-3 position-relative" data-index="${index}">
                <button class="remove remove-variant position-absolute btn-sm">×</button>

                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label">תת דגם</label>
                        <input type="text" name="variants[${index}].subModel" class="form-control">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">טווח</label>
                        <input type="text" name="variants[${index}].range" class="form-control">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">סוללה</label>
                        <input type="text" name="variants[${index}].battary" class="form-control">
                    </div>
                </div>

                <h5 class="mt-3">גלריה</h5>
                <button type="button" class="btn btn-primary btn-sm addGalleryImage">➕ הוסף תמונה</button>
                <div class="gallery row mt-2"></div>

                <h5 class="mt-3">צבעים</h5>
                <button type="button" class="btn btn-primary btn-sm addColor">➕ הוסף צבע</button>
                <div class="row colors"></div>
            </div>
        `;

        this.container.querySelector("#variants").insertAdjacentHTML("beforeend", variantHTML);
    }

    removeVariant(button) {
        button.closest(".variant-card").remove();
    }

    addColor(button) {
        const variantCard = button.closest(".variant-card");
        const variantIndex = variantCard.getAttribute("data-index");
        const colorIndex = variantCard.querySelectorAll(".color-card").length;

        const colorHTML = `
            <div class="col-md-4 color-card border p-2">
                <button type="button" class="btn btn-danger btn-sm remove-color">×</button>

                <label class="form-label">שם הצבע</label>
                <input type="text" name="variants[${variantIndex}].colors[${colorIndex}].name" class="form-control">
                
                <label class="form-label">HEX</label>
                <input type="text" name="variants[${variantIndex}].colors[${colorIndex}].hex" class="form-control">
                
                <label class="form-label">SKU</label>
                <input type="text" name="variants[${variantIndex}].colors[${colorIndex}].sku" class="form-control">
                
                <label class="form-label">מחיר</label>
                <input type="number" name="variants[${variantIndex}].colors[${colorIndex}].price" class="form-control">
                
                <label class="form-label">תמונה</label>
                <input type="text" name="variants[${variantIndex}].colors[${colorIndex}].image" class="form-control">
                <img src="" width="50" class="img-thumbnail">
            </div>
        `;

        variantCard.querySelector(".colors").insertAdjacentHTML("beforeend", colorHTML);
    }

    removeColor(button) {
        button.closest(".color-card").remove();
    }

    addGalleryImage(button) {
        const variantCard = button.closest(".variant-card");
        const variantIndex = variantCard.getAttribute("data-index");
        const galleryIndex = variantCard.querySelectorAll(".gallery img").length;

        const galleryHTML = `
            <div class="col-md-3">
                <input type="text" name="variants[${variantIndex}].gallery[${galleryIndex}]" class="form-control">
                <button class="remove remove-gallery btn-sm">×</button>
            </div>
        `;

        variantCard.querySelector(".gallery").insertAdjacentHTML("beforeend", galleryHTML);
    }

    removeGalleryImage(button) {
        button.closest(".col-md-3").remove();
    }

    addSpec() {
        const index = document.querySelectorAll(".spec-category").length;

        const specHTML = `
            <div class="spec-category box border p-3 mb-3 position-relative" data-index="${index}">
                <button class="remove remove-spec position-absolute" type="button">×</button>

                <label class="form-label">קטגוריה</label>
                <input type="text" name="specs[${index}].category" class="form-control">

                <label class="form-label">תמונה</label>
                <input type="text" name="specs[${index}].image" class="form-control">
                <img src="" width="100" class="img-thumbnail mt-2">

                <h5 class="mt-3">פריטים</h5>
                <button type="button" class="btn btn-primary btn-sm add-spec-item">➕ הוסף פריט</button>
                <div class="spec-items"></div>
            </div>
        `;

        this.container.querySelector("#specs").insertAdjacentHTML("beforeend", specHTML);
    }

    removeSpec(button) {
        button.closest(".spec-category").remove();
    }

    addSpecItem(button) {
        const specCategory = button.closest(".spec-category");
        const specIndex = specCategory.getAttribute("data-index");
        const itemIndex = specCategory.querySelectorAll(".spec-item").length;

        const itemHTML = `
            <div class="spec-item box border p-2 mb-2">
                <button class="remove remove-spec-item" type="button">×</button>

                <label class="form-label">תווית</label>
                <input type="text" name="specs[${specIndex}].items[${itemIndex}].label" class="form-control">

                <label class="form-label">ערך</label>
                <input type="text" name="specs[${specIndex}].items[${itemIndex}].value" class="form-control">

                <label class="form-label">אייקון</label>
                <input type="text" name="specs[${specIndex}].items[${itemIndex}].icon" class="form-control">
                <img src="" width="50" class="img-thumbnail mt-2">
            </div>
        `;

        specCategory.querySelector(".spec-items").insertAdjacentHTML("beforeend", itemHTML);
    }

    removeSpecItem(button) {
        button.closest(".spec-item").remove();
    }

    async submitForm(form) {
        const formData = new FormData(form);
        const jsonData = Object.fromEntries(formData);
        console.log(jsonData)

        try {
            const response = await axios.post(`/api/v1/product/updateScooter/${jsonData.id}`, jsonData, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data.success) {
                showAlert('השינויים נשמרו בהצלחה!', 4000, 'עריכת מוצר', 'success');
            } else {
                showAlert('תקלה!', 4000, 'שגיאה! נסה שוב');
            }
        } catch (error) {
            console.error("Error:", error);
            showAlert(`${error}`, 4000, 'שגיאה! נסה שוב');
        }
    }
}
