const request = require('supertest');
const app = require('../../src/index');
const { getUserByEmail } = require('../../src/db');
const jwt = require('jsonwebtoken');
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

const generateToken = user => {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Authentication', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /login', async () => {
    getUserByEmail.mockResolvedValue(user);

    const response = await request(app).post('/login').send({
      email: 'john.doe@example.com',
      password: plainPassword,
    });

    // Validate the response status and content
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('authMiddleware', async () => {
    const token = generateToken(user);

    // Mock the protected route
    app.get('/test-auth', (req, res) => {
      res.status(200).json({ message: 'Authenticated' });
    });

    const response = await request(app)
      .get('/test-auth')
      .set('Authorization', `Bearer ${token}`);

    // Validate the response status and content
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Authenticated');
  });

  test('authMiddleware with invalid token', async () => {
    const response = await request(app)
      .get('/test-auth')
      .set('Authorization', 'Bearer invalid_token');

    // Validate the response status and content
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      'message',
      'Authentication token missing or invalid'
    );
  });

  test('authMiddleware with missing token', async () => {
    const response = await request(app).get('/test-auth');

    // Validate the response status and content
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      'message',
      'Authentication token missing or invalid'
    );
  });
});
