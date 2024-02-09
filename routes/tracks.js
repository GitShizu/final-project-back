import express from 'express';
import Track from '../models/Track.js';

const router = express.Router();
router.use(express.json());

router.get('/', async(req,res)=>{
    try{
        const tracks = await Track.find();
        res.send(tracks);
    }catch(e) {
        res.status(500).send('Server error');
    }
})

router.post('/', async (req,res)=>{
    try{
        const track = new Track(req.body);
        await track.generateSlug();
        await track.save();
        const tracks = await Track.find();
        res.send(tracks);
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/:slug', async(req,res)=>{
    try{
        const track = await Track.findOne({slug: req.params.slug})
        if(track === null){
            throw new Error('Not found')
        }
        res.send(track)
    }catch(e){
        res.status(404).send(e.message)
    }
})

router.patch('/:slug', async(req,res)=>{
    const updatedTrack = req.body;
    if(!updatedTrack || !Object.keys(req.body).length){
        res.status(400).send('You must edit at least one property to proceed');
    }
    try{
        const track = await Track.findOne({slug: req.params.slug});
        const isTitleUpdated = updatedTrack.title && track.title !== updatedTrack.title;
        Object.entries(updatedTrack).forEach(([key,value])=>{
            if(key !== 'slug'){
                track[key] = value
            }
        })
        if(isTitleUpdated){
            await track.generateSlug()
        }
        await track.save()
        res.send(track)
    }catch(e){
        res.status(400).send(e.message);
    }
})

router.delete('/:slug', async (req,res)=>{
    try{
        await Track.findOneAndDelete({slug: req.params.slug});
        const tracks = await Track.find();
        res.send(tracks);
    }catch(e){
        res.status(404).send(e.message);
    }
})

export default router;