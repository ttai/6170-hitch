var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Ride = require('../models/Ride');
var Review = require('../models/Review');
var utils = require('../utils/utils');

// Add review
router.post('/', function(req, res) {
  Review.addReview(req.body.rideID, req.body.reviewerID, req.body.revieweeID,
    req.body.rating, req.body.comment, function(err) {
      if (err) {
        utils.sendErrResponse(res, 500, 'An unknown error occured.')
      } else {
        utils.sendSuccessResponse(res);
      }
    })
});

// Update review rating
router.post('/:review', function(req, res) {
  Review.setReviewRating(req.body.reviewID, req.body.rating, function(err) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occured.')
    } else {
      utils.sendSuccessResponse(res);
    }
  })
});

// Update review comment
router.post('/:review', function(req, res) {
  Review.setReviewComment(req.body.reviewID, req.body.comment, function(err) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occured.')
    } else {
      utils.sendSuccessResponse(res);
    }
  })
});

// Delete review
router.delete('/:review', function(req, res) {
  Review.deleteReview(req.body.reviewID, function(err) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occured')
    } else {
      utils.sendSuccessResponse(res);
    }
  })
});
