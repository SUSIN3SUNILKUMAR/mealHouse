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