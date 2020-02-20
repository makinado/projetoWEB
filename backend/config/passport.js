const passport = require('passport')
const passportJwt = require('passport-jwt')
const passportFacebook = require('passport-facebook')
const { Strategy, ExtractJwt } = passportJwt

module.exports = app => {
    const params = {
        secretOrKey: process.env.AUTH_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }

    const bearerStrategy = new Strategy(params, (payload, done) => {
        app.dbUsers('usuarios')
            .where({ id: payload.id })
            .first()
            .then(user => done(null, user ? { ...payload } : false))
            .catch(err => done(err, false))
    })

    const facebookStrategy = new passportFacebook({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', "email"]
    },
        function (accessToken, refreshToken, profile, done) {
            app.dbUsers('usuarios')
                .where({ email: profile.email })
                .first()
                .then(user => done(null, user ? { ...payload } : false))
                .catch(err => done(err, false))
        })

    passport.use(bearerStrategy)

    return {
        authenticate: () => passport.authenticate('jwt', { session: false })
    }
}