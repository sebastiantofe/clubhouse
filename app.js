require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const User = require('./models/user');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const groupsRouter = require('./routes/groups');

const app = express();

const mongoDB = process.env.MONGODB_URI || process.env.MONGODB_DEV;


mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression()); // Compress all responses
app.use(flash());
app.use(
	helmet.contentSecurityPolicy({
		directives: {
		  "default-src": helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
		  "script-src": ["'self'", "https://code.jquery.com/", "https://stackpath.bootstrapcdn.com/", "https://kit.fontawesome.com/c0f095a9dc.js"]
		},
	})
);
app.use(cors());

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
passport.use(
	new LocalStrategy((username, password, done) => {
		User.findOne({ username: username }, (err, user) => {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, { message: "Incorrect username" });
			};
			bcrypt.compare(password, user.password, (err, res) => {
				if (err) { return done(err) };

				if (res) {
				  // passwords match! log user in
				  return done(null, user)
				} else {
				  // passwords do not match!
				  return done(null, false, { message: "Incorrect password" })
				}
			  })
		});
	})
);
passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {

	if(req.user) {
		app.locals.currentUser = req.user
	} else {
		app.locals.currentUser = null;
	}
	next();
	
});

app.use((req, res, next) => {
	res.locals.messageSuccess = req.flash('messageSuccess')
	res.locals.messageFailure = req.flash('messageFailure')
	next();
});

app.use('/', indexRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});
// Restrict access to unauthenticated users
app.use(function(req, res, next) {
	if(!req.user) {
		res.redirect('/');
	}
});

app.use('/users', usersRouter);
app.use('/groups', groupsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
