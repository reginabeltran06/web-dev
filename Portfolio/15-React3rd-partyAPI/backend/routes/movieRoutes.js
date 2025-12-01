const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().select('title year poster likeCount dislikeCount');
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id); 
    
    if (movie == null) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comment', async (req, res) => {
  try {
    const { name, comment } = req.body;
    const movie = await Movie.findById(req.params.id);

    if (movie == null) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }

    movie.comments.push({ name, comment });
    await movie.save(); 

    res.status(201).json(movie.comments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/:type', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    const { type } = req.params; 

    if (movie == null) {
        return res.status(404).json({ message: 'Película no encontrada' });
    }

    if (type === 'like') {
        movie.likeCount += 1;
    } else if (type === 'dislike') {
        movie.dislikeCount += 1;
    } else {
        return res.status(400).json({ message: 'Tipo de acción no válido' });
    }

    await movie.save();
    res.json({ likeCount: movie.likeCount, dislikeCount: movie.dislikeCount });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;