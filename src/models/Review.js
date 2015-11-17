var mongoose = require('mongoose');
var schemas = require('./schemas');
var userSchema = schemas.userSchema;
var rideSchema = schemas.rideSchema;
var reviewSchema = schemas.reviewSchema;
var User = require('./User');

var Review = (function Review() {

  var that = Object.create(Review.prototype);

    that.getReview = function(reviewID, callback){
        
    };

    that.addReview = function(rideID, reviewerID, revieweeID, 
      rating, comment, callback) {
        reviewSchema.create({
          "ride": rideID,
          "reviewer": reviewerID,
          "reviewee": revieweeID,
          "rating": rating,
          "comment": comment
        }, {}, function(e, doc) {
          userSchema.find({"_id": revieweeID}, {}, function(e, subdoc) {
            userSchema.update({"_id": revieweeID}, {$push: {"reviews": doc._id}}, 
              function(e, subsubdoc) {
            })
          })
        });
    };

    that.setReviewRating = function(reviewID, rating, callback) {
      reviewSchema.find({"_id": reviewID}, {}, function(e, doc) {
        reviewSchema.update({"_id": reviewID}, {$set: {"rating": rating}},
          function(e, subdoc) {
          });
      });
    };

    that.setReviewComment = function(reviewID, comment, callback) {
      reviewSchema.find({"_id": reviewID}, {}, function(e, doc) {
        reviewSchema.update({"_id": reviewID}, {$set: {"comment": comment}}, 
          function(e, subdoc) {
        });
      });
    };
    
    that.deleteReview = function(reviewID, callback) {
      reviewSchema.find({"_id": reviewID}).remove(function(e, doc) {
      });      
    };

    // Get all the reviews for a user (reviewee)
    that.getUserReviews = function(userID, callback){
      reviewSchema.find({"reviewee": userID}, {}, function(e, doc) {
        if (e) {
          callback("error")
        } else {
          callback(null, doc)
        }
      });
    };

    return that;
})();
   
module.exports = Review;