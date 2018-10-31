const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const md5 = require('md5'); // is used for puting gravatar for users
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.Promise = global.Promise;


const userSchema = new Schema ({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid email address'],
    required: 'please input email address',

  },
  name: {
    type: String,
    required: 'please input a name',
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date

});

userSchema.virtual('gravatar').get(function() {
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=50`;
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email'});
// error handling middle ware gives nice error messages
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
