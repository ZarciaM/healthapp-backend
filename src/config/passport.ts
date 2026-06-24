import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";
import User from "../modules/user/user.model.js";

export function initializePassport(): void {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;

          if (!email) {
            return done(null, false, { message: "Aucun email fourni par Google" });
          }

          if (!profile._json?.email_verified) {
            return done(null, false, { message: "Email Google non vérifié" });
          }

          let user = await User.findOne({ googleId });

          if (user) {
            return done(null, user as unknown as Express.User);
          }

          user = await User.findOne({ email });

          if (user) {
            user.googleId = googleId;
            await user.save();
            return done(null, user as unknown as Express.User);
          }

          user = await User.create({
            email,
            googleId,
            authProvider: "google",
            firstName: profile.name?.givenName ?? profile.displayName ?? "",
            lastName: profile.name?.familyName ?? "",
          });

          return done(null, user as unknown as Express.User);
        } catch (error) {
          return done(error as Error);
        }
      },
    ),
  );
}
