import supertest from 'supertest';
import app from '../../src/index';
import jwt from 'jsonwebtoken';
import {
  getUserByEmail,
  updateUserEmail,
  deleteUser,
  addFavoritePlant,
  removeFavoritePlant,
  updateFavoritePlantNote,
  User,
} from '../../src/db';
import dotenv from 'dotenv';
dotenv.config();

jest.mock('../../src/db');

const user: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'hashedPassword',
  favorites: [],
};

const token = jwt.sign(user, process.env.JWT_SECRET as string, {
  expiresIn: '1h',
});

describe('Protected Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('PUT /users/:id with valid token', async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(user);
    (updateUserEmail as jest.Mock).mockResolvedValue({
      ...user,
      email: 'john.new@example.com',
    });

    const response = await supertest(app)
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'john.new@example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...user,
      email: 'john.new@example.com',
    });
  });

  test('DELETE /users/:id with valid token', async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(user);
    (deleteUser as jest.Mock).mockResolvedValue(undefined);

    const response = await supertest(app)
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'User deleted' });
  });

  test('POST /users/:id/favorites with valid token', async () => {
    const favoritePlant = { plantId: '1', notes: 'Nice plant' };
    (getUserByEmail as jest.Mock).mockResolvedValue(user);
    (addFavoritePlant as jest.Mock).mockResolvedValue({
      ...user,
      favorites: [favoritePlant],
    });

    const response = await supertest(app)
      .post(`/users/${user.id}/favorites`)
      .set('Authorization', `Bearer ${token}`)
      .send({ plant: favoritePlant });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...user, favorites: [favoritePlant] });
  });

  test('DELETE /users/:id/favorites/:plantId with valid token', async () => {
    const plantId = '1';
    (getUserByEmail as jest.Mock).mockResolvedValue(user);
    (removeFavoritePlant as jest.Mock).mockResolvedValue({
      ...user,
      favorites: [],
    });

    const response = await supertest(app)
      .delete(`/users/${user.id}/favorites/${plantId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...user, favorites: [] });
  });

  test('PATCH /users/:id/favorites/:plantId with valid token', async () => {
    const plantId = '1';
    const updatedNote = 'Updated note';
    const updatedPlant = { plantId, notes: updatedNote };
    (getUserByEmail as jest.Mock).mockResolvedValue(user);
    (updateFavoritePlantNote as jest.Mock).mockResolvedValue({
      ...user,
      favorites: [updatedPlant],
    });

    const response = await supertest(app)
      .patch(`/users/${user.id}/favorites/${plantId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ notes: updatedNote });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...user, favorites: [updatedPlant] });
  });

  test('Access protected route without token', async () => {
    const response = await supertest(app).put(`/users/${user.id}`).send({
      email: 'john.new@example.com',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'Authentication token missing or invalid',
    });
  });

  test('Access protected route with invalid token', async () => {
    const response = await supertest(app)
      .put(`/users/${user.id}`)
      .set('Authorization', 'Bearer invalidToken')
      .send({ email: 'john.new@example.com' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'Authentication token missing or invalid',
    });
  });
});
