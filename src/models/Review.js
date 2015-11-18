var mongoose = require('mongoose');
var schemas = require('./schemas');
var userSchema = schemas.userSchema;
var rideSchema = schemas.rideSchema;
var reviewSchema = schemas.reviewSchema;
var User = require('./User');

var Review = (function Review() {

  var that = Object.create(Review.prototype);

  that.getReview = function(reviewID, callback){
    reviewSchema.findOne({ "_id": reviewID }, function(err, review) {
      if (err) {
        callback(err);
      }
      callback(null, review);
    });
  };

  that.addReview = function(rideID, reviewerID, revieweeID, 
                            rating, comment, callback) {
    reviewSchema.create({
      "ride": rideID,
      "reviewer": reviewerID,
      "reviewee": revieweeID,
      "rating": rating,
      "comment": comment
    }, {}, function(err, review) {
      userSchema.update({ "_id": revieweeID }, { $push: { "reviews": review._id } }, 
                        function(err) {
        callback(err);
      });
    });
  };

  that.setReviewRating = function(reviewID, rating, callback) {
    reviewSchema.update({ "_id": reviewID }, { $set: { "rating": rating } },
                        function(err) {
      callback(err);
    });
  };

  that.setReviewComment = function(reviewID, comment, callback) {
    reviewSchema.update({ "_id": reviewID }, { $set: { "comment": comment } }, 
                        function(err) {
      callback(err);
    });
  };
  
  that.deleteReview = function(reviewID, callback) {
    reviewSchema.find({ "_id": reviewID }).remove(function(err) {
      callback(err);
    });
  };

  Object.freeze(that);
  return that;
})();
   
module.exports = Review;
