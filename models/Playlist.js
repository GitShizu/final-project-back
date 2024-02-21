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
    track_list: {
        type: [SchemaTypes.ObjectId],
        default: [],
        ref: 'Track'
    },
    created_by: {
        type: SchemaTypes.ObjectId,
        immmutable: true,
        ref: 'User'
    },
    is_public: {
        type: Boolean
    },
    slug: {
        type: String,
        trim: true,
        index: true
    }
}, { timestamps: true })

schema.methods.generateSlug = async function () {
    const Playlist = this.constructor;
    const referenceSlug = this.title.replaceAll(' ', '-').toLowerCase()
    let existentSlug = true;
    let slug = referenceSlug;
    let i = 1;
    while (existentSlug) {
        existentSlug = await Playlist.exists({ slug })
        if (existentSlug) {
            slug = referenceSlug + '-' + i
            i++;
        }
    }
    this.slug = slug
}
//metodo che genera lo slug per ogni risorsa. Se ne esiste già una con lo stesso slug
//viene aggiunto un - e un numero crescente per ogni copia successiva. 

const Playlist = model('Playlist', schema);
export default Playlist;