var express = require("express");
var router = express.Router();
const Admin = require("../models/Admins");//Admin model
const Content = require("../models/Content"); //Content model 
const bcrypt = require("bcryptjs");
const passport = require('passport');
const { ensureAuthenticated } = require("../config/auth");
const tools = require('../tools');
// const mongoose = require('mongoose');
// const conn = mongoose.connection;

router.get("/", function(req, res, next) {
  res.render("Admin", { title: "Sign in" });
});

router.get("/login", function(req, res, next) {
  res.render("login", { title: "Sign in" });
});

router.get("/register", function(req, res, next) {
  res.render("register", { title: "Register" });
});

// function escapeHTMLtag(str, tag){
//   var start_delimiter = '<'+tag+'>';
//   var end_delimiter = '</'+tag+'>';
//   str = str.split(start_delimiter);
//   str = str[1].split(end_delimiter);
//   var myStr = str[0];
//   console.log(myStr);
//   return myStr;
// }

//Dashboard
router.get('/dashboard', ensureAuthenticated, function(req, res){
  // var business_name = '';
  Content.find({}, function (err, content){
    if (err) throw new err();
    if (!content)
      console.log('No content found on dashboard get');
    else{
      console.log('Content found on dashboard get: ');
      console.log(content);
      // console.log(content[0].title);
      var business_name = content[0].title;
      console.log('business_name: ' + business_name);
      if (business_name[0] == '<') //Check if you need to escape it. (p tags are only added if you edit)
        business_name = tools.escapeHTMLtag(business_name, 'p');
      
      // console.log('business_name: ' + business_name);
      res.render('dashboard', {
        title: "Admin dashboard",
        admin: req.user.firstName + ' ' + req.user.lastName,
        business_name,
        // save_success: "Website updated!"
      });
    }
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
            firstName, //shorthand for firstName: firstName
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
});

router.post('/dashboard', function(req, res){

  var business_name = req.body.content;
  console.log('Content: ');
  console.log(business_name);
  //  const newContent = new Content({
  //    title: content
  //  });
   
  //  newContent
  //    .save()
  //    .then(function(content) {
  //      console.log('New content in!');
  //      console.log(content);
  //     //  req.flash("success_msg", "You are now registed and can log in");
  //     //  res.redirect("/Admin/login");
  //    })
  //    .catch(function(err) {
  //      console.log('Failure saving new conting');
  //      console.log(err);
  //    });
  Content.updateOne(
    {},
    {
      $set: { title: business_name }
    },
    function(err, content) {
      if (err) throw new err();
      if (!content) console.log("No content found");
      else {
        // console.log(content);
        console.log("Content was successfully updated");
        res.json({ success: true });
      }
    }
  );
})
module.exports = router;
