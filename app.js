require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const User = require('./models/user');
const passport = require('passport');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const groupsRouter = require('./routes/groups');

const app = express();

require('./util/mongoConfig');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

require('./util/passport')(passport);
app.use(passport.initialize());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression()); // Compress all responses
app.use(
	helmet.contentSecurityPolicy({
		directives: {
		  "default-src": helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
		  "script-src": ["'self'", "https://code.jquery.com/", "https://stackpath.bootstrapcdn.com/", "https://kit.fontawesome.com/c0f095a9dc.js"]
		},
	})
);
app.use(cors());

// Register and Login routes
app.use('/auth', authRouter);

// JWT Authorization for routes
app.use(passport.authenticate('jwt', {session: false}));

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

app.use('/', indexRouter);
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
  res.status(err.status || 500).json({
	  error: res.locals.error,
	  message: 'You are lost'
	}
  );
});

module.exports = app;
