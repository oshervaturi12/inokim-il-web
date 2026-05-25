import axios from "axios";

async function updateCartCount() {
    try {
        const response = await axios.get("/api/v1/carts/count");
        const cartCount = response.data.count;

        // Find the cart button
        const cartButton = document.querySelector("#topmenucart .num");
        if (cartButton) {
            cartButton.textContent = cartCount > 0 ? cartCount : "0";
        }
    } catch (error) {
        console.error("Failed to fetch cart count:", error);
    }
}

// Only run if #topmenucart exists
if (document.querySelector("#topmenucart")) {
    updateCartCount();
}

export default updateCartCount;
