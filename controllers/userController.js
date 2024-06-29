const User = require("../models/userModel");
const Product = require("../models/productModel");


const Category = require("../models/categoryModel");



const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();



module.exports = {
  getLogin: (req, res) => {
    
    if (req.session.userId) {
   
      res.redirect("/userHome");
    } else { 
      const message = req.flash('error')
      res.render("userViews/userLogin",{message});
    }
  },

  getLogout: (req, res) => {
    try {
     
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          res.status(500).send("Error logging out");
        } else {
          res.redirect("/");
        }
      });
    } catch (err) {
      console.error("Error in getLogout:", err);
      res.status(500).send("Error occurred during login. Please try again.");
    }
  },

  postLogin: async (req, res) => {
    const { email, password } = req.body;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^.{1,}$/;

    // Check if email and password meet the required patterns
    if (!emailPattern.test(email) || !passwordPattern.test(password)) {
        return res.render("userViews/userLogin", {
            message: "Email and password should be valid!"
        });
    }

    try {
        const user = await User.findOne({ email: email });

        // If user not found, render with a message to sign up
        if (!user) {
            return res.render("userViews/userLogin", {
                message: "Email not found. Please sign up!"
            });
        }

        // Checking password match
        if (password === user.password) {
            if (!user.isBlocked) {
                // Adding session details
                req.session.userId = user._id;
                req.session.userName = user.username;
                
                return res.redirect("/userhome");
            } else {
                return res.render("userViews/userLogin", {
                    message: "This account is blocked!"
                });
            }
        } else {
            return res.render("userViews/userLogin", {
                message: "Login failed. Incorrect password!"
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("Error in login.");
    }
}
,

  getHome: async (req, res) => {
    try {
      const userId = req.session.userId;
      const products = await Product.find({
        isListed: true,
        stock: {$gt:0}
      })



      
      res.render("userViews/userHome",{products,userId});
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get homepage. Please try again.");
    }
  },


  getProduct: async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.params.id });
      const category = await Category.findOne({ _id: product.category })
     
      res.render("userViews/productPreview", { product, userId: req.session.userId });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get productpage.");
    }
  },

  getRegistration: (req, res) => {
    try {
      res.render("userViews/userSignup",{message:null});
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get registratiion.");
    }
  },

  postRegistration: async (req, res) => {
   
    const { username, email, password } = req.body;
    req.session.data = req.body;
    

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const data = await User.findOne({ email: email });

    
    if (
      username === null ||
      username.trim() === "" ||
      password === null ||
      password.trim() === ""
    ) {
      res.render("userViews/userSignup", {
        message: "Enter valid username and password!",
      });
    } else {
      
      if (!emailPattern.test(email)) {
        res.render("userViews/userSignup", { message: "Email not valid!" });
      } else {
        if (data == null) {
          //OTP generator
          const generateOTP = (length) => {
            const digits = "0123456789";
            let OTP = "";

            for (let i = 0; i < length; i++) {
              const randomIndex = crypto.randomInt(0, digits.length);
              OTP += digits[randomIndex];
            }

            return OTP;
          };

          //EmailSending
          const sendOtpEmail = async (email, otp) => {
           
           
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: email,
              subject: "One-Time Password (OTP) for Authentication  for ECart",
              text: `Your Authentication OTP is: ${otp}`,
            };

            
            

            transporter.sendMail(mailOptions, async (error, info) => {
              if (error) {
                return console.error("Error:", error);
              }
              console.log("Email sent:", info.response);


              
              
            });
          };

        
      
          const otp = generateOTP(6);
          req.session.otp = otp;
          await sendOtpEmail(email, otp);



          res.redirect("/otpVerification");
        } else {
          req.flash('error',`Email already exists. Please login with the email account: ${email}`)
          res.redirect("/")
        }
      }
    }
  },


  getOtpVerification: (req, res) => {
    try {
      const {email} = req.session.data
      
  
      
      res.render("userViews/otpVerification",{message:null,email});
    } catch (err) {
      console.log(err);
    }
  },
 
  postOtpVerification: async (req, res) => {
    const { otp } = req.body;
    const sessionOtp = req.session.otp;

    if (otp === sessionOtp) {
        const userData = req.session.data;

        const newUser = new User({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            isBlocked: false,
        });

        try {
            const savedUser = await newUser.save();

            // Set the session with the user ID from the saved user
            req.session.userId = savedUser._id; // Assuming the user ID field in your model is "_id"
            
            res.json({ success: true, redirectUrl: "/" });
        } catch (err) {
            // Handle the error if the user couldn't be saved
            console.error('Error saving user to the database:', err);
            res.json({ success: false, message: "Error saving user. Please try again." });
        }
    } else { 
        res.json({ success: false, message: "OTP is incorrect! reload and Try again." });
    }
}

};
