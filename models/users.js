const mongoose = require('mongoose')
const { Schema } = mongoose;

// creating a schema for notes
const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true,
        unique: true // so that there is only one user corressponding to one email
    },
    userPassword: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now // to generate date auto while creating the user
    }
})

const user = mongoose.model('user', userSchema);
user.createIndexes();// for same email id does not create a user

// to create a new collection and save data to the new collection
// const user2=mongoose.model('users2',schema);

module.exports = user;