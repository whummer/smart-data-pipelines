'use strict';

var express = require('express');
var passport = require('passport');
var User = require('../model/user.model');

// Passport Configuration
require('./local/passport').setup(User, global.config);
require('./facebook/passport').setup(User, global.config);
require('./google/passport').setup(User, global.config);
require('./twitter/passport').setup(User, global.config);

var router = express.Router();

router.use('/local', require('./local'));
router.use('/facebook', require('./facebook'));
router.use('/twitter', require('./twitter'));
router.use('/google', require('./google'));

module.exports = router;