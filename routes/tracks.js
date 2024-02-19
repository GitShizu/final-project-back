import express from 'express';
import Track from '../models/Track.js';

const router = express.Router();
router.use(express.json());

router.post('/', async (req,res)=>{
    try{
        const track = new Track(req.body);
        await track.generateSlug();
        await track.save();
        const tracks = await Track.find({ ...req.ownedOrPublic });
        res.send(tracks);
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/', async(req,res)=>{
    try{
        const tracks = await Track.find({ ...req.ownedOrPublic }).populate('created_by');
        res.send(tracks);
    }catch(e) {
        res.status(500).send('Server error');
    }
})

router.get('/:slug', async(req,res)=>{
    try{
        const track = await Track.findOne({slug: req.params.slug, ...req.ownedOrPublic }).populate('created_by');
        if(track === null){
            throw new Error('Not found')
        }
        res.send(track)
    }catch(e){
        res.status(404).send(e.message)
    }
})

router.patch('/:slug', async(req,res)=>{
    const updatedData = req.body;
    if(!updatedData || !Object.keys(req.body).length){
        res.status(400).send('You must edit at least one property to proceed');
    }
    try{
        const track = await Track.findOne({slug: req.params.slug, ...req.ownedOnly});
        if (!track) {
            return res.status(404).send("Track not found or user unauthhorized");
        }
        if (!track.created_by.equals(req.user._id)) {
            return res.status(401).send("Unauthorized: You are not the owner of this resource");
        }
        const isTitleUpdated = updatedData.title && track.title !== updatedData.title;
        Object.entries(updatedData).forEach(([key,value])=>{
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
        const track = await Track.findOne({slug: req.params.slug, ...req.ownedOnly});
        if (!track) {
            return res.status(404).send("Track not found or user unauthhorized");
        }
        if (!track.created_by.equals(req.user._id)) {
            return res.status(401).send("Unauthorized: You are not the owner of this resource");
        }
        await track.deleteOne();
        const tracks = await Track.find();
        res.send(tracks);
    }catch(e){
        res.status(404).send(e.message);
    }
})

export default router;