import { Response, Request } from "express";
import pgPromise from "pg-promise";

const db = pgPromise()("postgres://postgres:postgres@localhost:5432/");

const setupDb = async () => {
  await db.none(`
DROP TABLE IF EXISTS planets;

CREATE TABLE planets(
  id SERIAL NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
)
`);
  await db.none(`INSERT INTO planets (name) VALUES ('Earth')`);
  await db.none(`INSERT INTO planets (name) VALUES ('Mars')`);
};
setupDb();

export const getAllPlanets = async (req: Request, res: Response) => {
  try {
    const planets = await db.any(`SELECT * FROM planets`);
    res.json(planets);
  } catch (error) {
    res.status(500).json("errore");
  }
};

export const getPlanetById = async (req: Request, res: Response) => {
  const planetId = parseInt(req.params.id);

  try {
    const planet = await db.one(
      `SELECT * FROM planets WHERE id = $1`,
      Number(planetId)
    );
    res.json(planet);
  } catch (error) {
    res.status(500).json("errore");
  }
};

export const createPlanet = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    await db.none(`INSERT INTO planets (name) VALUES ($1)`, String(name));
    res.status(201).json({ message: "Planet created successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Planet not created" });
  }
};

export const updatePlanet = async (req: Request, res: Response) => {
  const planetId = parseInt(req.params.id);
  const { name } = req.body;

  try {
    await db.none(`UPDATE planets SET name = $2 WHERE id = $1`, [
      planetId,
      name,
    ]);
    res.json({ message: "Planet updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Planet not updated" });
  }
};

export const deletePlanet = async (req: Request, res: Response) => {
  const planetId = parseInt(req.params.id);

  try {
    await db.none(`DELETE FROM planets WHERE id = $1`, Number(planetId));
    res.json({ message: "Planet deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Planet not deleted" });
  }
};