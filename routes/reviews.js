var express = require('express');
var router = express.Router();
var Review = require('../models/Review');
var Ride = require('../models/Ride');
var utils = require('../utils/utils');

// // Add review
// router.post('/', function(req, res) {
//   Review.addReview(req.body.rideID, req.body.reviewerID, req.body.revieweeID,
//                    req.body.rating, req.body.comment, function(err) {
//     if (err) {
//       res.render('error', {'message': 'Must be logged in to use this feature.', 'error.status': 500});
//     } else {
//       utils.sendSuccessResponse(res);
//     }
//   });
// });

// Get review page for a particular ride
router.get('/:ride', function(req, res) {
  var user = req.session.currentUser;
  var ride_id = req.params.ride;
  Ride.getOtherRiders(ride_id, user._id, function(err, other_riders, other_riders_reviews) {
    res.render('reviews', { 'user' : req.session.currentUser,
                            'ride_id' : ride_id,
                            'other_riders' : other_riders,
                            'other_riders_reviews' : other_riders_reviews });
  });
});

// Add or update review
router.post('/:review', function(req, res) {
  // console.log('rating', req.body.rating)  
  Review.addReview(req.body.ride_id, req.body.reviewer_id, req.body.reviewee_id,
                     5, req.body.comment, function(err) { 
                     // req.body.rating, req.body.comment, function(err) {
      if (err) {
        res.render('error', {'message': 'Must be logged in to use this feature.', 'error.status': 500});
      } else {
        res.redirect(req.get('referer'));
      }
    });
});

// // Update review rating
// router.post('/:review', function(req, res) {
//   Review.setReviewRating(req.body.reviewID, req.body.rating, function(err) {
//     if (err) {
//       res.render('error', {'message': 'Must be logged in to use this feature.', 'error.status': 500});
//     } else {
//       utils.sendSuccessResponse(res);
//     }
//   });
// });

// // Update review comment
// router.post('/:review', function(req, res) {
//   Review.setReviewComment(req.body.reviewID, req.body.comment, function(err) {
//     if (err) {
//       res.render('error', {'message': 'Must be logged in to use this feature.', 'error.status': 500});
//     } else {
//       utils.sendSuccessResponse(res);
//     }
//   });
// });

// // Delete review
// router.delete('/:review', function(req, res) {
//   Review.deleteReview(req.body.reviewID, function(err) {
//     if (err) {
//       res.render('error', {'message': 'Must be logged in to use this feature.', 'error.status': 500});
//     } else {
//       utils.sendSuccessResponse(res);
//     }
//   });
// });

module.exports = router;
