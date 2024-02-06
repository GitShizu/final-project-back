import { SchemaTypes, model, Schema } from "mongoose";
import Track from "./Track";

const schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 50
    },
    tracksCount: {
        type: Number
    },
    trackList: {
        type: Array,
        default: []
    },
    createdBy: {
        type: SchemaTypes.ObjectId
    },
    slug: {
        type: String,
        trim: true
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

schema.methods.tracksCounter = async function(){
    this.tracksCount = await Track.countDocuments({ playlist: this._id })
}

const Playlist = model('Playlist', schema);
export default Playlist;