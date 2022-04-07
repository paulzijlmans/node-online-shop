const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const handleError = require('../util/error-handler');

require('dotenv').config();
const { SENDGRIP_API_KEY, SENDGRID_FROM } = process.env;
const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: SENDGRIP_API_KEY
  }
}));

exports.getLogin = (req, res, next) => {
  return res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: getErrorMessage(req),
    oldInput: { email: '', password: '' },
    validationErrors: []
  })
    .catch(err => handleError(err, next));
}

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: getErrorMessage(req),
    oldInput: { email: '', password: '', confirmPassword: '' },
    validationErrors: []
  })
    .catch(err => handleError(err, next));
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422)
      .render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errors.array()[0].msg,
        oldInput: { email: email, password: password },
        validationErrors: errors.array()
      });
  }
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422)
          .render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: { email: email, password: password },
            validationErrors: []
          });
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              if (err) {
                console.log(err);
              }
              res.redirect('/');
            });
          }
          return res.status(422)
            .render('auth/login', {
              path: '/login',
              pageTitle: 'Login',
              errorMessage: 'Invalid email or password.',
              oldInput: { email: email, password: password },
              validationErrors: []
            });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => handleError(err, next));
}

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422)
      .render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: errors.array()[0].msg,
        oldInput: { email: email, password: password, confirmPassword: req.body.confirmPassword },
        validationErrors: errors.array()
      });
  }
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(() => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: SENDGRID_FROM,
        subject: 'Signup succeeded!',
        html: '<h1>You succesfully signed up!</h1>'
      });
    })
    .catch(err => handleError(err, next));
};

exports.postLogout = (req, res, next) => {
  req.session
    .destroy(() => res.redirect('/'))
    .catch(err => handleError(err, next));
};

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: getErrorMessage(req)
  })
    .catch(err => handleError(err, next));
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      console.log(error);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    console.log('token', token);
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.')
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(() => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: SENDGRID_FROM,
          subject: 'Password reset',
          html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
        `
        });
      })
      .catch(err => handleError(err, next));
  })
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: getErrorMessage(req),
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => handleError(err, next));
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => res.redirect('/login'))
    .catch(err => handleError(err, next));
}

const getErrorMessage = (req) => {
  const message = req.flash('error');
  return message.length > 0 ? message[0] : null;
}