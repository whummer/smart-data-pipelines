var passport = require('passport');
var mongoose = require('mongoose');
var config = require('../../config/environment');
var LocalStrategy = require('passport-local').Strategy;

// TODO: whu: make connection centrally in app.js. No clue why the connection is not open here.
mongoose.connect(config.mongo.uri, config.mongo.options);

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
	  var res = User.findOne({
	        email: email.toLowerCase()
      }, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(null, false, { message: 'This email is not registered.' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'This password is not correct.' });
        }
        return done(null, user);
      });
    }
  ));
};