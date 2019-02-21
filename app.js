const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const errorController = require('./controllers/error');
const db = require('./util/database');
const flash = require('connect-flash');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');



const adminRoutes = require('./routes/admin');
const public = require('./routes/public');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'erp project',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
  }))

  app.use(flash());

  app.use((req, res, next) => {
      console.log('===========================');
      console.log(req.session.email);
    if (!req.session.email) {
      return next()
    }
    db.execute('select * from login where email= ?',[req.session.email])
      .then(([user]) => {
        if (!user) {
          return next();
        }
        console.log('hello', user);
        req.user = user;
        next();
      })
      .catch(err => {

        console.log(err);
      });
  });

  app.use((req, res, next) => {
    res.locals.authenticate = req.session.isLoggedIn;
    next();
  });
app.use(adminRoutes);
app.use(public);

app.use(errorController.get404);

app.listen(3000);
