var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Ride = require('../models/Ride');
var Review = require('../models/Review');
var utils = require('../utils/utils');
var GoogleMapsAPI = require('googlemaps');

var config = {
  key: 'AIzaSyCefWb-vXOlxrWNEm_M20_eT4BTNYxNfYc',
  secure: true,
};
var gmAPI = new GoogleMapsAPI(config);

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

      var params = {
        origin: 'New York, NY, US',
        destination: 'Los Angeles, CA, US'
      };

      gmAPI.directions(params, function(err, result) {
        res.render('index', { 'user' : currentUser,
                              'rides' : rides,
                              'loggedIn' : logged_in });
      });
    }
  });
});

module.exports = router;
