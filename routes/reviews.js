var express = require('express');
var router = express.Router();
var Review = require('../models/Review');
var utils = require('../utils/utils');

// Add review
router.post('/', function(req, res) {
  Review.addReview(req.body.rideID, req.body.reviewerID, req.body.revieweeID,
    req.body.rating, req.body.comment, function(err) {
      if (err) {
        res.render('error', {'message': 'Must be logged in to use this feature.', 'error.status': 500});
      } else {
        utils.sendSuccessResponse(res);
      }
    })
});

// Update review rating
router.post('/:review', function(req, res) {
  Review.setReviewRating(req.body.reviewID, req.body.rating, function(err) {
    if (err) {
      res.render('error', {'message': 'Must be logged in to use this feature.', 'error.status': 500});
    } else {
      utils.sendSuccessResponse(res);
    }
  })
});

// Update review comment
router.post('/:review', function(req, res) {
  Review.setReviewComment(req.body.reviewID, req.body.comment, function(err) {
    if (err) {
      res.render('error', {'message': 'Must be logged in to use this feature.', 'error.status': 500});
    } else {
      utils.sendSuccessResponse(res);
    }
  })
});

// Delete review
router.delete('/:review', function(req, res) {
  Review.deleteReview(req.body.reviewID, function(err) {
    if (err) {
      res.render('error', {'message': 'Must be logged in to use this feature.', 'error.status': 500});
    } else {
      utils.sendSuccessResponse(res);
    }
  })
});

module.exports = router;
