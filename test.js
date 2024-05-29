form.addEventListener('submit', (event) => {
    event.preventDefault();
  
    if (!isSaveClicked) {
      // Show validation message
      document.getElementById('validationMessage').textContent = 'Please save the image first.';
      return; // Exit the function if Save button is not clicked
    }
  
    const formData = new FormData(form);
  
    // Append cropped image Blobs to FormData
    croppedImageBlobs.forEach((blob, index) => {
      formData.append(`croppedImages[${index}]`, blob, `croppedImage${index}.jpeg`);
    });
  
    // Submit the form data via AJAX or standard form submission
    // (Assuming you're using AJAX for form submission)
    fetch('/your-post-route', {
      method: 'POST',
      body: formData
    }).then(response => {
      if (response.ok) {
        window.location.href = "/admin/productmanagement";
      } else {
        document.getElementById('validationMessage').textContent = 'Error submitting the form.';
      }
    }).catch(error => {
      console.error('Error:', error);
      document.getElementById('validationMessage').textContent = 'Error submitting the form.';
    });
  
    // Optionally, reset the croppers and containers
    resetCroppersAndContainers();
  });
  