import { Long } from "bson";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const gameSchema = new Schema({
  Name: { type: String },
  Year: {
    type: String,
  },
  Image: {
    type: String,
  },
},
{
  timestamps: true
},);

const Game = mongoose.model("game", gameSchema);

export { Game };
