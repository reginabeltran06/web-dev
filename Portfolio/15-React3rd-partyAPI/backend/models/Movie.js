const mongoose = require('mongoose');

const bestCharacterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    affiliation: { type: String },
    image: { type: String },
    bio: { type: String },
}, { _id: false }); 

const commentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const movieSchema = new mongoose.Schema({
    episode: { type: String, required: true },
    title: { type: String, required: true },
    year: { type: Number, required: true },
    poster: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 },
    comments: [commentSchema],
    
    best_character: { 
        type: bestCharacterSchema, 
        required: true 
    }
});

module.exports = mongoose.model('Movie', movieSchema);