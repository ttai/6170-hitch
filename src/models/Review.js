var mongoose = require('mongoose');
var schemas = require('./schemas');
var userSchema = schemas.userSchema;
var rideSchema = schemas.rideSchema;
var reviewSchema = schemas.reviewSchema;
var User = require('./User');

var Review = (function Review() {

  var that = Object.create(Review.prototype);
    that.getReview = function(){
      
    }

    that.addReview = function() {

    }

    that.editReview = function() {

    }

    that.removeReview = function() {
          
    }

      // Get all the reviews for a user
    that.getUserReviews = function(){

    }
         
})()
   
module.exports = Review;