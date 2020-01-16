var express = require("express");
var router = express.Router();
const Admin = require("../models/Admins"); //Admin model
const Content = require("../models/Content"); //Content model 
const Images = require("../models/Images"); //Images model
const bcrypt = require("bcryptjs");
const passport = require('passport');
const { ensureAuthenticated } = require("../config/auth");
var multiparty = require('connect-multiparty')();
const fileStream = require("../fileStream"); //init stream for upload and download as well as create stream handle
require("dotenv").config();

//const imageStream = new fileStream(); // init stream for upload and download as well as create stream handle


router.post('/coverImageUpload', multiparty, function(req, res, next) {
    var coverImageFile = req.files.jumboImg;
    var filePath = coverImageFile.path;
    console.log('file path: ' + filePath);
    fileStream.uploadAndReplace(coverImageFile, 'Cover');
    res.redirect('/Admin/dashboard');

});

//route GET/ files/:filename
//@Desc display all files in JSON
router.get("/images/cover", function(req, res) {
    //let readstream;
    //Query images collection for cover image id
    Images.findOne({ imageType: 'Cover' }, function(err, imageRecord) {
        if (err) throw new err();
        if (!imageRecord) {
            return res.status(404).json({
                err: 'Could not find Cover image'
            });
            // TODO: Handle this to use image from images folder
        } else {
            console.log('Found cover image: ');
            console.log(imageRecord);
            // use id to query uploads and down stream cover image
            fileStream.download(imageRecord, res);
            //readstream.pipe(res);
        }
    });
});

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
router.get('/dashboard', ensureAuthenticated, function(req, res) {
    // var business_name = '';
    Content.find({}, function(err, result) {
        if (err) throw new err();
        if (!result)
            console.log('No content found on dashboard get');
        else {
            console.log('Content found on dashboard get: ');
            // console.log(result);
            // console.log(content[0].title);
            if (result[0] == null) {
                console.log('Content is null');
                result[0] = "Place holder";
            }

            //Terrible fix against null error;
            var content = JSON.parse(result[0].content);

            res.render('dashboard', {
                title: "Admin dashboard",
                admin: req.user.firstName + ' ' + req.user.lastName,
                content
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
        Admin.findOne({ email: email }) //making sure admin does not already exists
            .then(function(user) {
                if (user) {
                    //user exists
                    errors.push({ msg: 'Email is already registered' });
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
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(newAdmin.password, salt, function(err, hash) {
                            if (err) throw err;
                            newAdmin.password = hash;
                            newAdmin.save()
                                .then(function(user) {
                                    req.flash('success_msg', 'You are now registed and can log in');
                                    res.redirect('/Admin/login')
                                })
                                .catch(function(err) {
                                    console.log(err)
                                })
                        });
                    });
                }
            });
    }
});

// Login Handle
router.post('/login', function(req, res, next) {
    console.log('authenticating...');
    passport.authenticate('local', {
        successRedirect: '/Admin/dashboard',
        failureRedirect: '/Admin/login',
        failureFlash: true
    })(req, res, next);
});

//Logout Handle
router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/Admin/login');
});

router.post('/dashboard', function(req, res) {

    var content = req.body.content;
    // var content = JSON.parse(req.body.content);
    // console.log(content.content);

    console.log(content);
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
    Content.updateOne({}, {
            $set: { content: content }
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
});
module.exports = router;