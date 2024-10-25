import { Request, Response } from "express";
import Joi from "joi";

interface Planet {
  id: number;
  name: string;
}

let planets: Planet[] = [
  { id: 1, name: "Earth" },
  { id: 2, name: "Mars" },
];

const planetSchema = Joi.object({
  name: Joi.string().required(),
});

export const getAll = (req: Request, res: Response) => {
  res.status(200).json(planets);
};

export const getOneById = (req: Request, res: Response) => {
  const planet = planets.find((p) => p.id === parseInt(req.params.id));
  if (!planet) {
    return res.status(404).json({ msg: "Planet not found" });
  }
  res.status(200).json(planet);
};

export const create = (req: Request, res: Response) => {
  const { error } = planetSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  const newPlanet: Planet = {
    id: planets.length + 1,
    name: req.body.name,
  };

  planets = [...planets, newPlanet];
  res.status(201).json({ msg: "Planet created successfully" });
};

export const updateById = (req: Request, res: Response) => {
  const { error } = planetSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  const planetId = parseInt(req.params.id);
  const planetExists = planets.some((p) => p.id === planetId);

  if (!planetExists) {
    return res.status(404).json({ msg: "Planet not found" });
  }

  planets = planets.map((p) =>
    p.id === planetId ? { ...p, name: req.body.name } : p
  ); 
  res.status(200).json({ msg: "Planet updated successfully" });
};

export const deleteById = (req: Request, res: Response) => {
  const planetId = parseInt(req.params.id);
  const planetExists = planets.some((p) => p.id === planetId);

  if (!planetExists) {
    return res.status(404).json({ msg: "Planet not found" });
  }

  planets = planets.filter((p) => p.id !== planetId);
  res.status(200).json({ msg: "Planet deleted successfully" });
};