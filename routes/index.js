var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Ride = require('../models/Ride');
var Review = require('../models/Review');
var utils = require('../utils/utils');
var geohash = require('geohash').GeoHash;

/* GET home page. */
router.get('/', function(req, res, next) {
  var currentUser = req.session.currentUser;
  var sortByDate = function (a, b) {
    if (a.departure_time < b.departure_time) {
      return -1;
    } else if (a.departure_time > b.departure_time) {
      return 1;
    } else {
      return 0;
    }
  }

  Ride.getAllOpenRides(function(err, rides) {
    if (err) {
      res.render('error', {'message': 'An unknown error occured', 'error.status': 500})
    } else {
      rides.sort(sortByDate);
      var logged_in = (currentUser) ? true : false;

      var hash = 'gcpvj0fb970t1';
      var latlon = geohash.decodeGeoHash(hash);
      var lat = latlon.latitude[2];
      var lon = latlon.longitude[2];
      var zoom = hash.length + 2;

      res.render('index', { 'user' : currentUser,
                            'rides' : rides,
                            'loggedIn' : logged_in,
                            'layout' : false,
                            'lat' : lat,
                            'lon' : lon,
                            'zoom' : zoom,
                            'geohash' : hash });
    }
  });
});

module.exports = router;
