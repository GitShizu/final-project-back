import express from 'express';
import Playlist from '../models/Playlist.js';
import Track from '../models/Track.js';

const router = express.Router();
router.use(express.json());



router.post('/', async (req, res) => {
    try {
        const playlist = new Playlist(req.body);
        await playlist.generateSlug();
        await playlist.save();
        const playlists = await Playlist.find({ ...req.ownedOrPublic }).populate('track_list');
        res.send(playlists);
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find({ ...req.ownedOrPublic }).populate('track_list')
        res.send(playlists)
    } catch (e) {
        res.status(500).send('Server error')
    }
})

router.get('/:slug', async (req, res) => {
    try {
        const playlist = await Playlist.findOne({ slug: req.params.slug, ...req.ownedOrPublic }).populate('track_list')
        if (playlist === null) {
            throw new Error('Playlist not found');
        }
        res.send(playlist);
    } catch (e) {
        res.status(404).send(e.message);
    }
})

router.patch('/:slug', async (req, res) => {
    const updatedData = req.body
    if (!updatedData || !Object.keys(updatedData).length) {
        res.status(400).send('You must edit at least one property to proceed')
    }
    try {
        const playlist = await Playlist.findOne({ slug: req.params.slug, ...req.ownedOnly });
        if (!playlist) {
            return res.status(404).send("Playlist not found or user unauthhorized");
        }
        if (!playlist.created_by.equals(req.user._id)) {
            return res.status(401).send("Unauthorized: You are not the owner of this resource");
        }
        const isTitleUpdated = updatedData.title && playlist.title !== updatedData.title;
        Object.entries(updatedData).forEach(([key, value]) => {
            if (key !== 'slug' && key !== 'track_list') {
                playlist[key] = value;
            }

            if (key === 'track_list') {
                if (Array.isArray(updatedData.track_list)) {
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
        const playlist = await Playlist.findOne({ slug: req.params.slug, ...req.ownedOnly });
        if (!playlist) {
            return res.status(404).send("Playlist not found or user unauthhorized");
        }
        if (!playlist.created_by.equals(req.user._id)) {
            return res.status(401).send("Unauthorized: You are not the owner of this resource");
        }
        const trackList = playlist.track_list
        trackList.splice(track.remove, 1)
        playlist.track_list = trackList
        await playlist.save()
        const populatedPlaylist = await Playlist.findOne({ slug: playlist.slug }).populate('track_list')
        res.send(populatedPlaylist)

    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.delete('/:slug', async (req, res) => {
    try {
        const playlist = await Playlist.findOne({ slug: req.params.slug, ...ownedOnly });
        if (!playlist) {
            return res.status(404).send("Playlist not found or user unauthhorized");
        }
        if (!playlist.created_by.equals(req.user._id)) {
            return res.status(401).send("Unauthorized: You are not the owner of this resource");
        }
        await playlist.deleteOne();
        const playlists = await Playlist.find();
        res.send(playlists);
    } catch (e) {
        res.status(404).send(e.message)
    }
})

export default router