const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const path   = require('path');
const fs = require('fs'); 


module.exports = {

  getAddProduct: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render("adminViews/addProduct", { categories });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error getting addproduct page");
    }
  },

  getProductManagement: async (req, res) => {
    try {
      
      const products = await Product.find({}).populate("category");
     
      res.render("adminViews/productManagement", { products });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get products. please try again");
    }
  },

  postAddProduct: async (req, res) => {
    const { productname, category, price, model, description, rating, stock ,isListed,fData } =
      req.body;
      

     console.log('the cropped image data',fData)
     
    if (fData) {
      console.log("reached inside the cropped image if condition")
      
        try {
            // Save the cropped image data to the file system or a storage service
            // Example: Save the cropped image data to a file
            const imageBuffer = Buffer.from(fData.split(',')[1], 'base64');
            const imagePath = path.join('public', 'uploads', `${Date.now()}-product-image.jpg`);
            fs.writeFileSync(imagePath, imageBuffer);

            // Add the image path to the product data
           
        } catch (err) {
            console.error('Error saving cropped image:', err);
            // You can also return an error response to the client  
            return res.status(500).send('Error saving cropped image');
        }
    }
  

    const newProduct = new Product({
      productname: productname,
      category: category,
      price: price,
      model: model,
      description: description,
      image: fData ,  
      stock: stock,
      isListed: isListed,
    });


    newProduct.save();
    res.redirect("/admin/productmanagement");
  },



  getEditProduct: async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.params.id }).populate(
        "category"
      );
      console.log('this is the product', product)
      const categories = await Category.find().ne('_id',product.category._id);
      console.log('this is the category',categories)
      
      res.render("adminViews/editproduct", { product, categories });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get product edit page.");
    }
  },

  postEditProduct: async (req, res) => {
    const id = req.params.id;
    const image = req.files.map((file) => file.path.substring(6));
   
    const product = await Product.findById(id)
    product.productname = req.body.productname;
    product.category = req.body.category;
    product.price = req.body.price;
    product.model = req.body.model;
    product.description = req.body.description;
    product.stock = req.body.stock;
    product.isListed = req.body.isListed;
    if(image.length > 0){
      image.forEach(file => {
        product.image.push(file)
      })
    }
    await product.save()
   
    res.redirect("/admin/productmanagement");
  },

  getUnlistProduct: async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    try {
      product.isListed = !product.isListed;
      product.save();
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error changing product status");
    }
    res.redirect("/admin/productmanagement");
  },

  getUnlistProduct: async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    try {
      product.isListed = !product.isListed;
      product.save();
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error changing product status");
    }
    res.redirect("/admin/productmanagement");
  },


  getDeleteImage: async (req, res) => {
    try {
      const id = req.body.productid;
      const index = req.body.index;
      const product = await Product.findById(id);
      product.image.splice(index, 1)
      await product.save()
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the page.");
    }
  },

};
