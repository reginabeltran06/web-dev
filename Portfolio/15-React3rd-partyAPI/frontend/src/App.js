import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Badge, Row, Col, Form, ListGroup, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/movies'; 

const getAffiliationData = (affiliation) => {
    switch (affiliation) {
        case 'Sith':
            return { fileName: 'sith.png', sideClass: 'evil-side', logoBgClass: 'logo-evil-bg' };
        case 'Empire':
            return { fileName: 'empire.png', sideClass: 'evil-side', logoBgClass: 'logo-evil-bg' };
        case 'Jedi':
            return { fileName: 'jedi.png', sideClass: 'good-side', logoBgClass: 'logo-good-bg' };
        case 'Rebel':
            return { fileName: 'rebel.png', sideClass: 'good-side', logoBgClass: 'logo-good-bg' };
        default:
            return { fileName: 'default_logo.png', sideClass: 'default-side', logoBgClass: 'logo-default-bg' };
    }
};

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ 
      likeCount: movie.likeCount, 
      dislikeCount: movie.dislikeCount 
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleAction = async (type) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${movie._id}/${type}`);
      
      setCounts({
        likeCount: response.data.likeCount,
        dislikeCount: response.data.dislikeCount,
      });

    } catch (error) {
      console.error(`Error sending ${type}:`, error);
      console.log('ALERT: Error sending action. Verify the Backend is running.');
    }
  };

  const affiliationData = getAffiliationData(movie.best_character?.affiliation);
  const { fileName: logoFileName, sideClass, logoBgClass } = affiliationData;
  const logoPath = `/images/${logoFileName}`;

  return (
    <Card 
      bg="dark" 
      text="white" 
      className={`h-100 shadow-lg border-0 ${sideClass} movie-card`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="poster-wrap">
        <Card.Img 
          variant="top" 
          src={`/images/${movie.poster}`} 
          alt={movie.title} 
          className="poster"
          style={{ opacity: isHovered ? 0 : 1 }}
          onError={(e) => { e.target.src = "https://via.placeholder.co/300x450?text=Poster+Missing"; }}
        />
        
        <Card.Img
          variant="top" 
          src={logoPath}
          alt="Affiliation Logo"
          className={`poster logo ${logoBgClass}`}
          style={{ 
              opacity: isHovered ? 1 : 0,
              pointerEvents: isHovered ? 'auto' : 'none' 
          }}
          onError={(e) => { e.target.src = "https://via.placeholder.co/300x450?text=Logo+Missing"; }}
        />
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-white text-center">{movie.title}</Card.Title>
        <Card.Text className="text-white text-center opacity-75">
          Year: {movie.year}
        </Card.Text>
        <div className="mt-auto">
          <div className="d-flex justify-content-center gap-2 mb-3">
            <Button 
              variant="outline-success" 
              size="sm"
              onClick={() => handleAction('like')}
            >
              👍 {counts.likeCount}
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => handleAction('dislike')}
            >
              👎 {counts.dislikeCount}
            </Button>
          </div>
          
          <Button 
            variant="light" 
            className="w-100"
            onClick={() => navigate(`/movie/${movie._id}`)}
          >
            View Detail
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(API_BASE_URL);
        setMovies(response.data);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Could not connect to the server. Ensure the Backend is running on http://localhost:5000.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) return <Spinner animation="border" variant="light" className="d-block mx-auto mt-5" />;
  
  if (error) return (
    <Alert variant="danger" className="mt-5 text-center">
      <strong>Connection Error:</strong> {error}
    </Alert>
  );

  return (
    <Row xs={1} md={2} lg={3} className="g-4"> 
      {movies.map((movie) => (
        <Col key={movie._id}>
          <MovieCard movie={movie} />
        </Col>
      ))}
    </Row>
  );
};

const MovieDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  
  const [form, setForm] = useState({ name: "", comment: "" });

  const fetchMovieDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      setMovie(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching detail:", error);
      setError("Could not load movie details. ID might be invalid or the Backend is unavailable.");
      setMovie(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMovieDetail();
  }, [id, navigate, fetchMovieDetail]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return;

    try {
      
      await axios.post(`${API_BASE_URL}/${id}/comment`, form); 
      setForm({ name: "", comment: "" });
      fetchMovieDetail(); 
    } catch (error) {
       console.log("ALERT: Error saving comment");
    }
  };

  if (loading) return <Spinner animation="border" variant="light" className="d-block mx-auto mt-5" />;
  
  if (error) return (
    <Alert variant="danger" className="mt-5">
      {error} 
      <Button variant="link" onClick={() => navigate('/')}>Back to List</Button>
    </Alert>
  );

  if (!movie) return null; 

  const character = movie.best_character;

  const affiliationColor = 
    character?.affiliation === 'Sith' || character?.affiliation === 'Empire' ? 'danger' : 'primary';

  return (
    <div className="text-white">
      <Button variant="outline-light" className="mb-4" onClick={() => navigate('/')}> 
        &larr; Go Back
      </Button>

      <Card className="shadow-lg border-secondary mb-4 detail-card">
        <Card.Body className="p-0">
          <div className="d-flex align-items-center gap-3 mb-4 border-bottom border-secondary pb-3 px-4"> 
             <h2 className="text-white mb-0">{movie.title}</h2>
             <Badge bg="secondary" className="fs-6">{movie.year}</Badge>
          </div>
          
          <Row className="px-4">
            <Col md={4} className="mb-3">
               <img 
                 src={`/images/${character?.image}`} 
                 alt={character?.name || 'Unknown Character'} 
                 className="img-fluid rounded border border-secondary w-100 object-fit-cover"
                 style={{ maxHeight: '400px' }}
                 onError={(e) => { e.target.src = "https://via.placeholder.co/300x400?text=Character+Missing"; }}
               />
            </Col>
            <Col md={8}>
               <h3 className="h4 text-info">Best Character: {character?.name || 'N/A'}</h3>
               <Badge bg={affiliationColor} className="mb-3 fs-6">
                 {character?.affiliation || 'No Affiliation'}
               </Badge>
               <p className="lead fs-6 character-bio">{character?.bio || 'No bio available.'}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        <Col md={6} className="mb-4">
            <h4 className="border-bottom pb-2 mb-3">Comments ({movie.comments?.length || 0})</h4>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="pe-2">
                {movie.comments?.length === 0 || !movie.comments ? (
                    <p className="text-muted">There are no comments yet, be the first one!</p>
                ) : (
                    <ListGroup variant="flush">
                        {movie.comments.slice().reverse().map((c, i) => (
                            <ListGroup.Item key={i} className="bg-transparent text-white border-bottom border-secondary px-0">
                                <div className="d-flex justify-content-between">
                                    <strong className="text-white">{c.name}</strong> 
                                </div>
                                <p className="mb-0 mt-1 text-light opacity-75">{c.comment}</p>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </div>
        </Col>

        <Col md={6}>
            <Card className="text-white p-3 shadow comment-card"> 
                <h5>Share a Comment</h5>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-2">
                        <Form.Control 
                            type="text" 
                            placeholder="Your Name" 
                            name="name"
                            value={form.name}
                            onChange={handleFormChange}
                            required 
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="Share your thoughts on the movie..." 
                            name="comment"
                            value={form.comment}
                            onChange={handleFormChange}
                            required 
                        />
                    </Form.Group>
                    <Button variant="light" type="submit" className="w-100">Post Comment</Button> 
                </Form>
            </Card>
        </Col>
      </Row>
    </div>
  );
};


// Main App Component
const App = () => {
  const globalStyles = `
    body {
        background-color: #0d0d0d;
        color: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
    }

    .container {
        max-width: 1200px;
    }

    .movie-card {
        background-color: #1a1a1a !important;
        border: 1px solid #333;
        border-radius: 10px;
        overflow: hidden;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .movie-card:hover {
        transform: scale(1.03);
        box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.15);
    }

    .good-side {
        box-shadow: 0 0 12px rgba(0, 180, 255, 0.45) !important;
    }

    .evil-side {
        box-shadow: 0 0 12px rgba(255, 30, 30, 0.45) !important;
    }

    .default-side {
        box-shadow: 0 0 12px rgba(255, 255, 255, 0.45) !important;
    }
    
    .poster-wrap {
        width: 100%;
        height: 350px; 
        overflow: hidden;
        position: relative;
    }

    .poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.3s ease; 
        position: absolute;
        z-index: 1; 
    }
    
    .poster.logo {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: contain; 
        transition: opacity 0.3s ease, background-color 0.3s ease;
        padding: 20px; 
        z-index: 2; 
    }

    .logo-good-bg {
        background-color: rgba(0, 180, 255, 0.1);
    }
    .logo-evil-bg {
        background-color: rgba(255, 30, 30, 0.1);
    }
    .logo-default-bg {
        background-color: rgba(255, 255, 255, 0.1);
    }


    .detail-card {
        background-color: #141414 !important;
        border: 1px solid #333;
        border-radius: 10px;
    }

    .detail-card img {
        border-radius: 10px;
    }

    .comment-card {
        background-color: #222 !important;
        border: 1px solid #333 !important;
        padding: 10px;
        border-radius: 8px;
    }

    input.form-control,
    textarea.form-control {
        background-color: #1f1f1f !important;
        color: #fff !important;
        border: 1px solid #444 !important;
    }
    
    input.form-control:focus,
    textarea.form-control:focus {
        border-color: #ffc107 !important;
        box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.25) !important;
    }

    input.form-control::placeholder,
    textarea.form-control::placeholder {
        color: #aaaaaa !important;
    }

    .btn-primary,
    .btn-success,
    .btn-outline-success,
    .btn-outline-danger {
        font-weight: bold;
    }
    
    /* Main Title */
    .app-title {
      color: white !important;
      font-weight: bold;
    }
    
    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-thumb {
        background: #444;
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #666;
    }

    .character-bio {
        color: #ffffff !important;
    }
    
    .list-group-item.bg-transparent {
        background-color: transparent !important;
    }
  `;

  return (
    <Router>
      <style>{globalStyles}</style> 
      <Container className="my-5">
        <h1 className="text-center mb-5 app-title">Star Wars Movies</h1> 
        <Routes>
          <Route path="/" element={<MovieList />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;