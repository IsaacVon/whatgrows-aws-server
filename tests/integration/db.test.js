const {
  createUser,
  deleteUser,
  connect,
  disconnect,
  updateUserEmail,
  addFavoritePlant,
  removeFavoritePlant,
  updateFavoritePlantNote,
} = require('../../src/db');
require('dotenv').config();

describe('Database connection', () => {
  test('should connect and disconnect successfully', async () => {
    try {
      await connect();
      await disconnect();
    } catch (error) {
      console.error(
        'Error connecting or disconnecting from the database:',
        error
      );
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
    test('should create a new user', async () => {
      const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        favorites: [],
      };

      const createdUser = await createUser(user);

      expect(createdUser).toHaveProperty('email');
      expect(createdUser.name).toBe(user.name);
      expect(createdUser.email).toBe(user.email);
    });

    test('should update a user email', async () => {
      const oldEmail = 'john.doe@example.com';
      const newEmail = 'jane.doe@example.com';

      const updatedUser = await updateUserEmail(oldEmail, newEmail, {
        name: 'Jane Doe',
        password: 'updatedHashedPassword',
        favorites: [],
      });

      expect(updatedUser).toHaveProperty('email');
      expect(updatedUser.name).toBe('Jane Doe');
      expect(updatedUser.email).toBe(newEmail);
    });

    test('should delete a user', async () => {
      const deletedUser = await deleteUser('1');
      expect(deletedUser).toBeUndefined();
    });
  });
  describe('Favorite plants', () => {
    let testUser;

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
        common_name: 'Test Plant',
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
        common_name: 'Test Plant 2',
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
      expect(updatedPlant.notes).toBe(newNote);
    });
  });
});
