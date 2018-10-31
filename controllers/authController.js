const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash ('success', 'You are now officially kicked out see u next time!!')
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    next(); //carry on they are logged in !
    return;
  }
  req.flash('error', 'oops you must be logged in to do that hehehe!!! login first plz!!');
  res.redirect('/login');
}

exports.forgot = async ( req, res) => {
  // check if the user is exists
  const user = await User.findOne({ email: req.body.email});
  if(!user) {
    req.flash('error', 'No account exists related to that email.')
    return res.redirect('/login')
  }
  // if yes reset tokens & expiry time on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();
  //send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

  await mail.send({
    user: user,
    subject: 'password reset',
    resetURL: resetURL,
    filename: 'password-reset'
  })
  req.flash('success', `You have been emailed a password reset link.`);
  //redirect them to login page
  res.redirect('/login');

}

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now()}
  });
  if (!user) {
    req.flash('error', 'password reset is invalid or has expired');
    return res.redirect('/login')
  }
  // but if there is a user, show the reset password Form
  res.render('reset', { title: 'Reset Your Password'});
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']){
    next(); // keep going
    return;
  }
  req.flash('error', 'Your password didn\'t much plz input maching passwords')
  res.redirect('back');
};


exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now()}
  });
  if (!user) {
    req.flash('error', 'password reset is invalid or has expired');
    return res.redirect('/login')
  }

  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', 'Nice! Your password has been successfully reset! You are now logged in!');
  res.redirect('/')
};
