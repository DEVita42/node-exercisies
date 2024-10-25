import "express-async-errors";
import morgan from "morgan";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import pgPromise from "pg-promise";
import passport from "passport";
import express, { Request, Response, NextFunction } from "express";


dotenv.config();

const app = express();
const port = 3000;
const db = pgPromise()("postgres://postgres:postgres@localhost:5432/");

app.use(passport.initialize());
app.use(morgan("dev"));
app.use(express.json());

const { SECRET } = process.env;

// Passport
passport.use(
  new passportJWT.Strategy(
    {
      secretOrKey: SECRET,
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload: any, done: any) => {
      const user = await db.oneOrNone(`SELECT * FROM users WHERE id = $1`, [payload.id]);

      try {
        return user ? done(null, user) : done(new Error("user not found"));
      } catch (error) {
        done(error);
      }
    }
  )
);

// Middleware di autorizzazione
const authorize = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({ msg: "Unauthorized" });
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};

//Signup
app.post("/users/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await db.oneOrNone(`SELECT * FROM users WHERE username = $1`, [username]);
    if (user) {
      return res.status(400).json({ msg: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.one(`INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id`, [username, hashedPassword]);

    //token
    const jwtToken = jwt.sign({ id: newUser.id, username }, SECRET, { expiresIn: "1h" });

    res.status(201).json({
      msg: "Signup successful. Now you can log in.",
      apiToken: jwtToken,
      username,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error." });
  }
});

// Login
app.post("/users/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await db.oneOrNone(`SELECT * FROM users WHERE username = $1`, [username]);
  if (!user) {
    return res.status(401).json({ msg: "Invalid credentials." });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ msg: "Invalid credentials." });
  }

  //token
  const jwtToken = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: "1h" });

  // Aggiorna il token
  await db.none(`UPDATE users SET token = $1 WHERE id = $2`, [jwtToken, user.id]);

  res.status(200).json({
    msg: "Login successful.",
    apiToken: jwtToken,
    id: user.id,
    username: user.username,
  });
});

// Logout
app.get("/users/logout", authorize, async (req: Request, res: Response) => {
  const user: any = req.user;
  try {
    await db.none(`UPDATE users SET token = NULL WHERE id = $1`, [user?.id, null]);
    res.status(200).json({ msg: "Logout successful." });
  } catch (error) {
    res.status(500).json({ msg: "Error during logout." });
  }
});

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);