import { Card } from "../models/cards.js";
import { Board } from "../models/boards.js";
import User from "../models/userModel.js";
import { validationResult } from "express-validator";

export function getAll(req, res) {
  Card.find({})
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export function getById(req, res) {
  Card.findById(req.params.id)
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export function getByIdUsers(req, res) {
  Card.findById(req.params.id).populate('Users')
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

export async function addOnce(req, res) {
  /*
  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ errors: validationResult(req).array() });
  } else {
    */
  const userEmails = req.body.Users; // Assuming req.body.Users is an array of user emails
  const boardName = req.body.Board; // Assuming req.body.Workspace is the name of the workspace

  // Find the users by their emails and extract their IDs
  const userIds = await User.find({ email: { $in: userEmails } }).distinct('_id');

  // Find the workspace by its name and extract its ID
  const board = await Board.findOne({ Name: boardName });

  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }

  const boardId = board._id;
  Card.create({
    Name: req.body.Name,
    Description: req.body.Description,
    Board: boardId,
    Users: userIds,
    DueDate: req.body.DueDate,
    Attachement: `${req.protocol}://${req.get("host")}${process.env.IMGURL2}/${req.file.filename}`,

  })
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
  //}
}

export async function updateOnce(req, res) {
  try {
    const { Name, Description, Users, DueDate } = req.body;

    // Find the board
    const boardName = req.body.Board;
    const board = await Board.findOne({ Name: boardName });
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    const boardId = board._id;

    // Find the user IDs based on their emails
    const userEmails = Array.isArray(Users) ? Users : [Users];
    const userIds = await User.find({ email: { $in: userEmails } }).distinct('_id');

    // Update the card
    const updatedCard = await Card.findOneAndUpdate(
      { _id: req.params.id },
      {
        Name,
        Description,
        Board: boardId,
        Users: userIds,
        DueDate,
      },
      { new: true } // Return the updated card object
    );

    if (!updatedCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    return res.status(200).json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", error);
    return res.status(500).json({ error: "Error updating card" });
  }
}

export function deleteOnce(req, res) {
  Card.findOneAndRemove(req.id, req.body)
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
      const cards = await Card.find({ Users: userID }).exec();

      const populatedCards = await Promise.all(
        cards.map(async (card) => {
          const populatedBoard = await Board.findById(card.Board).exec();
          const populatedUsers = await User.find({ _id: { $in: card.Users } }).exec();
          
          const boardName = populatedBoard ? populatedBoard.Name : null;
          const userEmails = populatedUsers.map(user => user.email);

          return {
            ...card.toObject(),
            Board: boardName,
            Users: userEmails,
          };
        })
      );

      res.status(200).json({ Cards: populatedCards });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(400).send('Invalid user ID');
  }
}