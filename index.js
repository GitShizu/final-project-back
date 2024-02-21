import morgan from 'morgan';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv'; dotenv.config();
import playlistsRoutes from './routes/playlists.js'
import tracksRoutes from './routes/tracks.js'
import authRoutes from './routes/authentication.js'
import {requireAuth, checkOwnedOrPublic} from './libraries/authTools.js'
const {MONGO_URI} = process.env;
const PORT = process.env.PORT || 3000;

const app = express();

app.use(morgan('dev'));
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://final-project-front-aesesix0r-alex-s-projects-96a5b608.vercel.app/'
    ],
    credentials: true}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use(requireAuth())
app.use(checkOwnedOrPublic())
app.use('/playlists', playlistsRoutes);
app.use('/tracks', tracksRoutes)

mongoose.connect(MONGO_URI)
.then(()=>{
    console.log('Mongo connected succesfully');
    app.listen(PORT, ()=>{
        console.log('Server running - listening on port 3000');
    })
}).catch(err=>console.error(err))

export default app