const express = require('express');
const {
  deleteUser,
  updateUserEmail,
  addFavoritePlant,
  removeFavoritePlant,
  updateFavoritePlantNote,
} = require('./db');
const authMiddleware = require('./auth');

const router = express.Router();

router.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    const updatedUser = await updateUserEmail(req.params.id, req.body.email);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/users/:id/favorites', authMiddleware, async (req, res) => {
  try {
    const updatedUser = await addFavoritePlant(req.params.id, req.body.plant);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete(
  '/users/:id/favorites/:plantId',
  authMiddleware,
  async (req, res) => {
    try {
      const updatedUser = await removeFavoritePlant(
        req.params.id,
        req.params.plantId
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  '/users/:id/favorites/:plantId',
  authMiddleware,
  async (req, res) => {
    try {
      const updatedUser = await updateFavoritePlantNote(
        req.params.id,
        req.params.plantId,
        req.body.note
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
