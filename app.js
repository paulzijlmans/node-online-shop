const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const errorController = require('./controllers/error');
const database = require('./util/database');
const User = require('./models/User');

const app = express();
const store = database.getStore(session);

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.getPageNotFound);

database.connect()
  .then(() => User.findOne())
  .then(user => {
    if (!user) {
      const newUser = new User({
        name: 'Paul',
        email: 'paul@test.com',
        cart: {
          items: []
        }
      });
      return newUser.save();
    }
    return user;
  })
  .then(() => {
    console.log('Listening on Port 3000');
    app.listen(3000);
  })
  .catch(err => console.log(err));