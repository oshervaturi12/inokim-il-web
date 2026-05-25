export default function initTinyMCE() {
    const textarea = document.querySelector('textarea#content');
    if (!textarea || !window.tinymce) {
      console.warn('TinyMCE not loaded or #content not found');
      return;
    }
  
    tinymce.init({
      selector: 'textarea#content',
      directionality: 'rtl',
      language: 'he_IL',
      height: 400,
      plugins: 'code link image lists table fullscreen media wordcount',
      toolbar: 'undo redo | styles | bold italic underline | alignright aligncenter alignleft | bullist numlist | link image media | code fullscreen',
      menubar: false,
      branding: false,
      content_style: `
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size:16px; }
      `
    });
  }
  