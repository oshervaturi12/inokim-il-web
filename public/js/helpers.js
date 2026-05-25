
const timeout = function (s) {
    return new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error(`Request took too long! Timeout after 10 second`));
      }, s * 1000);
    });
  };
  



export const AJAX = async function (url, uploadData = undefined, method = 'GET') {
  try {
    const options = {
      method,
      headers: {}
    };

    if (uploadData) {
      if (uploadData instanceof FormData) {
        // When uploadData is a FormData object, let the browser set the correct headers
        options.body = uploadData;
      } else {
        // Otherwise, handle as JSON
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(uploadData);
      }
    }

    const fetchPro = fetch(url, options);
    const res = await Promise.race([fetchPro, timeout(20)]);
    const data = res.status !== 204 ? await res.json() : {};

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};




/**
 * Formats a number into Israeli Shekel currency.
 * @param {number} number - The value to be formatted.
 * @returns {string} The formatted currency string.
 */

export function formatToShekel(number) {
  const formatter = new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(number);
}
 

  /**
 * Toggles the 'show' class on two selectors based on a given state.
 * @param {Element} firstSelector - The first DOM element.
 * @param {Element} secondSelector - The second DOM element.
 * @param {Boolean} state - The state that decides which selector gets the 'show' class.
 */
export function toggleSelectors(firstSelector, secondSelector, state) {
  firstSelector.classList.toggle('show', state);
  secondSelector.classList.toggle('show', !state);
};
  
/**
 * Extracts data from a form element and filters out entries with null or empty values.
 * @param {HTMLFormElement} formElement - The form from which data is extracted.
 * @returns {Object} The filtered data in the form of an object.
 */

// export const extractFormData = (formElement) => {
//   const formData = new FormData(formElement);
//   const dataArr = [];

//   for (let element of formElement.elements) {
//     if (element.type === 'checkbox') {
//       dataArr.push([element.name, element.checked]);
//     } else if (element.name && formData.has(element.name)) {
//       dataArr.push([element.name, formData.get(element.name)]);
//     }
//   }

//   return Object.fromEntries(dataArr);
// };

export const extractFormData = (formElement) => {
  const formData = new FormData(formElement);
  const dataArr = [];

  for (let element of formElement.elements) {
    if (element.type === 'checkbox') {
      // Add checkbox value only if checked
      dataArr.push([element.name, element.checked]);
    } else if (element.name && formData.has(element.name)) {
      const value = formData.get(element.name);
      
      // Only push non-empty values
      if (value !== '' && value !== null && value !== undefined) {
        dataArr.push([element.name, value]);
      }
    }
  }

  return Object.fromEntries(dataArr);
};






/**
 * Toggles the 'open' class state of an element based on a stored state.
 * 
 * This function applies a visual state (open or closed) to an element based
 * on a string value ('open' or 'closed') retrieved from a storage.
 * This is useful, for instance, when you want to remember the state of 
 * certain UI elements across page reloads or sessions.
 *
 * @param {HTMLElement} element - The DOM element to which the state should be applied.
 * @param {string} state - A string value indicating the desired state. Accepts 'open' or 'closed'.
 */
export const applyToggleStateFromStorage = (element, state) => {
  if (state === 'open') {
      element.classList.add('open');
  } else if (state === 'closed') {
      element.classList.remove('open');
  }
};


export async function handleSubmitWithButtonControl(form, buttonTextDuringAction, buttonTextAfterAction, actionCallback) {
  const submitButton = form.querySelector('button[type="submit"]');
  let originalButtonText;
  let actionBtn;

  if(submitButton){
     originalButtonText = submitButton.textContent;
    submitButton.textContent = buttonTextDuringAction;
     submitButton.disabled = true;
  }else{
    actionBtn = document.querySelector('actionBtn');
    //  actionBtn.disabled = true;
  }

  
  try {
      await actionCallback();
  } catch (error) {
      console.error('Error:', error);
  } finally {
    if(submitButton){
       submitButton.disabled = false;
      submitButton.textContent = buttonTextAfterAction || originalButtonText;
    }else{
      //  actionBtn.disabled = false;
    }
    
  }
}





export function closeModal(modalId, bootstrap) {
  const modalElement = document.getElementById(modalId);
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) {
      modalInstance.hide();
  }
}


 export const updateQueryStringParameter = (key, value) => {
  const url = new URL(window.location.href);
  if (value === 'all') {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, value);
  }
  window.location.href = url.toString();
};


// Function to add a new dosage element to the DOM
export function addDosageToDOM(dosage, editMedForm) {
  const dosagesContainer = document.getElementById('dosages-row');
  const index = dosagesContainer.querySelectorAll('.col-4.position-relative').length;
  const medId = editMedForm.querySelector('input[name="medId"]').value;

  // Create the dosage element as a template literal
  const dosageElement = `
    <div class="col-4 position-relative" id="dosage-container-${index}">
      <input type="text" class="form-control" name="dosages[]" value="${dosage}" id="dosage-${index}">
      <a class="position-absolute btn top-0 start-100 translate-middle badge rounded-pill bg-dark delete-dosage" data-med-id="${medId}" data-dosage-index="${index}">
          <svg style="width: 1em;  height: 1em;  stroke: #fff; fill: #fff" viewBox="0 0 58 60" width="512" xmlns="http://www.w3.org/2000/svg"><g id="Page-1" fill="" fill-rule="evenodd"><g id="047---Delete" fill="" fill-rule="nonzero"><path id="Shape" d="m7.4531 57.2139c.24593878 1.6630605 1.7134602 2.868231 3.3926 2.7861h36.3086c1.6794712.0820715 3.147124-1.1236395 3.3926-2.7871l3.3841-42.307c2.5346757-.4790042 4.2880513-2.8088022 4.0466785-5.37702435-.2413728-2.56822213-2.3981392-4.5305278-4.9776785-4.52887565h-10.5195l-.6973-.8721c-2.0826643-2.61550816-5.246402-4.13586872-8.5898-4.1279h-8.3868c-3.3431613-.00816548-6.506675 1.5122644-8.5888 4.1279l-.6978.8721h-10.52c-2.5795393-.00165215-4.73630566 1.96065352-4.97767846 4.52887565-.2413728 2.56822215 1.51200281 4.89802015 4.04667846 5.37702435zm41.1-.1621c-.042.5234-.6689.9482-1.3984.9482h-36.309c-.73 0-1.3564-.4248-1.3984-.9473l-3.3643-42.0527h45.834zm-23.7465-55.0518h8.3868c2.556267-.00207043 4.9912341 1.08984308 6.69 3h-21.7655c1.6982162-1.91015689 4.1327983-3.00210992 6.6887-3zm-22.8066 8c.00181871-1.65610033 1.34389967-2.99818129 3-3h48c1.6568542 0 3 1.34314575 3 3 0 1.6568542-1.3431458 3-3 3h-48c-1.65610033-.0018187-2.99818129-1.3438997-3-3z"/><path id="Shape" d="m26 51c.5522847 0 1-.4477153 1-1v-27c0-1.1045695.8954305-2 2-2s2 .8954305 2 2c0 .5522847.4477153 1 1 1s1-.4477153 1-1c0-2.209139-1.790861-4-4-4s-4 1.790861-4 4v27c0 .5522847.4477153 1 1 1z"/><path id="Shape" d="m14 51c.5522847 0 1-.4477153 1-1v-27c0-1.1045695.8954305-2 2-2s2 .8954305 2 2c0 .5522847.4477153 1 1 1s1-.4477153 1-1c0-2.209139-1.790861-4-4-4s-4 1.790861-4 4v27c0 .5522847.4477153 1 1 1z"/><path id="Shape" d="m38 51c.5522847 0 1-.4477153 1-1v-27c0-1.1045695.8954305-2 2-2s2 .8954305 2 2c0 .5522847.4477153 1 1 1s1-.4477153 1-1c0-2.209139-1.790861-4-4-4s-4 1.790861-4 4v27c0 .5522847.4477153 1 1 1z"/></g></g></svg>
      </a>
    </div>
  `;

  // Insert the new dosage element into the DOM
  dosagesContainer.insertAdjacentHTML('beforeend', dosageElement);


}



// export function addGlobalEventListener(type, parentSelector, selector, callback) {
//   if(!parentSelector) return
//   const parent = parentSelector;
//   if (parent) {
//     parent.addEventListener(type, (e) => {
//       const targetElement = e.target.matches(selector) ? e.target : e.target.closest(selector);
//       if (targetElement) {
//         callback(e, targetElement);
//       }
//     });
//   }
// }

export function addGlobalEventListener(eventType, selector, callback, options = {}) {
  document.addEventListener(eventType, (event) => {
    const targetElement = event.target.closest(selector);
    if (targetElement) {
      callback(event, targetElement);
    }
  }, options);
}
