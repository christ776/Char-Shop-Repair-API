var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Used to generate password hash
const SALT_WORK_FACTOR = 10;

// Define user model schema
var UserSchema = new mongoose.Schema({
  fullname:{
      type:String,
      required:true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

//Middleware executed before save - hash the user's password
UserSchema.pre('save', function(next) {

   var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err)  {
         return next(err);
      }

        // hash the password using our new salt
        bcrypt.hash(user.password, salt,null,function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.verifyPassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// Export user model
module.exports = mongoose.model('User', UserSchema);
