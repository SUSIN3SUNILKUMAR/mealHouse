const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminController");
const nocache = require("nocache");
const path = require('path')
const multer = require("multer");
router.use(nocache());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage }).single('img');

const checkSession = async (req, res, next) => {
  console.log("Reached the checkSession")
  if (req.session.admin) { 
    console.log("session found")
    next();
  } else {
    // No userId in session, redirect to the default page
    res.redirect("/admin/login");
   console.log("No session is found ")
  }
};

router.get("/login", controller.getLogin);
router.get("/logout", controller.getLogout);
router.post("/login", controller.postLogin);
router.get("/dashboard", checkSession, controller.getAdminDashboard);
router.get("/usermanagement",checkSession,controller.getUserManagement)
router.get("/toggler/:user._id",checkSession,controller.getToggler)
module.exports = router;
 