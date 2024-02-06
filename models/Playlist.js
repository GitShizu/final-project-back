import { SchemaTypes, model, Schema } from "mongoose";

const schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 30
    },
    tracks: {
        type: Number
    },
    trackList: {
        type: Array,
        default: []
    },
    createdBy: {
        type: SchemaTypes.ObjectId
    }
},{ timestamps: true })

const Playlist = model('Playlist', schema);
export default Playlist;