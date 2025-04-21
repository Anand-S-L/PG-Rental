const PG = require('../models/pg.model');

// Get all PGs with optional filtering
exports.findAll = (req, res) => {
  try {
    const filter = {
      location: req.query.location,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      roomType: req.query.roomType,
      amenities: req.query.amenities
    };

    const pgs = PG.findAll(filter);
    res.json(pgs);
  } catch (err) {
    console.error('Error in findAll:', err);
    res.status(500).json({ message: 'Error retrieving PGs', error: err.message });
  }
};

// Get a single PG by ID
exports.findOne = (req, res) => {
  try {
    const id = req.params.id;
    const pg = PG.findById(id);

    if (!pg) {
      return res.status(404).json({ message: `PG with id ${id} not found` });
    }

    res.json(pg);
  } catch (err) {
    console.error('Error in findOne:', err);
    res.status(500).json({ message: 'Error retrieving PG', error: err.message });
  }
};

// Create a new PG
exports.create = (req, res) => {
  try {
    // Validate request
    if (!req.body.title || !req.body.description || !req.body.location) {
      return res.status(400).json({ message: 'Title, description, and location are required fields' });
    }

    // Create a new PG
    const pg = PG.create(req.body);
    res.status(201).json(pg);
  } catch (err) {
    console.error('Error in create:', err);
    res.status(500).json({ message: 'Error creating PG', error: err.message });
  }
};

// Update a PG
exports.update = (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate request
    if (!req.body.title || !req.body.description || !req.body.location) {
      return res.status(400).json({ message: 'Title, description, and location are required fields' });
    }

    const updatedPG = PG.update(id, req.body);

    if (!updatedPG) {
      return res.status(404).json({ message: `PG with id ${id} not found` });
    }

    res.json(updatedPG);
  } catch (err) {
    console.error('Error in update:', err);
    res.status(500).json({ message: 'Error updating PG', error: err.message });
  }
};

// Delete a PG
exports.delete = (req, res) => {
  try {
    const id = req.params.id;
    const success = PG.delete(id);

    if (!success) {
      return res.status(404).json({ message: `PG with id ${id} not found` });
    }

    res.json({ message: 'PG deleted successfully' });
  } catch (err) {
    console.error('Error in delete:', err);
    res.status(500).json({ message: 'Error deleting PG', error: err.message });
  }
};
