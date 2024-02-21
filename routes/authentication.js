import express from "express";
import User from "../models/User.js";
import { generateToken } from "../libraries/authTools.js";

const router = express.Router();
router.use(express.json());

router.post('/signup', async (req, res) => {
    const { display_name, email, password } = req.body;
    if (!display_name || !email || !password) {
        return res.status(400).send('All fields must be filled')
    }

    try {
        const user = await User.signUp(display_name, email, password)
        const token = generateToken(user._id)
        return res.status(201).send({
            user,
            token
        })
    } catch (error) {
        console.error(error)
        const code = error.statusCode || 500;
        res.status(code).send(error.message);
    }
})
//rotta per il signup. Prende le credenziali dalla request, controlla che ci siano tutte ed
//esegue il metodo signup() per creare lo user. Restituisce un oggetto che contiene user e token.

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('All fields must be filled')
    }

    try {
        const user = await User.logIn(email, password)
        const token = generateToken(user._id)
        return res.status(202).send({
            user,
            token
        })
    } catch (error) {
        console.error(error)
        const code = error.statusCode || 500;
        res.status(code).send(error.message);
    }
})
//rotta per il login. Sostanzialmente uguale ma esegue il metodo login().


export default router