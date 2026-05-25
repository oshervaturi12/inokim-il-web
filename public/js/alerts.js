

let alertIdCounter = 0;

export const showAlert = (msg, duration = 3000, headerMsg="", status="bad" ) => {
  const currentAlertId = '_alert' + alertIdCounter++;
  const isSuccess = status === "success";
  const backgroundColor = isSuccess ? "#09e93d" : "#dc3545"; 

  const svgContent = isSuccess ? 
  `<svg id="Layer_1" height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><g id="SUCCESS"><path d="m256 0c-141.38 0-256 114.58-256 256s114.62 256 256 256 256-114.65 256-256-114.62-256-256-256z" fill="#2ad352"/><path d="m0 256a254.87 254.87 0 0 0 30.49 121.23 278.76 278.76 0 0 0 78.73 11.29c153.9 0 278.66-124.76 278.66-278.66a278.7 278.7 0 0 0 -11.64-79.94 254.86 254.86 0 0 0 -120.24-29.92c-141.38 0-256 114.58-256 256z" fill="#74da7f"/><path d="m402 213.58-153.87 161.59a45.16 45.16 0 0 1 -32.48 14h-.2a45.11 45.11 0 0 1 -32.4-13.71l-81.65-84.1a45.14 45.14 0 1 1 64.78-62.87l48.95 50.42 121.49-127.58a45.14 45.14 0 1 1 65.38 62.25z" fill="#fff"/></g></svg>` :
  `<svg height="512" viewBox="0 0 128 128" width="512" xmlns="http://www.w3.org/2000/svg"><g><path d="m57.362 26.54-37.262 64.535a7.666 7.666 0 0 0 6.639 11.5h74.518a7.666 7.666 0 0 0 6.639-11.5l-37.258-64.535a7.665 7.665 0 0 0 -13.276 0z" fill="#ee404c"/><g fill="#fff7ed"><rect height="29.377" rx="4.333" width="9.638" x="59.181" y="46.444"/><circle cx="64" cy="87.428" r="4.819"/></g></g></svg>`;


  const style = document.createElement('style');
  style.innerHTML = `
    #${currentAlertId}.timer:before {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      background: ${backgroundColor};
      height: 0.3em;
      width: 0;
      animation: width linear;
      animation-duration: ${duration}ms; 
      animation-play-state: running;
      z-index:9999;
    }

    @keyframes width {
      from {
        width: 0;
      }
      to {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(style);

  const alertEl = document.createElement('div');
  alertEl.classList.add('alert', status, 'open', 'timer');
  alertEl.id = currentAlertId;
  alertEl.style.animationDuration = `${duration}ms`;
  alertEl.innerHTML = `<svg viewBox="0 0 40 40" class="close-al"><path d="M10 10l20 20m0-20L10 30"></path></svg>
  <div class="alert-body">
        <div class="alert-icon">
           ${svgContent}
        </div>
        <div>
            <div class="header-alert">${headerMsg}</div>
               <div class="alert-body-msg">
                ${msg}
           </div>
        </div>
    </div>`;

  const close = alertEl.querySelector('.close-al');
  close.addEventListener('click', () => {
    hideAlert(alertEl, style);
  });

  document.getElementById('alerts').appendChild(alertEl);

  window.setTimeout(() => {
    hideAlert(alertEl, style);
  }, duration);
};

const hideAlert = (alertEl, style) => {
  alertEl.remove();
  style.remove();
};


