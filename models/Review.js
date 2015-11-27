var mongoose = require('mongoose');
var schemas = require('./schemas');
var userModel = schemas.userModel;
var rideModel = schemas.rideModel;
var reviewModel = schemas.reviewModel;
var User = require('./User');

var Review = (function Review() {

  var that = Object.create(Review.prototype);

  that.reviewOwnership = function (currentUserId, reviewId) {
    reviewModel.findById(reviewId, function(err, review) {
      if (err) {
        callback(err);
      } else if (!review) {
        callback({ msg: 'Invalid review' });
      } else {
        var reviewerId = review.reviewer;
        callback(null, reviewerId === currentUserId);
      }
    });
  }

  that.getReview = function(reviewId, callback){
    reviewModel.findById(reviewId, function(err, review) {
      if (err) {
        callback(err);
      } else if (!review) {
        callback({ msg: 'Invalid review' });
      } else {
        callback(null, review);
      }
    });
  };

  that.addReview = function(rideId, reviewerId, revieweeId, 
                            rating, comment, callback) {
    reviewModel.create({
      "ride": rideId,
      "reviewer": reviewerId,
      "reviewee": revieweeId,
      "rating": rating,
      "comment": comment
    }, {}, function(err, review) {
      userModel.addReview(revieweeId, review, function(err, result) {
        if (err) {
          callback(err, null);
        } else {
          callback(null,null);
        }
      });
    });
  };

  that.setReviewRating = function(reviewerId, revieweeId, reviewId, rating, callback) {
    reviewModel.findbyIdAndUpdate(reviewId, { $set: { "rating": rating } },
                                  function(err, result) {
      if (err) {
        callback(err);
      } else {
        User.updateRating(userId, reviewId, function (err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, null);
          }
        });
      }
    });
  };

  that.setReviewComment = function(reviewId, comment, callback) {
    reviewModel.findbyIdAndUpdate(reviewId, { $set: { "comment": comment } }, 
                                  function(err) {
      if (err) {
        callback(err);
      }
    });
  };
  
  that.deleteReview = function(reviewId, callback) {
    reviewModel.findById(reviewId, function(err, review) {
      userModel.findById(review.revieweeId, function(err, user) {
        var index = user.reviews.indexOf(reviewId);
        user.reviews.splice(index, 1);
        userModel.findByIdAndUpdate(user._id,
                                    { $set: { "reviews": user.reviews } },
                                    function(err) {
          callback(err);
        });
      });
    }).remove(function(err) {
      callback(err);
    });
  };

  Object.freeze(that);
  return that;
})();
   
module.exports = Review;
