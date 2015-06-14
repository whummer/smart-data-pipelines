var Activation = require('../../activation.model');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

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
          return done(null, false, { message: 'Incorrect email address or password.' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Incorrect email address or password.' });
        }

        /* check if account is activated */
        var query = {};
    	query[USER_ID] = user[ID];
    	Activation.find(query, function(err, activation) {
    		if (err || !activation || !activation[0]) {
    			return done(null, false, { message: 'Cannot verify user activation.' });
    		}
    		activation = activation[0];
    		if(!activation[ACTIVATION_DATE]) {
    			return done(null, false, { message: 'Please activate your account first.' });
    		} else if(activation[DEACTIVATED]) {
    			return done(null, false, { message: 'Your account is currently deactivated.' });
    		}
            return done(null, user);
    	});
      });
    }
  ));
};