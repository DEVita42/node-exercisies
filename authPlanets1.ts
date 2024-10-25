import passport from 'passport';
import passportJWT from 'passport-jwt';
import * as dotenv from 'dotenv';
import pgPromise from 'pg-promise';

dotenv.config();

const db = pgPromise()("postgres://postgres:postgres@localhost:5432/");

const setupDb = async () => 
    await db.none(`
      DROP TABLE IF EXISTS users;

      CREATE TABLE users (
        id SERIAL NOT NULL PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        token TEXT
      );
    `);
setupDb();

const { Strategy: JwtStrategy, ExtractJwt } = passportJWT;

passport.use(
  new JwtStrategy(
    {
      secretOrKey: process.env.SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload, done) => {
      try {
        const user = await db.one(`SELECT * FROM users WHERE id = $1`, [payload.id]);
        return user ? done(null, user) : done(null, false, { message: 'User not found' });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export { db, passport };