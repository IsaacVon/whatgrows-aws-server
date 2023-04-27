import supertest from 'supertest';
import app from '../../src/index';
import { createUser, getUserByEmail } from '../../src/db';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

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
    (createUser as jest.Mock).mockResolvedValue(user);

    const response = await supertest(app).post('/users').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(user);
  });

  test('POST /users with error', async () => {
    (createUser as jest.Mock).mockRejectedValue(
      new Error('Error creating user')
    );

    const response = await supertest(app).post('/users').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password',
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Error creating user' });
  });

  test('POST /login with valid credentials', async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(user);

    const response = await supertest(app).post('/login').send({
      email: 'john.doe@example.com',
      password: 'password',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /login with invalid email', async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(null);

    const response = await supertest(app).post('/login').send({
      email: 'wrong.email@example.com',
      password: 'password',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid email or password' });
  });

  test('POST /login with invalid password', async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(user);

    const response = await supertest(app).post('/login').send({
      email: 'john.doe@example.com',
      password: 'wrong_password',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid email or password' });
  });

  test('POST /login with error', async () => {
    (getUserByEmail as jest.Mock).mockRejectedValue(
      new Error('Something went wrong')
    );

    const response = await supertest(app).post('/login').send({
      email: 'john.doe@example.com',
      password: 'password',
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Something went wrong' });
  });
});
