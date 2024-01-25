import mongoose, { mongo } from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    otp: {
        type: Number,
        default: '2456'
    },
    
   
},
    {
        timestamps: true
    });

export default model("User", userSchema)