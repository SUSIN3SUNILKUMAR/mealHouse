const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");


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
      console.log("reached product get route")
      const products = await Product.find({}).populate("category");
      console.log('pr list',products);
      res.render("adminViews/productManagement", { products });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get products. please try again");
    }
  },

  postAddProduct: async (req, res) => {
    const { productname, category, price, model, discription, rating, stock } =
      req.body;
    const newProduct = new Product({
      productname: productname,
      category: category,
      price: price,
      model: model,
      description: discription,
      image: req.files.map((file) => file.path.substring(6)),
      stock: stock,
      isListed: true,
    });

    newProduct.save();
    res.redirect("/admin/productmanagement");
  },

  getEditProduct: async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.params.id }).populate(
        "category"
      );
      const categories = await Category.find();
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

};
