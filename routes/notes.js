const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchUser = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');


// Route 1: get all the notes of the user using GET: Login required, fetchUser is used as middleware so that it verifies the access token(id included) and in return gives the user of that id
router.get('/fetchAllNotes', fetchUser, async (req, res) => {
    const notes = await Notes.find({ user: req.user.id })
    res.json(notes);
})

// Route 2: Create a note using POST : Login required
router.post('/createNote', fetchUser, [
    body('title', "Title cant be blank").isLength({ min: 1 }),
    body('description', "description cant be blank").isLength({ min: 1 }),
    body('tag', "tag cant be blank").isLength({ min: 1 })
], async (req, res) => {
    try {
        const { title, description, tag } = req.body; // destructuring from req.body
        const error = validationResult(req);
        if (!error.isEmpty()) {
            // console.log(error.array);
            return res.status(400).json({ errors: error.array });
        }
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savenotes = await note.save();
        res.json(savenotes);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// Route 3: Updating an existing note using PUT : Login required
router.put('/updateNote/:id',fetchUser,[
    body('title', "Title cant be blank").isLength({ min: 1 }),
    body('description', "description cant be blank").isLength({ min: 1 }),
    body('tag', "tag cant be blank").isLength({ min: 1 })
],async (req,res)=>{
    const {title,description,tag}=req.body;

    // create a newnote object
    const newnote={};
    
    if(title)
    newnote.title=title;
    if(description)
    newnote.description=description;
    if(tag)
    newnote.tag=tag;

    // find the note to update and update it
    let note=await Notes.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")}
    // to authonticate that the user is same(whose notes is) which is trying to update
    if(note.user.toString()!== req.user.id)
    {
        return res.status(401).send("Not Allowed");
    }
    note=await Notes.findByIdAndUpdate(req.params.id,{$set:newnote},{new:true})
    res.json({note});
})

// Route 4: Deleting an existing note using DELETE : Login required
router.delete('/deleteNote/:id',fetchUser,async (req,res)=>{
    let note=await Notes.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")}
    if(note.user.toString()!== req.user.id)
    {
        return res.status(401).send("Not Allowed");
    }
    note=await Notes.findByIdAndDelete(req.params.id)
    res.send("Successfully deleted")
})

module.exports = router;