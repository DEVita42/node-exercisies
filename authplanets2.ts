import express, { Request, Response } from "express";
import "express-async-errors";
import morgan from "morgan";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';
import pgPromise from 'pg-promise';

dotenv.config();

const app = express();
const port = 3000;
const db = pgPromise()("postgres://postgres:postgres@localhost:5432/");

app.use(morgan("dev"));
app.use(express.json());

const secretKey = process.env.SECRET;

// User Signup
app.post("/users/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await db.oneOrNone(`SELECT * FROM users WHERE username = $1`, [username]);
    if (user) {
      return res.status(400).json({ msg: "User already exists." });
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.one(`INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id`, [username, hashedPassword]);

    // JWT token
    const jwtToken = jwt.sign({ id: newUser.id, username }, secretKey, { expiresIn: '1h' });

    res.status(201).json({
      msg: "Signup successful. Now you can log in.",
      apiToken: jwtToken,
      username,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error." });
  }
});

// User Login
app.post("/users/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await db.oneOrNone(`SELECT * FROM users WHERE username = $1`, [username]);
    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials." });
    }


    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ msg: "Invalid credentials." });
    }

    // JWT token
    const jwtToken = jwt.sign({ id: user.id, username }, secretKey, { expiresIn: '1h' });

    res.status(200).json({
      msg: "Login successful.",
      apiToken: jwtToken,
      id: user.id,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ msg: "error." });
  }
});

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);