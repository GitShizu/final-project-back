import { SchemaTypes, model, Schema } from "mongoose";

const schema = new Schema({
    title: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30
    },
    duration_m: {
        type: Number
    },
    playlist: {
        type: SchemaTypes.ObjectId
    }
})

const Track = model('Track', schema);
export default Track;
