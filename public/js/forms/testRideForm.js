import axios from 'axios';
import { extractFormData, handleSubmitWithButtonControl } from '../helpers';
import { showAlert } from '../alerts';

export default function initDynamicForms(formClass = 'dynamic-form') {
  const forms = document.querySelectorAll(`.${formClass}`);


  if (!forms.length) return;

  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      handleSubmitWithButtonControl(
        form,
        'שולח...',
        'שליחה',
        async () => {
          const formData = extractFormData(form);

          try {
            const response = await axios.post('/api/v1/contact', formData);

            if (response.data.status === 'success') {
              showAlert('הפרטים נשלחו בהצלחה!', 4000, 'נחזור אליך בהקדם', 'success');
              form.reset();
            } else {
              showAlert('תקלה!', 4000, 'הייתה בעיה בשליחת הפרטים. נסה שוב מאוחר יותר');
            }
          } catch (error) {
            console.error('❌ Error submitting form:', error);
            showAlert('תקלה!', 4000, 'שגיאה בשליחת הטופס. אנא נסה שוב');
          }
        }
      );
    });
  });
}
