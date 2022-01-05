const mongoose = require('mongoose')
const { Schema } = mongoose;

// creating a schema for notes
const notesSchema = new Schema({
    // acting as foreign key so that notes are linked with the user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    // notes details
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})
const notes = mongoose.model('notes', notesSchema);

module.exports = notes;