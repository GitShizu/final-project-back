import bcrypt from 'bcrypt';
import dotenv from 'dotenv'; dotenv.config();
import jwt from 'jsonwebtoken';
const { SECRET_KEY, PEPPER_KEY } = process.env;

// Combine pepper key with user password and hash it. 
// The returned password is encrypted.
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);

    const pepperedPsw = process.env.PEPPER_KEY + password

    const hashedPassword = bcrypt.hash(pepperedPsw, salt);

    return hashedPassword
}

// Compare user input password with hashed password saved on database on that user document.
// Used @ login. 
export const comparePsw = async (password, hashedPassword) => {

    const pepperedPsw = PEPPER_KEY + password

    const match = await bcrypt.compare(pepperedPsw, hashedPassword)

    return match
}

// Compile token for specific user.
export const generateToken = (_id) => {
    const token = jwt.sign(
        { _id },
        SECRET_KEY,
        { expiresIn: '5d' }
    )
    return token
}

// Authorization middleware. Protects routes from users who aren't logged in.
export const requireAuth = () => {
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers

            const token = authorization?.split(' ')[1]

            if (!token) {
                throw new Error('Token required')
            }
            jwt.verify(token, SECRET_KEY)

        } catch (error) {
            console.error(error);
            return res.status(401).send(`Request is not authorized: ${error.message}`)
        }

        next()
    }
}