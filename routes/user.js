const express = require('express')
const router = express.Router()
const User = require("../models/userModel");
const controller = require('../controllers/userController')
const nocache = require('nocache')
router.use(nocache())

const checkSessionAndBlocked = async (req, res, next) => {
    if (req.session.userId) {
      const userDetials = await User.findOne({ _id: req.session.userId });
      if (!userDetials.isBlocked) {
        // User is not blocked, proceed to the next middleware or route handler
        next();
      } else {
        // User is blocked, destroy the session and redirect
        req.session.destroy((err) => {
          if (err) {
            console.log("Error destroying session: ", err);
            res.redirect("/");
          } else {
            res.redirect("/");
          }
        }); 
      }
    } else {
      // No userId in session, redirect to the default page
      res.redirect("/");
    }
  };

router.get('/', controller.getLogin)
router.post('/', controller.postLogin)

router.get('/userHome', checkSessionAndBlocked, controller.getHome)

router.get('/userSignup', controller.getRegistration)
router.post('/userSignup', controller.postRegistration)

router.get('/otpVerification', controller.getOtpVerification)
router.post('/otpVerification', controller.postOtpVerification)
router.get('/logout', controller.getLogout)



module.exports = router  