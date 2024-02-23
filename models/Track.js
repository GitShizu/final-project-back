import { SchemaTypes, model, Schema } from "mongoose";

const schema = new Schema({
    title: {
        type: String,
        minLength: 3,
        maxLength: 30,
        required: true
    },
    duration_sec: {
        type: Number,
        required: true
    },
    author: {
        type: String,
        minLength: 3,
        maxLength: 30,
        required: true
    },
    img_path: {
        type: String,
        maxLength: 500,
        default: 'https://source.unsplash.com/random/200x200/?music'
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
//metodo che genera lo slug per ogni risorsa. Se ne esiste già una con lo stesso slug
//viene aggiunto un - e un numero crescente per ogni copia successiva. 

const Track = model('Track', schema);
export default Track;
