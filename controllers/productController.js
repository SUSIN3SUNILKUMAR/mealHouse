const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const path   = require('path');
const fs = require('fs'); 


module.exports = {


  getProductManagement: async (req, res) => {
    try {
      
      const products = await Product.find({}).populate("category");
     
      res.render("adminViews/productManagement", { products });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get products. please try again");
    }
  },
  getAddProduct: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render("adminViews/addProduct", { categories });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error getting addproduct page");
    }
  },


  postAddProduct: async (req, res) => {
    const { productname, category, price, description,Stock, isListed, croppedImages } = req.body;
  
   
  console.log("body",req.body)
    
  
    const newProduct = new Product({
      productname: productname,
      category: category,
      price: price,
      
      description: description,
      image:croppedImages|| [], // Now imagePathForDB is accessible here
      stock: Stock,
      isListed: isListed,
    });
  
    try {
      await newProduct.save(); // Await saving the new product to the database
      res.redirect("/admin/productmanagement");
    } catch (error) {
      console.error('Error saving product to database:', error);
      return res.status(500).send('Error saving product to database');
    }
  }
  
,


  getEditProduct: async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.params.id }).populate(
        "category"
      );
     
      console.log("this is a product Catogory",product.category)
      console.log('this is a product Image',product.image)
      const categories = await Category.find().ne('_id',product.category._id);
     
      
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
