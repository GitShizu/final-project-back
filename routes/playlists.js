import express from 'express';
import Playlist from '../models/Playlist.js';
import Track from '../models/Track.js';

const router = express.Router();
router.use(express.json());

router.get('/', async (req, res) => {
    try {
        const playlistsDocs = await Playlist.find()
        const playlistsWithCount = await Promise.all(playlistsDocs.map(async (pDoc)=>{
            const playlist = pDoc.toObject();
            playlist.tracks_count = await Track.countDocuments({playlist: pDoc._id})
            return playlist
        }))
        res.send(playlistsWithCount)
    } catch (e) {
        res.status(500).send('Server error')
    }
})

router.post('/', async (req, res) => {
    const playlist = new Playlist(req.body);
    await playlist.generateSlug();
    await playlist.save();
    const playlistsDocs = await Playlist.find()
        const playlistsWithCount = await Promise.all(playlistsDocs.map(async (pDoc)=>{
            const playlist = pDoc.toObject();
            playlist.tracks_count = await Track.countDocuments({playlist: pDoc._id})
            return playlist
        }))
        res.send(playlistsWithCount)
    res.send(playlistsWithCount);
})

router.get('/:slug', async (req, res) => {
    try {
        const playlist = await Playlist.findOne({ slug: req.params.slug }); // to be added: populate tracks
        if (playlist === null) {
            throw new Error('Playlist not found');
        }
        playlist.trackList = await Track.find({ playlist: playlist._id });
        res.send(playlist);
    } catch (e) {
        res.status(404).send(e.message);
    }
})

router.patch('/:slug', async (req, res) => {
    const updatedPlaylist = req.body
    if (!updatedPlaylist || !Object.keys(updatedPlaylist).length) {
        res.status(400).send('You must edit at least one property to proceed')
    }
    try {
        const playlist = await Playlist.findOne({ slug: req.params.slug });
        const isTitleUpdated = updatedPlaylist.title && playlist.title !== updatedPlaylist.title;
        Object.entries(updatedPlaylist).forEach(([key, value]) => {
            if (key !== 'slug') {
                playlist[key] = value;
            }
        })
        if (isTitleUpdated) {
            await playlist.generateSlug();
        }
        await playlist.save();
        playlist.trackList = await Track.find({ playlist: playlist._id }) // to be added: populate tracks
        const playlistWithTracks = await Playlist.findOne({ slug: playlist.slug });
        res.send(playlistWithTracks)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.delete('/:slug', async (req, res) => {
    try {
        await Playlist.findOneAndDelete({ slug: req.params.slug });
        const playlists = await Playlist.find();
        res.send(playlists);
    } catch (e) {
        res.status(404).send(e.message)
    }
})

export default router