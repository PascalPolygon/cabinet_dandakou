var express = require("express");
var router = express.Router();
const Admin = require("../models/Admins"); //Admin model
const Content = require("../models/Content"); //Content model 
const bcrypt = require("bcryptjs");
const passport = require('passport');
const { ensureAuthenticated } = require("../config/auth");
//const tools = require('../public/javascripts/tools');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const conn = mongoose.connection; //Holds connection opened in app.js
require("dotenv").config();
let mongoURI = process.env.MONGODB_URI;

console.log('mongo uri from Admin: ' + mongoURI)
let gfs;

conn.once('open', function() {
    //init Stream 
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

//create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });

router.post("/imageUpload", upload.single('jumboImg'), function(req, res, next) {
    console.log('Inside image upload post');
    // res.json({ file: req.file });
    res.redirect('/Admin/dashboard');
});

//route GET/ files
//@Desc display all files in JSON
router.get("/files", function(req, res) {
    gfs.files.find().toArray(function(err, files) {
        //check if files
        if (!files || files.length == 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }
        // Files exists
        console.log(files);
        return res.json(files);
    });
});

//route GET/ files/:filename
//@Desc display all files in JSON
router.get("/files/:id", function(req, res) {
    gfs.findOne({ _id: req.params.id }, function(err, file) {
        if (!file || file.length == 0) {
            return res.status(404).json({
                err: 'File does not exist'
            });
        }
        //Check if image
        if (file.contentType == 'image/jpeg' || file.contentType == 'image/png') {
            //Read output to browswer
            const readstream = gfs.createReadStream(file._id);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
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
            // var content = result[0].content;
            // var business_name = '';
            // if (content.business_name != '')
            //     business_name = content.business_name;
            // console.log('business_name: ' + business_name);
            // if (business_name[0] == '<') //Check if you need to escape it. (p tags are only added if you edit)
            //     business_name = tools.escapeHTMLtag(business_name, 'p');

            // console.log('business_name: ' + business_name);

            //find images from databse
            gfs.files.find().toArray(function(err, files) {
                //check if files
                if (!files || files.length == 0) { // if there are no images
                    res.render('dashboard', {
                        title: "Admin dashboard",
                        admin: req.user.firstName + ' ' + req.user.lastName,
                        content,
                        files: false
                    });
                } else {
                    res.render('dashboard', {
                        title: "Admin dashboard",
                        admin: req.user.firstName + ' ' + req.user.lastName,
                        content,
                        files
                    });
                    // console.log(files);
                    // return res.json(files);
                }

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
})
module.exports = router;