//Data model which represents a user
var mongoose = require("mongoose");
var schemas = require("./schemas");
var userSchema = schemas.userSchema;

var User = (function User() {

  var that = Object.create(User.prototype);

  that.userExists = function(currentKerberos,callback){
  	userSchema.find({kerberos: currentKerberos}, function(err, user){
		if (err){
			doesExist= err;
		}
		else if (user == null){
			doesExist=false;
		}
		else{
			doesExist=true;
		}
		callback(doesExist,user);
	});
  }
  //password or certificate authentication 
  that.createUser = function(currentKerberos, callback){
  	userExists(currentKerberos,function(doesExist, user){
  		if (doesExist){
  			callback("username taken");
  		}else if(currentKerberos===""){
  			callback("invalid");
  		}else{
  			users.create({"kerberos": currentKerberos}, function(e, info){
  				if (e){
  					callback("error");
  				}else{
  					callback("valid");
  				}
  			});
  		}  		
  	})
  }

  that.joinRide= function(currentKerberos, ride1, callback){
  	userExists(currentKerberos,function(doesExist, user){
		if (doesExist){
			users.update({"ride": ride1}, {$push: {"riders": user}}, function(e){});
		}
	}); 
  }

  that.leaveRide=function(currentKerberos, ride, callback){
  	userExists(currentKerberos,function(doesExist, user){
		if (doesExist){
			users.update({"ride": ride1}, {$pull: {"riders": user}}, function(e){});
		}
	}); 
  }

  that.getReviews=function(currentKerberos, callback){
  	userExists(currentKerberos,function(doesExist, user){
		if (doesExist) {
			Review.find({ '_id': user.reviews }, function(err, reviews)) {
				callback(reviews);
			}
		}
	}); 
  }

  Object.freeze(that);
  return that;
})();



//var User = mongoose.model("User",userSchema);
//User.create({username:"all",password:"pass", tweets:[]});
module.exports = User;