import express, { Request, Response } from 'express';

import authMiddleware from './auth';
import {
  deleteUser,
  updateUserEmail,
  addFavoritePlant,
  removeFavoritePlant,
  updateFavoritePlantNote,
} from './db';

const router = express.Router();

router.put(
  '/users/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const updatedUser = await updateUserEmail(req.params.id, req.body.email);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  '/users/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      await deleteUser(req.params.id);
      res.status(200).json({ message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  '/users/:id/favorites',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const updatedUser = await addFavoritePlant(req.params.id, req.body.plant);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  '/users/:id/favorites/:plantId',
  authMiddleware,
  async (req: Request, res: Response) => {
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
  async (req: Request, res: Response) => {
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

export default router;
