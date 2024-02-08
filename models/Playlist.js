import { SchemaTypes, model, Schema } from "mongoose";
import Track from "./Track.js";

const schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 50
    },
    tracks_count: {
        type: Number
    },
    // createdBy: {
    //     type: SchemaTypes.ObjectId
    // },
    slug: {
        type: String,
        trim: true,
        index: true
    }
},{ timestamps: true })

schema.methods.generateSlug = async function () {
    const Playlist = this.constructor;
    const referenceSlug = this.title.replaceAll(' ', '-').toLowerCase()
    let existentSlug = true;
    let slug = referenceSlug;
    let i = 1;
    while(existentSlug){
        existentSlug = await Playlist.exists({slug})
        if(existentSlug){
            slug = referenceSlug + '-' + i
            i++;
        }
    }
    this.slug = slug
}

const Playlist = model('Playlist', schema);
export default Playlist;