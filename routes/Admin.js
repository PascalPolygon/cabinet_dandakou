var express = require("express");
var router = express.Router();
const Admin = require("../models/Admins");//Admin model
const bcrypt = require("bcryptjs");
const passport = require('passport');
const { ensureAuthenticated } = require("../config/auth");

router.get("/", function(req, res, next) {
  res.render("Admin", { title: "Sign in" });
});

router.get("/login", function(req, res, next) {
  res.render("login", { title: "Sign in" });
});

router.get("/register", function(req, res, next) {
  res.render("register", { title: "Register" });
});

//Dashboard
router.get('/dashboard', ensureAuthenticated, function(req, res){
  res.render('dashboard', {
    title: "Admin dashboard",
    admin: req.user.firstName + ' ' + req.user.lastName
  });
});


//Register POST
router.post("/register", function(req, res, next) {
  console.log(req.body);
  // res.send("hello");

  const { firstName, lastName, email, password } = req.body;
  // console.log(firstName);
  // console.log(lastName);
  // console.log(email);
  // console.log(password);

  let errors = [];

  //check required fields
  if (!firstName || !lastName || !email || !password) {
    errors.push({ msg: "Please fill in all fields" });
  }

  //Check pass length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    console.log(errors);
    res.render("register", {
      title: "Register",
      errors,
      firstName,
      lastName,
      email,
      password
    });
  } else {
    //Validation passed
    Admin.findOne({email: email}) //making sure admin does not already exists
      .then(function(user) {
        if(user){
          //user exists
          errors.push({msg: 'Email is already registered'});
          res.render("register", {
            title: "Register",
            errors,
            firstName,
            lastName,
            email,
            password
          });
        } else {
          const newAdmin = new Admin({
            firstName, //shorthand for firstName: lastName
            lastName,
            email,
            password
          });

          // Hash Password
          bcrypt.genSalt(10, function (err, salt){
            bcrypt.hash(newAdmin.password, salt, function (err, hash){
              if (err) throw err;
              newAdmin.password = hash;
              newAdmin.save()
                .then(function (user){
                  req.flash('success_msg', 'You are now registed and can log in');
                  res.redirect('/Admin/login')
                })
                .catch(function (err){
                  console.log(err)
                })
            });
          });
        }
      });
  }
});

// Login Handle
router.post('/login', function(req, res, next){
  console.log('authenticating...');
  passport.authenticate('local', {
    successRedirect: '/Admin/dashboard',
    failureRedirect: '/Admin/login',
    failureFlash: true
  })(req, res, next);
});

//Logout Handle
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/Admin/login');
})
module.exports = router;
