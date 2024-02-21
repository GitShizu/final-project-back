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
//rotta per l'aggiunta di una nuova playlist. Genera lo slug (vedi file modello), salva il documento 
//e restituisce un array con l'intera lista di risorse presenti nella collection. 

router.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find({ ...req.ownedOrPublic })
        .populate('track_list').populate('created_by')
        res.send(playlists)
    } catch (e) {
        res.status(500).send('Server error')
    }
})
//rotta per la lettura di tutte le risorse presenti nella collection. 

router.get('/:slug', async (req, res) => {
    try {
        const playlist = await Playlist.findOne({ slug: req.params.slug, ...req.ownedOrPublic })
        .populate('track_list').populate('created_by')
        if (playlist === null) {
            throw new Error('Playlist not found');
        }
        res.send(playlist);
    } catch (e) {
        res.status(404).send(e.message);
    }
})
//rotta per la lettura di una singola risorsa. Il criterio di ricerca è il suo slug.

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
        if (!playlist.created_by.equals(req.user._id) && !req.user.is_admin) {
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
//rotta per la modifica di una singola risorsa. Il criterio di ricerca è il suo slug.
//Permette la modifica solo allo user che l'ha creata o a un admin. Impedisce la modifica manuale
//dello slug. Se il titolo è stato modificato viene generato un nuovo slug. 
//Prevede l'aggiunta di id tracce all'array track_list come valore singolo o più id dentro un array. 

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
        if (!playlist.created_by.equals(req.user._id) && !req.user.is_admin) {
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
//rotta per la rimozione di tracce dall'array track_list. Il criterio di ricerca è il suo slug. 
//Accetta un oggetto che contiene una proprietà remove.
//il valore di remove è un numero che corrisponde all'indice della traccia da rimuovere. 

router.delete('/:slug', async (req, res) => {
    try {
        const playlist = await Playlist.findOne({ slug: req.params.slug, ...req.ownedOnly });
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
//rotta per l'eliminazione di una risorsa. Il criterio di ricerca è il suo slug.

export default router