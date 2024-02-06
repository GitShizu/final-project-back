import { SchemaTypes, model, Schema } from "mongoose";
import validator from "validator";
const { isEmail, isStrongPassword } = validator;

const schema = new Schema({
    email: {
        type: String,
        required: true,
        index: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
},{ timestamps: true })

const User = model('User', schema);
export default User;