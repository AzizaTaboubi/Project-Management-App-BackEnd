import { Workspace } from "../models/workspaces.js";
import User from "../models/userModel.js"
import { validationResult } from "express-validator";

export function getAll(req, res) {
  Workspace.find({})
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export function getById(req, res) {
  Workspace.findById(req.params.id)
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export async function getByUserID(req, res) {
  let userID = req.params.userID
  if (userID) {
    try {
      const workspaces = await Workspace.find({ Users: userID }).exec();
      console.log(workspaces)
      res.status(200).json({ Workspaces: workspaces });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(400).send('Invalid user ID');
  }
}

/*export async function addOnce(req, res) {
  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ errors: validationResult(req).array() });
  } else {
    Workspace.create({
      Name: req.body.Name,
      Owner: req.body.Owner,
    })
      .then((docs) => {
        res.status(200).json(docs);
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
}*/


export async function addOnce(req, res) {
  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ errors: validationResult(req).array() });
  } else {
    const ownerId = req.body.Owner; // Assuming req.body.Owner is the ID of the owner user

    // Find the owner user by their ID
    const ownerUser = await User.findById(ownerId);

    if (!ownerUser) {
      res.status(404).json({ error: 'Owner user not found' });
      return;
    }

    Workspace.create({
      Name: req.body.Name,
      Owner: ownerUser,
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
  Workspace.findOneAndUpdate(
    { _id: req.params.id },
    {
      Name: req.body.Name,
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
  Workspace.findOneAndRemove(req.id, req.body)
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}