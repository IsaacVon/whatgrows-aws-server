import {
  createUser,
  deleteUser,
  connect,
  disconnect,
  updateUserEmail,
  addFavoritePlant,
  removeFavoritePlant,
  updateFavoritePlantNote,
  User,
  NewUser,
} from '../../src/db';
import 'dotenv/config';

describe('Database connection', () => {
  test('should connect and disconnect successfully', async () => {
    expect.assertions(1);

    try {
      await connect();
      await disconnect();
      expect(true).toBeTruthy(); // Just an expectation to make sure the test reaches this point without errors
    } catch (error) {
      console.error(
        'Error connecting or disconnecting from the database:',
        error
      );
      throw error; // Throw the error so the test fails
    }
  });
});

describe('Database operations', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  describe('User Management', () => {
    const user: NewUser = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedPassword',
    };

    test('should create a new user', async () => {
      const response = await createUser(user);
      expect(response.password).toBeDefined();
      expect(response.favorites).toBeDefined();
      expect(response.password).not.toEqual(user.password); // confirm password gets hashed
      expect(response.name).toEqual(user.name);
      expect(response.email).toEqual(user.email);
    });

    test('should update a user email', async () => {
      const oldEmail = user.email;
      const newEmail = 'jane.doe@example.com';

      const updatedUser = await updateUserEmail(oldEmail, newEmail);

      expect(updatedUser).toHaveProperty('email');
      expect(updatedUser.email).toBe(newEmail);
    });

    test('should delete a user', async () => {
      const response = await deleteUser(user.email);
      expect(response).toEqual(
        `User with email ${user.email} deleted successfully`
      );
    });
  });

  describe('Favorite plants', () => {
    let testUser: User;

    beforeAll(async () => {
      testUser = await createUser({
        name: 'Test User',
        email: 'test.user@example.com',
        password: 'testPassword',
      });
    });

    afterAll(async () => {
      await deleteUser(testUser.email);
    });

    test('should add a favorite plant', async () => {
      const favoritePlant = {
        _id: '1',
        plantId: '1',
        commonName: 'Test Plant',
        notes: '',
        image: 'https://example.com/test-plant.jpg',
        plantUrl: 'https://example.com/test-plant',
      };

      const updatedUser = await addFavoritePlant(testUser.email, favoritePlant);
      expect(updatedUser.favorites).toContainEqual(favoritePlant);
    });

    test('should remove a favorite plant', async () => {
      const plantId = '1';

      const updatedUser = await removeFavoritePlant(testUser.email, plantId);
      const removedPlant = updatedUser.favorites.find(
        plant => plant.plantId === plantId
      );
      expect(removedPlant).toBeUndefined();
    });

    test('should update a favorite plant note', async () => {
      const favoritePlant = {
        _id: '2',
        plantId: '2',
        commonName: 'Test Plant 2',
        notes: '',
        image: 'https://example.com/test-plant-2.jpg',
        plantUrl: 'https://example.com/test-plant-2',
      };

      await addFavoritePlant(testUser.email, favoritePlant);

      const newNote = 'This is a new note for Test Plant 2';
      const updatedUser = await updateFavoritePlantNote(
        testUser.email,
        favoritePlant.plantId,
        newNote
      );
      const updatedPlant = updatedUser.favorites.find(
        plant => plant.plantId === favoritePlant.plantId
      );
      if (updatedPlant) {
        expect(updatedPlant.notes).toBe(newNote);
      } else {
        throw new Error('Updated plant not found');
      }
      expect(updatedPlant.notes).toBe(newNote);
    });
  });
});
