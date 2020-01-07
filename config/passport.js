const LocalStrategy = require('passport-local').Strategy;
// const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('Inside passport.js');

//Load Admin Model
const Admin = require('../models/Admins');

module.exports = function (passport) {
    console.log('inside passport function');
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, function (email, password, done) {
            console.log('Matching email...');
            Admin.findOne({ email: email })
                .then(function (admin) {
                    if (!admin) {
                        console.log('Email not registered');
                        return done(null, false, { message: 'That email is not registered' });
                    }
                    console.log('Found email.')

                    //Match password
                    bcrypt.compare(password, admin.password, function (err, isMatch) {
                        console.log('maching password...')
                        if (err) throw err;
                        if (isMatch) {
                            console.log('Good password')
                            return done(null, admin);
                        } else {
                            console.log('Password incorrect')
                            return done(null, false, { message: 'Password incorrect' })

                        }
                    });

                })
                .catch(function (err) {
                    console.log(err);
                })
        })
    );

    passport.serializeUser(function (admin, done) {
        done(null, admin.id);
    });

    passport.deserializeUser(function (id, done) {
        Admin.findById(id, function (err, admin) {
            done(err, admin);
        });
    });
}