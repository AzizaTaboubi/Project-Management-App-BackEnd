import { Meet } from "../models/meet.js"; // add validate
import User from "../models/userModel.js"
import { validationResult } from "express-validator";


export function getAll(req, res) {
  Meet.find({})
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export function getById(req, res) {
  Meet.findById(req.params.id)
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export async function getByUserID  (req, res)  {
  let userID = req.params.userID
  if(userID)
    res.send({
       Meets: await Meet.find({User: userID}).exec()
       })
  else
    res.send("erreur")
}

export async function addOnce(req, res) {
  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ errors: validationResult(req).array() });
  } else {
    const userId = req.body.User; 

    try {
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      Meet.create({
        Day: req.body.Day,
        Month: req.body.Month,
        Year: req.body.Year,
        Link: req.body.Link,
        Description: req.body.Description,
        User: user,
      })
        .then((docs) => {
          res.status(200).json(docs);
        })
        .catch((err) => {
          res.status(500).json({ error: err });
        });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }
}

export async function updateOnce(req, res) {
  Meet.findOneAndUpdate(
    { _id: req.params.id },
    {
      Day: req.body.Day,
      Month: req.body.Month,
      Year: req.body.Year,
      Link: req.body.Link,
      Description: req.body.Description,
      User: req.body.User,
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
  Meet.findOneAndRemove(req.id, req.body)
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}
