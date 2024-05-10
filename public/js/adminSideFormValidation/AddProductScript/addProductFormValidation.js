

function validateForm() {
  let isValid = true;

  const productname = document.getElementById("productname").value.trim();
  const category = document.getElementById("category").value.trim();
  const price = document.getElementById("price").value.trim();
  const description = document.getElementById("description").value.trim();
  const image = document.getElementById("img").files[0];
  const stock = document.getElementById("stock").value.trim();

  // Product Name validation
  if (productname === "") {
    document.getElementById("productnameError").innerText =
      "Please enter the product name";
    isValid = false;
  } else {
    document.getElementById("productnameError").innerText = "";
  }

  // Category validation
  if (category === "") {
    document.getElementById("categoryError").innerText =
      "Please enter the category";
    isValid = false;
  } else {
    document.getElementById("categoryError").innerText = "";
  }

  // Price validation
  if (price === "") {
    document.getElementById("priceError").innerText =
      "Please enter the price";
    isValid = false;
  } else if (parseInt(price) <= 0) {
    document.getElementById("priceError").innerText =
      "Price should be greater than 0";
    isValid = false;
  } else {
    document.getElementById("priceError").innerText = "";
  }

  // Description validation
  if (description === "") {
    document.getElementById("descriptionError").innerText =
      "Please enter the description";
    isValid = false;
  } else {
    document.getElementById("descriptionError").innerText = "";
  }

  // Image validation
  if (!image) {
    document.getElementById("imgError").innerText =
      "Please add the image";
    isValid = false;
  } else {
    document.getElementById("imgError").innerText = "";
  }

  // Stock validation
  if (stock === "") {
    document.getElementById("stockError").innerText =
      "Please add the stock";
    isValid = false;
  } else {
    document.getElementById("stockError").innerText = "";
  }

  return isValid;
}


