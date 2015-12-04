var express = require('express');
var router = express.Router();
var Review = require('../models/Review');
var Ride = require('../models/Ride');
var utils = require('../utils/utils');

/*
  Require authentication on ALL access to /rides/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
  if (!req.session.currentUser) {
    res.render('error', {'message': 'Must be logged in to use this feature.', 'status': 500});
  } else {
    next();
  }
};

// Register the middleware handlers above.
router.all('*', requireAuthentication);

/*
  At this point, all requests are authenticated and checked:
  1. Clients must be logged into some account
  2. If accessing or modifying a specific resource, the client must be a participant in that ride
  3. Requests are well-formed
*/

// Get review page for a particular ride
router.get('/:ride', function(req, res) {
  var user = req.session.currentUser;
  var ride_id = req.params.ride;
  Ride.getOtherRiders(ride_id, user._id, function(err, other_riders, other_riders_reviews) {
    res.render('reviews', { 'csrf': req.csrfToken(),
                            'user' : req.session.currentUser,
                            'ride_id' : ride_id,
                            'other_riders' : other_riders,
                            'other_riders_reviews' : other_riders_reviews});
  });
});

// Add or update review
router.post('/:review', function(req, res) {
  if (!req.body.rating || req.body.rating < 1 || req.body.rating > 5) {
    res.render('error', {'message': 'Must submit rating between 1 and 5.', 'status' : 500});
  }
  Review.addReview(req.body.ride_id, req.body.reviewer_id, req.body.reviewee_id,
                     parseInt(req.body.rating), req.body.comment, function(err) { 
      if (err) {
        res.render('error', {'message': 'Must be logged in to use this feature.', 'status': 500});
      } else {
        res.redirect(req.get('referer'));
      }
    });
});

module.exports = router;
