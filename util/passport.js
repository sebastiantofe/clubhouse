const LocalStrategy = require("passport-local").Strategy;

const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const User = require("../models/user");

const local = new LocalStrategy((username, password, done) => {
		User.findOne({ username: username }, 'username password', (err, user) => {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, { message: "Incorrect username" });
			}

			user.comparePassword(password, (err, res) => {
				if (err) {
					return done(err);
				}

				if (res) {
					// passwords match! log user in
					return done(null, user);
				} else {
					// passwords do not match!
					return done(null, false, { message: "Incorrect password" });
				}
			});
		});
	}
);


const JWT = new JWTStrategy(
		{
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET
		},
		function (jwtPayload, done) {

 			//find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
			User.findById(jwtPayload.id, function(err, user) {
				if(err) { 
					return done(err, false)	};

				if(user) {
					return done(null, user);
				} else {
					return done(null, false);
				};
			});

		}
);

module.exports = (passport) => {
	passport.use(local);
	passport.use(JWT);	
}