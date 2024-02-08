import { SchemaTypes, model, Schema } from "mongoose";

const schema = new Schema({
    title: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30
    },
    duration_sec: {
        type: Number
    },
    playlist: {
        type: SchemaTypes.ObjectId,
        default: null
    },
    slug: {
        type: String,
        trim: true,
        index: true
    }
})

schema.methods.generateSlug = async function () {
    const Track = this.constructor;
    const referenceSlug = this.title.replaceAll(' ', '-').toLowerCase()
    let existentSlug = true;
    let slug = referenceSlug;
    let i = 1;
    while (existentSlug) {
        existentSlug = await Track.exists({ slug })
        if (existentSlug) {
            slug = referenceSlug + '-' + i
            i++;
        }
    }
    this.slug = slug
}

const Track = model('Track', schema);
export default Track;
