import express, { Request, Response } from 'express';
import Joi from 'joi';

const router = express.Router();


interface Planet {
  id: number;
  name: string;
}

let planets: Planet[] = [
  { id: 1, name: "Earth" },
  { id: 2, name: "Mars" },
];

const planetSchema = Joi.object({
  name: Joi.string().required()
});

router.get('/planets', (req: Request, res: Response) => {
  res.status(200).json(planets);
});

router.get('/planets/:id', (req: Request, res: Response) => {
  const planet = planets.find(p => p.id === parseInt(req.params.id));

  if (!planet) {
    return res.status(404).json({ msg: "Planet not found" });
  }

  res.status(200).json(planet);
});

router.post('/planets', (req: Request, res: Response) => {
  const { error } = planetSchema.validate(req.body);

  const newPlanet: Planet = {
    id: planets.length + 1, 
    name: req.body.name
  };

  planets.push(newPlanet);
  res.status(201).json({ msg: "Planet created successfully" });
});

router.put('/planets/:id', (req: Request, res: Response) => {
  const planet = planets.find(p => p.id === parseInt(req.params.id));

  if (!planet) {
    return res.status(404).json({ msg: "Planet not found" });
  }

  const { error } = planetSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  planet.name = req.body.name;
  res.status(200).json({ msg: "Planet updated successfully" });
});

router.delete('/planets/:id', (req: Request, res: Response) => {
  const planetIndex = planets.findIndex(p => p.id === parseInt(req.params.id));

  if (planetIndex === -1) {
    return res.status(404).json({ msg: "Planet not found" });
  }

  planets.splice(planetIndex, 1);
  res.status(200).json({ msg: "Planet deleted successfully" });
});

export default router;