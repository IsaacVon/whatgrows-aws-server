const request = require('supertest');
const app = require('../../src/index');
const { createUser, getUserByEmail } = require('../../src/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

jest.mock('../../src/db');

const plainPassword = 'password';
const hashedPassword = bcrypt.hashSync(plainPassword, 10);

const user = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: hashedPassword,
  favorites: [],
};

describe('Public Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /users', async () => {
    createUser.mockResolvedValue(user);

    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(user);
  });

  test('POST /users with error', async () => {
    createUser.mockRejectedValue(new Error('Error creating user'));

    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password',
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Error creating user' });
  });

  test('POST /login with valid credentials', async () => {
    getUserByEmail.mockResolvedValue(user);

    const response = await request(app).post('/login').send({
      email: 'john.doe@example.com',
      password: 'password',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /login with invalid email', async () => {
    getUserByEmail.mockResolvedValue(null);

    const response = await request(app).post('/login').send({
      email: 'wrong.email@example.com',
      password: 'password',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid email or password' });
  });

  test('POST /login with invalid password', async () => {
    getUserByEmail.mockResolvedValue(user);

    const response = await request(app).post('/login').send({
      email: 'john.doe@example.com',
      password: 'wrong_password',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid email or password' });
  });

  test('POST /login with error', async () => {
    getUserByEmail.mockRejectedValue(new Error('Something went wrong'));

    const response = await request(app).post('/login').send({
      email: 'john.doe@example.com',
      password: 'password',
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Something went wrong' });
  });
});
