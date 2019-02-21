const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');
const db= require('../util/database');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
    }
  })

); 

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }

  db.execute('select * from login where email= ?' , [email])
    .then(([user]) => {
      if (user.length==0) {
        console.log('faillllll');
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }

          if (password == user[0].password) {
            req.session.isLoggedIn = true;
            req.session.email= user[0].email;
            req.user = user[0];
             console.log('passssss');
             return res.redirect('/');
          }
          console.log('goneeee');
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    };




exports.getRegister = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/register', {
    path: '/register',
    pageTitle: 'Register',
    errorMessage: message
  });
};



exports.postRegister = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/register');
    }
    const token = buffer.toString('hex');
    console.log(token);
    db.execute('select * from login where email= ?',[req.body.email])
      .then(([user]) => {
        if (user.length==0) {
          
          req.flash('error', 'No account with that email found.');
          return res.redirect('/register');
        }
        const tokenExpire= Date.now() +3600000;
        //console.log('user:', user[0] );
       console.log(req.body.email, user[0].email);
        return db.execute('update login SET token= ? , tokenExpire= ? WHERE email= ?' , [token, tokenExpire, req.body.email])
      .then(([result]) => {

          console.log('our result:  ',result);
          
           
            console.log('email:   ',req.body.email);
          transporter.sendMail({
            to: req.body.email.toString(),
            from: 'nickhifi20@gmail.com',
            subject: 'Password set for new user',
            text: 'ERP Project',
            html: `
            <hr>
              <h1> SET YOUR PASSWORD </h1>
              <h2>You try to register to ERP portal</h2>
              <h3>Click this <a href="http://localhost:3000/register/${token}">link</a> to set a new password.</h3>
              <hr>
            `
          })
          .then((ss)=>
          {
            console.log(ss);
            req.flash('error', 'An email has been send to your email id. please check. (check your spam folder also)');
            res.redirect('/register');
          }).catch(err =>
          {
            throw new Error(err);
          })
        })
      }).catch(err => {
        console.log(err);
      });
  });
};



exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const email = req.body.email;
  const token = req.body.token;

 db.execute('select * from login where email= ? AND token= ? ', [email, token])
    .then(([user]) => {
     return db.execute('update login set password= ? , token= ? , tokenExpire= ? where email= ? ', [newPassword, null , null, email] )
        }).then(([result]) => {
       res.redirect('/login');

    })
    .catch(err => {
      console.log(err);
    });
};



exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  db.execute('select * from login where token= ? ', [token])
   .then(([user]) => {
      let message = req.flash('error');
      if(message.length > 0){
        message = message[0];
      }
      else {
        message = null;
      }
      if (user.length==0) {
            return res.render('auth/new-password' , {message: 'your token has been expired', path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: message,
            email: '',
            token: ''});
      } 
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        email: user[0].email,
        token: token,
        message:''
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};