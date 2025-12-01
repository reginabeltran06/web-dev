require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

const movieRoutes = require('./routes/movieRoutes'); 
app.use('/api/movies', movieRoutes); 

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});