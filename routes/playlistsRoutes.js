import express from 'express';
import Playlist from '../models/Playlist.js';
import Track from '../models/Track.js';

const router = express.Router();
router.use(express.json());

router.get('/', async (req, res) => {
    try {
        const playlists = Playlist.find().select('-trackList')
        const playlistsWithCount = await Promise.all(playlists.map(async p => {
            p.tracksCounter()
            return p
        }))
        res.send(playlistsWithCount)
    } catch (e) {
        res.status(500).send('Server error')
    }
})

router.post('/', async (req, res) => {
    const playlist = new Musician(req.body);
    await playlist.generateSlug();
    await playlist.tracksCounter();
    playlist.trackList = [];
    await playlist.save();
    const playlists = await Playlist.find();
    res.send(playlists);
})

router.post('/:slug', async (req, res) => {
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
        const isTitleUpdated = playlist.title !== updatedPlaylist.title;
        Object.entries(updatedPlaylist).forEach(([key, value]) => {
            if (key !== 'slug' && key !== 'trackList') {
                playlist[key] = value;
            }
        })
        if (isTitleUpdated) {
            await Playlist.generateSlug();
            console.log('Slug updated');
        }
        playlist.trackList = [];
        await playlist.save();
        playlist.trackList = await Track.find({ playlist: playlist._id }) // to be added: populate tracks
        const playlistWithTracks = await Playlist.findOne({ slug: req.params.slug });
        res.send(playlistWithTracks)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.delete('/:slug', async (req, res) => {
    try {
        await Playlist.findOneAndDelete({ slug: req.params.slug });
        const playlists = await Playlist.find();
        res.semd(playlists);
    } catch (e) {
        res.status(404).send(e.message)
    }
})

export default router