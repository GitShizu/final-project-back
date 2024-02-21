import bcrypt from 'bcrypt';
import dotenv from 'dotenv'; dotenv.config();
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const { SECRET_KEY, PEPPER_KEY } = process.env;

// Combine pepper key with user password and hash it. 
// The returned password is encrypted.
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);

    const pepperedPsw = process.env.PEPPER_KEY + password

    const hashedPassword = bcrypt.hash(pepperedPsw, salt);

    return hashedPassword
}
//funzione che prende la password come argomento e la restituisce criptata con salt e pepper.  

export const comparePsw = async (password, hashedPassword) => {

    const pepperedPsw = PEPPER_KEY + password

    const match = await bcrypt.compare(pepperedPsw, hashedPassword)

    return match
}
//funzione che decodifica la password criptata e la confronta con quella immessa dall'utente al login. 


export const generateToken = (_id) => {
    const token = jwt.sign(
        { _id },
        SECRET_KEY,
        { expiresIn: '5d' }
    )
    return token
}
//funzione che "firma" il token con la secret key (vedi .env) e lo restituisce. 

export const requireAuth = () => {
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers

            const token = authorization?.split(' ')[1]

            if (!token) {
                throw new Error('Token required')
            }
            const _id = jwt.verify(token, SECRET_KEY)
            const user = await User.findById(_id)
            if (!user) {
                throw new Error('user not found')
            }

            req.user = user

        } catch (error) {
            console.error(error);
            return res.status(401).send(`Request is not authorized: ${error.message}`)
        }

        next()
    }
}
//middleware per l'autenticazione. Nega l'accesso alle rotte a meno che l'utente non sia loggato. 

export const checkOwnedOrPublic = () => {
    return async (req, res, next) => {
        req.ownedOrPublic = req.user.is_admin ?
            {}
            :
            { $or: [{ created_by: req.user._id }, { is_public: true }] }
        req.ownedOnly = req.user.is_admin ?
            {}
            :
            { created_by: req.user._id }
        next()
    }

}
//middleware per l'autorizzazione. Appende alla request due oggetti che vengono usati come 
//filtri di ricerca nei .find() delle rotte. ownedOrPublic mostra solo le risorse create 
//dall'utente attualmente loggato o le risorse pubbliche degli altri utenti. ownedOnly mostra
//solo quelle create dall'utente attualmente loggato. Entrambe mostrano tutto se lo user è un admin. 