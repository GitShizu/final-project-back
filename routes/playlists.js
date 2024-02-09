import express from 'express';
import Playlist from '../models/Playlist.js';
import Track from '../models/Track.js';

const router = express.Router();
router.use(express.json());

router.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find().populate('track_list')
        res.send(playlists)
    } catch (e) {
        res.status(500).send('Server error')
    }
})

router.post('/', async (req, res) => {
    const playlist = new Playlist(req.body);
    await playlist.generateSlug();
    await playlist.save();
    const playlists = await Playlist.find().populate('track_list')
    res.send(playlists)
})

router.get('/:slug', async (req, res) => {
    try {
        const playlist = await Playlist.findOne({ slug: req.params.slug }).populate('track_list')
        if (playlist === null) {
            throw new Error('Playlist not found');
        }
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
            if (key !== 'slug' && key !== 'track_list') {
                playlist[key] = value;
            }

            if (key === 'track_list') {
                if (Array.isArray(updatedPlaylist.track_list)) {
                    playlist.track_list = [...playlist.track_list, ...value]
                } else {
                    playlist.track_list = [...playlist.track_list, value]
                }
            }
        })
        if (isTitleUpdated) {
            await playlist.generateSlug();
        }
        await playlist.save();
        const populatedPlaylist = await Playlist.findOne({ slug: playlist.slug }).populate('track_list')
        res.send(populatedPlaylist)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/:slug/remove_track', async (req, res) => {
    const track = req.body
    if (!track || !Object.keys(track).length) {
        res.status(400).send('You must edit at least one property to proceed')
    }
    try {
        const playlist = await Playlist.findOne({ slug: req.params.slug });
        const trackList = playlist.track_list
        trackList.splice(track.remove, 1)
        playlist.track_list = trackList
        playlist.save()
        res.send('Track removed')
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