import express, { Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000

type Planet = {
  id: number,
  name: string,
};

type Planets = Planet[];

let planets: Planets = [
  {
    id: 1,
    name: "Earth",
  },
  {
    id: 2,
    name: "Mars",
  },
];


app.use(express.json());
app.use(morgan('dev'));

app.get('/planets', (req : Request, res: Response) => {
  res.json(planets);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});