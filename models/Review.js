var mongoose = require('mongoose');
var schemas = require('./schemas');
var userModel = schemas.userModel;
var rideModel = schemas.rideModel;
var reviewModel = schemas.reviewModel;
var User = require('./User');

var Review = (function Review() {

  var that = Object.create(Review.prototype);

  that.getReview = function(reviewID, callback){
    reviewModel.findOne({ "_id": reviewID }, function(err, review) {
      if (err) {
        callback(err);
      } else {
        callback(null, review);
      }
    });
  };

  that.addReview = function(rideID, reviewerID, revieweeID, 
                            rating, comment, callback) {
    reviewModel.create({
      "ride": rideID,
      "reviewer": reviewerID,
      "reviewee": revieweeID,
      "rating": rating,
      "comment": comment
    }, {}, function(err, review) {
      userModel.addReview(revieweeId, review, function(err) {
        callback(err);
      });
    });
  };

  that.setReviewRating = function(reviewID, rating, callback) {
    reviewModel.update({ "_id": reviewID }, { $set: { "rating": rating } },
                        function(err) {
      callback(err);
    });
  };

  that.setReviewComment = function(reviewID, comment, callback) {
    reviewModel.update({ "_id": reviewID }, { $set: { "comment": comment } }, 
                        function(err) {
      callback(err);
    });
  };
  
  that.deleteReview = function(reviewID, callback) {
    reviewModel.find({ "_id": reviewID }, function(err, review) {
      userModel.find({ "_id": review.revieweeID }, function(err, user) {
        var index = user.reviews.indexOf(reviewID);
        user.reviews.splice(index, 1);
        userModel.update({ "_id": user._id },
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
