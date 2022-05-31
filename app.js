const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');

const errorController = require('./controllers/error');
const database = require('./util/database');
const User = require('./models/User');

const app = express();
const store = database.getStore(session);
const csrfProtection = csrf();

require('dotenv').config();
const { PORT } = process.env;

const fileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'images');
  },
  filename: (_req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(helmet());
app.use(compression());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, _res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err))
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/internal-server-error', errorController.getInternalServerError);

app.use(errorController.getPageNotFound);

app.use((_error, _req, res, _next) => {
  console.log(_error);
  res.status(500).render('internal-server-error', {
    pageTitle: 'Error!',
    path: '/internal-server-error',
    isAuthenticated: res.locals.isAuthenticated
  });
});

database.connect()
  .then(() => {
    console.log('Listening on Port 3000');
    app.listen(PORT || 3000);
  })
  .catch(err => console.log(err));