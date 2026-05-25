import axios from 'axios';
import { showAlert } from './alerts';
import { extractFormData, handleSubmitWithButtonControl, formatToShekel } from './helpers';


export class CouponManager {
  constructor(formId = 'couponForm', summaryId = 'cart-sum') {
    this.form = document.getElementById(formId);
    this.summaryContainer = document.getElementById(summaryId);
  }

  init() {
    if (!this.form || !this.summaryContainer) return;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      handleSubmitWithButtonControl(
        this.form,
        'מוסיף...',
        'הוסף קופון',
        async () => {
          await this.applyCoupon();
        }
      );
    });
  }

  async applyCoupon() {
    const { code, cartId } = extractFormData(this.form);

    try {
      const res = await axios.post('/api/v1/carts/apply-coupon', { code, cartId });
      const { cart } = res.data;

      showAlert('הקופון הוזן בהצלחה!', 4000, 'קופון', 'success');
      this.form.reset();
      this.renderSummary(cart, code);
      window.location.reload(); // Reload to update checkout data with new totals
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'התרחשה שגיאה בעת ניסיון להחיל את הקופון';
      showAlert(errorMessage, 6000, 'קופון', 'error');
      throw err; // rethrow so handleSubmitWithButtonControl knows it failed
    }
  }

  renderSummary(cart, code) {
    let rawTotal = 0;
    cart.items.forEach(item => {
      rawTotal += (item.price || 0) * (item.quantity || 1);
    });

    const couponHtml = cart.coupon
      ? `
        <li>
          <span>קופון</span>
          <span>${code} ( ${formatToShekel(cart.discount)} -)</span>
        </li>
      `
      : '';

    const updatedHtml = `
      <h2>סיכום ההזמנה</h2>
      <ul>
        <li>
          <span>מוצרים</span>
          <span>${formatToShekel(rawTotal)}</span>
        </li>
        ${couponHtml}
        <li>
          <span>משלוח</span>
          <span><span id="del-price">איסוף עצמי</span></span>
        </li>
        <li class="total">
          <span>סך הכל</span>
          <span><span id="total-price">${formatToShekel(cart.totalPrice)}</span></span>
        </li>
      </ul>
    `;

    this.summaryContainer.innerHTML = updatedHtml;
  }
}
