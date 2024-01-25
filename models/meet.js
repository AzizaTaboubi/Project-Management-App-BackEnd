import { Long } from "bson";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const meetSchema = new Schema({
  Day: { type: String },
  Month: { type: String },
  Year: { type: String },
  Link: {
    type: String,
  },
  Description: {
    type: String,
    required:true,
  },
  User: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User' 
  },
  
}, 
{
  timestamps: true
},);

const Meet = mongoose.model("meet", meetSchema);

export { Meet };
