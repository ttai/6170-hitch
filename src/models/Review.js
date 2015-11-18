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
          // TODO: implement error handling
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
      }, {}, function(e, doc) {
        userSchema.find({"_id": revieweeID}, {}, function(e, subdoc) {
          userSchema.update({"_id": revieweeID}, {$push: {"reviews": doc._id}}, 
                            function(err, subsubdoc) {
            // TODO: implement error handling
          });
        });
      });
    };

    that.setReviewRating = function(reviewID, rating, callback) {
      reviewSchema.find({"_id": reviewID}, {}, function(err, doc) {
        reviewSchema.update({"_id": reviewID}, {$set: {"rating": rating}},
                            function(err, subdoc) {
          // TODO: implement error handling
        });
      });
    };

    that.setReviewComment = function(reviewID, comment, callback) {
      reviewSchema.find({"_id": reviewID}, {}, function(err, doc) {
        reviewSchema.update({"_id": reviewID}, {$set: {"comment": comment}}, 
                            function(err, subdoc) {
          // TODO: implement error handling
        });
      });
    };
    
    that.deleteReview = function(reviewID, callback) {
      reviewSchema.find({"_id": reviewID}).remove(function(err, doc) {
        // TODO: implement error handling
      });      
    };

    // Get all the reviews for a user (reviewee)
    that.getUserReviews = function(userID, callback){
      reviewSchema.find({"reviewee": userID}, {}, function(err, doc) {
        if (err) {
          callback("error")
        } else {
          callback(null, doc)
        }
      });
    };

    Object.freeze(that);
    return that;
})();
   
module.exports = Review;
