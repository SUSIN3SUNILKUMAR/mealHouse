const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

require("dotenv").config();

module.exports = {
  getLogin: (req, res) => {
    try {
      console.log("reached login route for admin")
      if (req.session.admin) {
        //Redirect to dashboard if authenticated
        res.redirect("/admin/dashboard");
      } else {
        res.render("adminViews/adminLogin", { message: null });
      }
    } catch (err) {
      console.error("Error in getLogout:", err);
      res.status(500).send("Error occurred during login. Please try again.");
    }
  },

  postLogin: (req, res) => {
   
    const { username, password } = req.body;
    const admin = {
      username: "susin",
      password: "admin",
    };

    if (username === admin.username && password === admin.password) {
      req.session.admin = admin.username;
      console.log('this is the admin name', req.session.admin)
      console.log('this is the user id ', req.session.userId)

      res.redirect("/admin/dashboard");
    } else {
      res.render("adminViews/adminLogin", { message: "login failed! try again" });
    }
  },

  getLogout: (req, res) => {
    try {
      console.log('reached inside the get logout of ADMIN side')
      console.log('user session ', req.session.userId)
      console.log('admin session id ', req.session.admin)
      req.session.destroy((err) => {
        if (err) {
          console.log("Error distroying session: ", err);
        } else {
          res.redirect("/admin/login");
        }
      });
    } catch (err) {
      console.error("Error in getLogout:", err);
      res.status(500).send("Error occurred during logout. Please try again.");
    }
  },



  getAdminDashboard: async (req, res) => {
    try {
      console.log("Reached the admin dashboard")
      res.render('adminViews/adminDashboard');

    } catch (error) {
      console.error('Error fetching and aggregating orders:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  getUserManagement: async (req, res) => {
    try {
      const users = await User.find();
      res.render("adminViews/adminUserManagement", { users });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch user data. Please try again.");
    }
  },

  getBlockUser: async (req, res) => {
    try {
      console.log("reached toggler")

      const user = await User.findOne({ _id: req.params.id });
      console.log(user)
      user.isBlocked = !user.isBlocked;
      user.save();
      res.redirect("/admin/usermanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to block user.");
    }
  },

  getCategoryManagement: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render("adminViews/categoryManagement", { categories });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch categories. Please try again.");
    }
  },




  getAddCategory: async (req, res) => {
    try {
      res.render("adminViews/addCategory",{placeholder:null});
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get category edit page.");
    }
  },

  postAddCategory: async (req, res) => {
    const newCategoryName = req.body.newcategoryname.trim().toLowerCase();

    try {
        // Check if the category already exists
        const checkingForSameCategoryInDB = await Category.findOne({ category: newCategoryName });

        if(newCategoryName === '') {
          return res.render("adminViews/addCategory", { placeholder: "Please enter a category name : )", message: "Please enter a category name" });

        }else if (checkingForSameCategoryInDB) {
            return res.render("adminViews/addCategory", { placeholder: "Please use another name : )", message: "Category name already exists, please choose another name" });
        } else {
            // Save the new category
            const newCategory = await Category.create({ category: newCategoryName });
            console.log("New category saved:", newCategory);
        }

        res.redirect("/admin/categorymanagement");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Failed to add category.");
    }
},



  getDeleteCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      await Category.findByIdAndDelete(categoryId);
      await Product.deleteMany({ category: categoryId });
      res.redirect("/admin/categorymanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete coupon.");
    }
  },



  getEditCategory: async (req, res) => {
    try {
      const id = req.params.id;
      const { category, _id } = await Category.findOne({ _id: id });


      res.render("adminViews/editCategory", { category, id,placeholder:null });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the category edit page.");
    }
  },


  postEditCategory: async (req, res) => {
    const id = req.params.id;
    

    const newcategoryname = req.body.newcategoryname.trim().toLowerCase();
    
    const gettingTheCategoryWithId = await Category.findOne({_id:id});
    const ifUserEnteredTheSameCategoryNameAgain = gettingTheCategoryWithId.category === newcategoryname


    const checkingForSameCategoryInDB = await Category.findOne({ category: newcategoryname })

    try {
      if(newcategoryname === '') {
        return res.render("adminViews/editCategory", {placeholder:"Please enter a category name : )", category:null,id:id, message: "Please enter a category name" })

      } else if(ifUserEnteredTheSameCategoryNameAgain){
        return res.render("adminViews/editCategory", {placeholder:"Same Name...!", category:null,id:id, message: "You have entered the same name again please go back if you don't want to change the name" })

      }else if   (checkingForSameCategoryInDB) {
      return  res.render("adminViews/editCategory", {placeholder:"Please use another name : )", category:null,id:id, message: "Category name already exists please choose another name" })
      } else {

       

        await Category.updateOne(
          { _id: id },
          { $set: { category: newcategoryname } }
        );

      }
      
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to edit category.");
    }
    res.redirect("/admin/categorymanagement");
  },
};
