


import axios from 'axios';
import { extractFormData, handleSubmitWithButtonControl } from './helpers';
import { showAlert } from './alerts';
import { CartPriceManager } from './CartPriceManager';


export function setupShippingMethodToggle() {
  const deliveryHome = document.getElementById('deliveryHome');
  const pickupSelf = document.getElementById('pickupSelf');
  const shippingAddressSection = document.getElementById('shippingAddressSection');
  const deliveryPriceElement = document.getElementById('del-price');
  const totalPriceElement = document.getElementById('total-price');

  if (
    !deliveryHome ||
    !pickupSelf ||
    !shippingAddressSection ||
    !deliveryPriceElement ||
    !totalPriceElement
  ) {
    console.warn("⚠️ Missing elements for shipping method toggle.");
    return;
  }

  //  Extract the original total price from the HTML
  const baseTotalPrice = parseFloat(
    totalPriceElement.textContent.replace(/[^\d.-]/g, '')
  );

  const formatter = new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
  });

  // const updateDeliveryText = () => {
  //   if (deliveryHome.checked) {
  //     const shippingCost = parseFloat(deliveryHome.dataset.shippingCost || 0);

  //     shippingAddressSection.classList.remove('d-none');
  //     deliveryPriceElement.textContent = formatter.format(shippingCost);;
  //     totalPriceElement.textContent = formatter.format(baseTotalPrice + shippingCost);
  //   } else {
  //     shippingAddressSection.classList.add('d-none');
  //     deliveryPriceElement.textContent = 'איסוף עצמי';
  //     totalPriceElement.textContent = formatter.format(baseTotalPrice);
  //   }
  // };



const updateDeliveryText = () => {
  const currentBasePrice = parseFloat(
    totalPriceElement.dataset.basePrice || 0
  );

  if (deliveryHome.checked) {
    const shippingCost = parseFloat(
      deliveryHome.dataset.shippingCost || 0
    );

    shippingAddressSection.classList.remove('d-none');

    deliveryPriceElement.textContent =
      shippingCost === 0
        ? 'משלוח חינם'
        : formatter.format(shippingCost);

    totalPriceElement.textContent = formatter.format(
      currentBasePrice + shippingCost
    );
  } else {
    shippingAddressSection.classList.add('d-none');
    deliveryPriceElement.textContent = 'איסוף עצמי';
    totalPriceElement.textContent = formatter.format(currentBasePrice);
  }
};

  document.querySelectorAll('input[name="shipping_method"]').forEach((input) => {
    input.addEventListener('change', updateDeliveryText);
  });


  updateDeliveryText();
}


async function handleCheckoutSubmission(event) {
  event.preventDefault();

  const form = event.target;
  const formData = extractFormData(form);
  console.log(formData)

  // שליפת המחיר הכולל העדכני (כולל משלוח) מה-HTML כדי לשדר למטא
  let totalValue = 0;
  const totalPriceElement = document.getElementById('total-price');
  if (totalPriceElement) {
    totalValue = parseFloat(totalPriceElement.textContent.replace(/[^\d.-]/g, '')) || 0;
  }

  await handleSubmitWithButtonControl(
    form,
    'מעבד הזמנה...',
    'המשך לתשלום',
    async () => {
      try {
        const response = await axios.post('/api/v1/orders/checkout', formData);

        console.log('✅ Checkout Success:', response.data.data);
        
        // --------------------------------------------------
        // שידור אירוע AddShippingInfo למטא
        // --------------------------------------------------
        if (typeof fbq === 'function') {
          fbq('track', 'AddShippingInfo', {
            value: totalValue,          // השווי הכולל של העגלה כולל המשלוח שנבחר
            currency: 'ILS',            // המטבע
            // אם יש לך מערך של מזהי מוצרים זמין, עדיף להוסיף אותו:
            // content_ids: window.cartContentIds || [], 
            content_type: 'product'
          });
          console.log(`📈 Meta Pixel AddShippingInfo fired. Value: ${totalValue}`);
        }

        if(response.data.data.redirectUrl) {
          window.location.href = response.data.data.redirectUrl;
        } else {
          window.location.href = `/payment/${response.data.data.data}`;
        }
      } catch (error) {
        console.error('❌ Error processing checkout:', error);
        showAlert(error.response?.data?.message || 'שגיאה בביצוע התשלום', 4000, 'שגיאה');
      }
    }
  );
}


export function initCheckoutForm() {
  const checkoutForm = document.getElementById('checkoutForm');
  const priceForm = document.getElementById('adminUpdatePricesForm');

  if (checkoutForm) {
    setupShippingMethodToggle();
    checkoutForm.addEventListener('submit', handleCheckoutSubmission);
  }

  if (priceForm) {
    const cartPriceManager = new CartPriceManager('adminUpdatePricesForm');
    cartPriceManager.init();
  }

  if (!checkoutForm && !priceForm) {
    console.error("No checkout/admin forms found.");
  }
}