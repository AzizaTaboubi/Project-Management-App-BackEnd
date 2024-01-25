import { Long } from "bson";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const cardSchema = new Schema({
  Name: { type: String },
  Description: {
    type: String,
  },
  Board: {
    type: String,
  },
  Users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  DueDate: {
    type: String,
  },
  Attachement: {
    type: String,
  },
},
  {
    timestamps: true
  },);

const Card = mongoose.model("card", cardSchema);

export { Card };