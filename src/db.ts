import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { config } from 'aws-sdk';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const region = process.env.AWS_REGION;
const endpoint = process.env.DYNAMODB_ENDPOINT;

// the endpoint was undefined because i forgot to import the dotenv/config.. when i fixed it.. the console error matched the github one.
// console.log('region: ', region);

config.update({ region });

const dynamoDbClient = new DynamoDBClient({
  region,
});
const dynamoDb = DynamoDBDocument.from(dynamoDbClient);

const WhatGrowsUsers = 'WhatGrowsUsers';
let connected = false;
interface FavoritePlant {
  _id: string;
  plantId: string;
  commonName: string;
  notes: string;
  image: string;
  plantUrl: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  favorites: FavoritePlant[];
}

export interface NewUser {
  email: string;
  name: string;
  password: string;
}

interface UserUpdates {
  name: string;
  password: string;
  favorites: FavoritePlant[];
}
if (endpoint) {
  console.log(`Using DynamoDB endpoint: ${endpoint}`);
}

async function connect(): Promise<void> {
  if (connected) {
    return;
  }

  try {
    const response = await dynamoDbClient.send(new ListTablesCommand({}));
    if (response.TableNames && response.TableNames.length === 0) {
      throw new Error('No tables found in DynamoDB');
    }
    connected = true;
  } catch (error) {
    console.error('Error connecting to DynamoDB:', error);
    throw error;
  }
}

async function disconnect(): Promise<void> {
  if (!connected) {
    return;
  }
  connected = false;
}

async function updateUser(
  email: string,
  { name, password, favorites }: UserUpdates
): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);

  const updateExpression =
    'SET #name = :name, #password = :password, #favorites = :favorites';

  const params = {
    TableName: WhatGrowsUsers,
    Key: { email },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: {
      '#name': 'name',
      '#password': 'password',
      '#favorites': 'favorites',
    },
    ExpressionAttributeValues: {
      ':name': name,
      ':password': hashedPassword,
      ':favorites': favorites,
    },
    ReturnValues: 'ALL_NEW',
  };

  const result = await dynamoDb.update(params);
  return result.Attributes as User;
}

async function createUser({ name, email, password }: NewUser): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    email,
    name,
    password: hashedPassword,
    favorites: [],
  };

  try {
    await dynamoDb.put({
      TableName: WhatGrowsUsers,
      Item: user,
    });
    const createdUser = await dynamoDb.get({
      TableName: WhatGrowsUsers,
      Key: {
        email,
      },
    });

    return createdUser.Item as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

async function getUserByEmail(email: string): Promise<User> {
  const params = {
    TableName: WhatGrowsUsers,
    Key: { email },
  };

  const result = await dynamoDb.get(params);
  return result.Item as User;
}

async function updateUserEmail(
  oldEmail: string,
  newEmail: string
): Promise<User> {
  const user: User = await getUserByEmail(oldEmail);

  if (!user) {
    throw new Error('User not found');
  }

  await deleteUser(oldEmail);

  const newUser = {
    ...user,
    email: newEmail,
  };

  try {
    await createUser(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to update user email');
  }

  return newUser;
}

async function deleteUser(email: string): Promise<string> {
  const params = {
    TableName: WhatGrowsUsers,
    Key: { email },
  };

  try {
    const result = await dynamoDb.delete(params);

    if (result.$metadata.httpStatusCode !== 200) {
      throw new Error('User not found');
    }

    return `User with email ${email} deleted successfully`;
  } catch (error) {
    console.error(`Error deleting user with email ${email}:`, error);
    throw error;
  }
}

async function addFavoritePlant(
  email: string,
  favoritePlant: FavoritePlant
): Promise<User> {
  const user = await getUserByEmail(email);

  user.favorites.push(favoritePlant);

  return await updateUser(email, {
    name: user.name,
    password: user.password,
    favorites: user.favorites,
  });
}

async function removeFavoritePlant(
  email: string,
  plantId: string
): Promise<User> {
  const user = await getUserByEmail(email);
  const updatedFavorites = user.favorites.filter(
    (plant: FavoritePlant) => plant.plantId !== plantId
  );

  return await updateUser(email, {
    name: user.name,
    password: user.password,
    favorites: updatedFavorites,
  });
}

async function updateFavoritePlantNote(
  email: string,
  plantId: string,
  newNote: string
): Promise<User> {
  const user = await getUserByEmail(email);
  const updatedFavorites = user.favorites.map((plant: FavoritePlant) => {
    if (plant.plantId === plantId) {
      return { ...plant, notes: newNote };
    }
    return plant;
  });

  return await updateUser(email, {
    name: user.name,
    password: user.password,
    favorites: updatedFavorites,
  });
}

export {
  connect,
  disconnect,
  createUser,
  getUserByEmail,
  deleteUser,
  updateUserEmail,
  addFavoritePlant,
  removeFavoritePlant,
  updateFavoritePlantNote,
};
