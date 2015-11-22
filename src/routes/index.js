var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Ride = require('../models/Ride');
var Review = require('../models/Review');
var utils = require('../utils/utils');

/* GET home page. */
router.get('/', function(req, res, next) {
  var currentUser = req.session.currentUser;
  Ride.getAllOpenRides(function(err, rides) {
    if (err) {
      res.render('error', {'message': 'An unknown error occured', 'error.status': 500})
    } else {
      if (currentUser) {
        res.render('index', {'username': currentUser, 'rides': rides, 'loggedIn': true})
      } else {
        res.render('index', {'username': currentUser, 'rides': rides, 'loggedIn': false})
      }
    }
  });
});

module.exports = router;
