import { Board } from "../models/boards.js";
import User from "../models/userModel.js";
import { Workspace } from "../models/workspaces.js";
import { validationResult } from "express-validator";

export function getAll(req, res) {
  Board.find({})
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export function getById(req, res) {
  Board.findById(req.params.id)
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export function getByIdUsers(req, res) {
  Board.findById(req.params.id).populate('Users')
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}


export async function getByUserID(req, res) {
  let userID = req.params.id;
  if (userID) {
    try {
      const boards = await Board.find({ Users: userID }).exec();

      const populatedBoards = await Promise.all(
        boards.map(async (board) => {
          const populatedWorkspace = await Workspace.findById(board.Workspace).exec();
          const populatedUsers = await User.find({ _id: { $in: board.Users } }).exec();
          
          const workspaceName = populatedWorkspace ? populatedWorkspace.Name : null;
          const userEmails = populatedUsers.map(user => user.email);

          return {
            ...board.toObject(),
            Workspace: workspaceName,
            Users: userEmails,
          };
        })
      );

      res.status(200).json({ Boards: populatedBoards });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(400).send('Invalid user ID');
  }
}

export async function addOnce(req, res) {
  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ errors: validationResult(req).array() });
  } else {
    const userEmails = req.body.Users; // Assuming req.body.Users is an array of user emails
    const workspaceName = req.body.Workspace; // Assuming req.body.Workspace is the name of the workspace

    // Find the users by their emails and extract their IDs
    const userIds = await User.find({ email: { $in: userEmails } }).distinct('_id');

    // Find the workspace by its name and extract its ID
    const workspace = await Workspace.findOne({ Name: workspaceName });

    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }

    const workspaceId = workspace._id;

    Board.create({
      Name: req.body.Name,
      Workspace: workspaceId,
      Users: userIds,
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
  try {
    const { Name } = req.body;
    const userEmails = req.body.Users;
    const userIds = await User.find({ email: { $in: userEmails } }).distinct('_id');
    const workspaceName = req.body.Workspace;
    const workspace = await Workspace.findOne({ Name: workspaceName });
    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }
    const workspaceId = workspace._id;
    const updatedBoard = await Board.findOneAndUpdate(
      { _id: req.params.id },
      {
        Name,
        Workspace: workspaceId,
        Users: userIds, // Convert to an array if it's not already
      },
      { new: true } // Return the updated board object
    );

    if (!updatedBoard) {
      return res.status(404).json({ message: "Board not found" });
    }

    return res.status(200).json(updatedBoard);
  } catch (error) {
    console.error("Error updating board:", error);
    return res.status(500).json({ error: "Error updating board" });
  }
}

export function deleteOnce(req, res) {
  Board.findOneAndRemove(req.id, req.body)
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}