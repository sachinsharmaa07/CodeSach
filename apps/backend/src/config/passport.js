import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.model.js';
import { env } from './env.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'), false);

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            username:
              profile.displayName.replace(/\s+/g, '').toLowerCase().slice(0, 25) +
              Math.floor(Math.random() * 999),
            email,
            password: Math.random().toString(36) + Math.random().toString(36),
            avatar: profile.photos?.[0]?.value ?? '',
            role: 'user',
          });
        } else if (!user.avatar && profile.photos?.[0]?.value) {
          user.avatar = profile.photos[0].value;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);

export default passport;
