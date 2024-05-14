window.onload = function() {
    const imagePreview = document.getElementById("image-preview");
    const imageInput = document.getElementById("img");
    const imagePreviewContainer = document.querySelector(".image-preview-container");

    let cropper;
    console.log("this is below the cropper declaratoin ... within the window.onload")

    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        imagePreviewContainer.style.display = "block";
        console.log("this is the image called file: ", file);
        const reader = new FileReader();
        reader.onload = () => {
          if (cropper) {
            cropper.destroy();
          }
          imagePreview.src = reader.result;
           console.log('this is the image previedw of cropper instance', imagePreview)
          cropper = new Cropper(imagePreview, { 
          
            aspectRatio: 1, // Set the desired aspect ratio for cropping
            viewMode: 2, // Set the view mode (0: no restrictions, 1: horizontal, 2: vertical, 3: both)
            guides: true, // Show crop guides
            autoCropArea: 1, // Set the initial crop area size (0 to 1)
            movable: true, // Enable moving the crop box
            zoomable: true, // Enable zooming
            rotatable: true, // Enable rotation
            scalable: true, // Enable scaling
            cropBoxMovable: true, // Enable moving the crop box
            cropBoxResizable: true, // Enable resizing the crop box  
          });
        };
        
        reader.readAsDataURL(file);
      }
    });
    function getCroppedImage() {
    
    console.log("the getCroppedImage function reached");
    if (cropper) {
      console.log("inside the if condition")
      const croppedCanvas = cropper.getCroppedCanvas();
      const croppedImageData = croppedCanvas.toDataURL("image/jpeg");
      document.getElementById("fData").value = croppedImageData;
      console.log("Cropped Image Data:", croppedImageData);
      return true;
    }
    console.log("No cropper instance found.");
    return false;
  } 

  const form = document.querySelector("form");
 
 form.addEventListener("submit", (event) => {
   if (!validateForm()) {
     console.log("inside the if function") 
     event.preventDefault(); // Prevent form submission if validation fails
   } else {
     console.log("inside else function")
     if (getCroppedImage()) {
       // If image cropping is successful, proceed with form submission
       console.log("REACHED INSIDE THE GETCROPPEDIMAGE FUNCTION"); 
       return true;
     } else {
       event.preventDefault(); // Prevent form submission if image cropping fails
     }
   }
 });  
  };
