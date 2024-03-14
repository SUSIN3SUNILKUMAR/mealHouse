const User = require("../models/userModel");
const Product = require("../models/productModel");

const Category = require("../models/categoryModel");



const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();



module.exports = {
  getLogin: (req, res) => {
    console.log('reached the login route')
    if (req.session.userId) {
   
      res.redirect("/userHome");
    } else { 
      res.render("userViews/userLogin",{message:null});
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
                console.log("this is the user name", req.session.userName);
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



      console.log('reached the gethome page')
      res.render("userViews/userHome",{products,userId});
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to get homepage. Please try again.");
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
    console.log('this is the postRegistration')
    const { username, email, password } = req.body;
    req.session.data = req.body;
    console.log(username,email,password)

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
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
      console.log('validating the email')
      if (!emailPattern.test(email)) {
        res.render("userViews/userSignup", { message: "Email not valid!" });
      } else {
        const data = await User.findOne({ email: email });
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
            console.log(`This is the otp: ${otp}`)
            // console.log(process.env.EMAIL_USER)
            // console.log(process.env.EMAIL_PASSWORD)
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
          res.render("userViews/userSignup", { message: "Email already exist!" });
        }
      }
    }
  },

  resendOtp: async (req, res) => {
    const data = req.session.data;

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
      // console.log(process.env.EMAIL_USER)
      // console.log(process.env.EMAIL_PASSWORD)
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
        console.log("Email sentagain:", info.response);
      });
    };
    const otp = generateOTP(6);
    req.session.otp = otp;
    await sendOtpEmail(data.email, otp);
    res.redirect("/otpVerification");
  },

  getOtpVerification: (req, res) => {
    try {
      const {email} = req.session.data
      console.log(`This is the email ${email}`)
      res.render("userViews/otpVerification",{message:null,email});
    } catch (err) {
      console.log(err);
    }
  },
 
  postOtpVerification : async (req, res) => {
    const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
    const enteredOtp = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;
    const otp = req.session.otp;
    console.log(`This is the OTP from postotp ${otp}`);

    if (enteredOtp === otp) {
        const userData = req.session.data;

        const newUser = new User({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            isBlocked: false,
        });

        // Save the new user to the database
        newUser.save()
            .then(savedUser => {
                // Set the session with the user ID from the saved user
                req.session.userId = savedUser._id; // Assuming the user ID field in your model is "_id"
                console.log('Set req.session.userId = savedUser._id');

                res.redirect("/");
            })
            .catch(err => {
                // Handle the error if the user couldn't be saved
                console.error('Error saving user to the database:', err);
                res.render("userViews/otpVerification", { message: "Error saving user. Please try again.",email:userData.email });
            });
    } else { 
        res.render("userViews/otpVerification", { message: "OTP is incorrect! Try again.",email:req.session.data.email});
    }
}
};
