var express = require("express");
var router = express.Router();
const Admin = require("../models/Admins"); //Admin model
const Content = require("../models/Content"); //Content model 
const Images = require("../models/Images"); //Images model
const bcrypt = require("bcryptjs");
const passport = require('passport');
const { ensureAuthenticated } = require("../config/auth");
//const tools = require('../public/javascripts/tools');
const mongoose = require('mongoose');
const path = require('path');
var multiparty = require('connect-multiparty')();
var fs = require('fs');
// const multer = require('multer');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const conn = mongoose.connection; //Holds connection opened in app.js
require("dotenv").config();
let mongoURI = process.env.MONGODB_URI;

//upload handler

// const imageUpload = require('../upload_handler');

console.log('mongo uri from Admin: ' + mongoURI)
let gfs;
let imageToDeleteId = '';

conn.once('open', function() {
    var mongoDriver = mongoose.mongo;
    //init Stream 
    gfs = Grid(conn.db, mongoDriver);
    gfs.collection('fs');

    router.post('/coverImageUpload', multiparty, function(req, res, next) {
        var coverImageFile = req.files.jumboImg;
        var filePath = coverImageFile.path;
        console.log('file path: ' + filePath);
        const gridFSBucket = new mongoDriver.GridFSBucket(conn.db);
        const writeStream = gridFSBucket.openUploadStream(coverImageFile.name);

        fs.createReadStream(filePath).pipe(writeStream);

        writeStream.on('finish', function(coverImageFile) {
            //query data and add to matching manufactuers
            console.log('Uploaded');
            console.log('file id:' + coverImageFile._id);
            //res.redirect('/Admin/dashboard');

            Images.findOneAndRemove({ imageType: 'Cover' }, function(err, imageToDelete) {
                if (err) return handleError(err);
                // deleted at most one image document
                console.log('Deleting image:');
                console.log(imageToDelete);

                if (imageToDelete != null) {
                    imageToDeleteId = imageToDelete.imageId;
                    console.log('Image to delete Id is: ' + imageToDeleteId);
                    if (imageToDeleteId != null) {
                        console.log('Image to delete id is not null, it is : ' + imageToDeleteId);

                        console.log('type of imageToDeleteId ' + typeof imageToDeleteId);

                        gfs.remove({ _id: imageToDeleteId, root: 'fs' }, function(error, gridStore) {
                            if (error) {
                                return res.status(404).json({ err: err });
                                //throw new error();
                                //console.log(error);
                            }
                            if (!gridStore)
                                console.log('Found no file to delete');
                            else
                                console.log('Deleted old cover image');
                        });
                    } else {
                        console.log('Image to delete Id is null: ' + imageToDeleteId);
                    }
                }
            });
            //create new image and update datase
            const image = new Images({
                imageId: coverImageFile._id,
                imageName: coverImageFile.filename,
                imageType: 'Cover'
            });

            image.save();
            console.log('Database updated');
            res.redirect('/Admin/dashboard');
        });
    });
});

//route GET/ files/:filename
//@Desc display all files in JSON
router.get("/images/cover", function(req, res) {

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
            gfs.findOne({ _id: imageRecord.imageId }, function(err, imageFile) {
                if (!imageFile || imageFile.length == 0) {
                    return res.status(404).json({
                        err: 'File does not exist'
                    });
                    // TODO: Handle this to use image from images folder 
                }
                console.log('Found file!');
                console.log(imageFile);
                const readstream = gfs.createReadStream(imageFile._id);
                readstream.pipe(res);

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
});
module.exports = router;