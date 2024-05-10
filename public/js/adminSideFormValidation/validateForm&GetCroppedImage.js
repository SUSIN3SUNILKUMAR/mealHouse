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