import { Game } from "../models/game.js"; // add validate
import { validationResult } from "express-validator";
export function getAll(req, res) {
  Game.find({})
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export function getById(req, res) {
  Game.findById(req.params.id)
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export async function addOnce(req, res) {
  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ errors: validationResult(req).array() });
  } else {
    Game.create({
      Name: req.body.Name,
      Year: req.body.Year,
      // facon dynamique bech tkhabi lien el image : req.protocol = http , req host = localhost 
      Image: `${req.protocol}://${req.get("host")}${process.env.IMGURL}/${
        req.file.filename
      }`,
    })
      .then((docs) => {
        res.status(200).json(docs);
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
}

export async function updateOnce(req, res) {
  Game.findOneAndUpdate(
    { _id: req.params.id },
    {
      Name: req.body.Name,
      Year: req.body.Year,
    }
  )
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export function deleteOnce(req, res) {
  Game.findOneAndRemove(req.id, req.body)
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}
