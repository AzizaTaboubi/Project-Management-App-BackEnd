import { Long } from "bson";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const workspaceSchema = new Schema({
  Name: { type: String },
  User: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User' 
  },
},
{
    timestamps: true
},);

const Workspace = mongoose.model("workspace", workspaceSchema);

export { Workspace };
