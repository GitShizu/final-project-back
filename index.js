import morgan from "morgan";
import express from "express";
import cors from 'cors';
import mongoose from "mongoose";
import dotenv from 'dotenv'; dotenv.config();

const {MONGO_URI} = process.env;
const PORT = process.env || 3000;

const app = express();

app.use(morgan('dev'));
app.use(cors({origin:'*'}));
app.use(express.json());

mongoose.connect(MONGO_URI)
.then(()=>{
    console.log('Mongo connected succesfully');
    app.listen(PORT, ()=>{
        console.log('Server running - listening on port 3000');
    })
}).catch(err=>console.error(err))

export default app