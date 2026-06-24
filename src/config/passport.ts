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
            return done(null, false, {
              message: "Aucun email fourni par Google",
            });
          }

          const emailVerified =
            profile._json && "email_verified" in profile._json
              ? profile._json.email_verified === true
              : true;

          if (!emailVerified) {
            return done(null, false, {
              message: "L'email Google doit être vérifié",
            });
          }

          let user = await User.findOne({ googleId });

          if (user) {
            return done(null, user as any);
          }

          user = await User.findOne({ email });

          if (user) {
            user.googleId = googleId;
            await user.save();
            return done(null, user as any);
          }

          const displayName = profile.displayName || "";
          const firstName =
            profile.name?.givenName ||
            displayName.split(" ")[0] ||
            "Utilisateur";
          const lastName =
            profile.name?.familyName ||
            displayName.split(" ").slice(1).join(" ") ||
            "";

          user = await User.create({
            email,
            googleId,
            authProvider: "google",
            firstName,
            lastName,
          });

          return done(null, user as any);
        } catch (error) {
          return done(error as Error);
        }
      },
    ),
  );
}
