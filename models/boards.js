import { Long } from "bson";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const boardSchema = new Schema({
  Name: { type: String },
  Workspace: {
    type: String,
  },
  Users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
},

{
    timestamps: true
},);

const Board = mongoose.model("board", boardSchema);

export { Board };