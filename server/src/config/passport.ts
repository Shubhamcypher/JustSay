import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { pool } from "./db";
import { generateAccessToken, generateRefreshToken } from "../utils/auth";
import bcrypt from "bcrypt";

interface DoneUser {
  user: any;
  token: string;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true,
      // state: true,
    },
    async (req, accessToken, refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const username = profile.displayName;
        const googleId = profile.id;
        const img = profile.photos?.[0]?.value;

        // 🔍 1. Check if user exists (google_id OR email)
        const existingUser = await pool.query(
          `SELECT * FROM users WHERE google_id = $1 OR email = $2`,
          [googleId, email]
        );

        let user;

        if (existingUser.rows.length === 0) {
          // 🆕 2. Create new user
          const newUser = await pool.query(
            `INSERT INTO users (email, username, google_id, img)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [email, username, googleId, img]
          );

          user = newUser.rows[0];
        } else {
          user = existingUser.rows[0];

          // 🔗 3. Link Google account if not linked
          if (!user.google_id) {
            const updatedUser = await pool.query(
              `UPDATE users SET google_id = $1 WHERE id = $2 RETURNING *`,
              [googleId, user.id]
            );
            user = updatedUser.rows[0];
          }
        }

        // 🎟️ 4. Generate JWT
        const accessToken = generateAccessToken({ userId: user.id });
        const refreshToken = generateRefreshToken({ userId: user.id });

        //Hash refresh token
        const hashedRefresh = await bcrypt.hash(refreshToken, 10);

        //Insert refresh token in DB
        await pool.query(
          "INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)",
          [hashedRefresh, user.id]
        );

        return done(null, { user, accessToken, refreshToken });
      } catch (err) {
        return done(err as Error, false);
      }
    }
  )
);

export default passport;