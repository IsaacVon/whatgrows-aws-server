const { config } = require('aws-sdk');
const {
  DynamoDBClient,
  ListTablesCommand,
} = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

const region = process.env.AWS_REGION;
const endpoint = process.env.DYNAMODB_ENDPOINT;

config.update({ region, endpoint });

const dynamoDbClient = new DynamoDBClient({ region });
const dynamoDb = DynamoDBDocument.from(dynamoDbClient);

const WhatGrowsUsers = 'WhatGrowsUsers';

let connected = false;

if (endpoint) {
  console.log(`Using DynamoDB endpoint: ${endpoint}`);
}

const connect = async () => {
  if (connected) {
    return;
  }

  try {
    const response = await dynamoDbClient.send(new ListTablesCommand({}));
    if (response.TableNames.length === 0) {
      throw new Error('No tables found in DynamoDB');
    }
    connected = true;
  } catch (error) {
    console.error('Error connecting to DynamoDB:', error);
  }
};

const disconnect = async () => {
  if (!connected) {
    return;
  }

  connected = false;
};

const updateUser = async (email, { name, password, favorites }) => {
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
  return result.Attributes;
};

const createUser = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    email,
    name,
    password: hashedPassword,
    favorites: [],
  };

  await dynamoDb.put({
    TableName: WhatGrowsUsers,
    Item: user,
  });

  return user;
};

const getUserByEmail = async email => {
  const params = {
    TableName: WhatGrowsUsers,
    Key: { email },
  };

  const result = await dynamoDb.get(params);
  return result.Item;
};
const updateUserEmail = async (oldEmail, newEmail, userUpdates) => {
  // Delete the user with the old email
  await deleteUser(oldEmail);

  // Create a new user with the updated email and other attributes
  const newUser = {
    ...userUpdates,
    email: newEmail,
  };

  const createdUser = await createUser(newUser);
  return createdUser;
};

const deleteUser = async email => {
  const params = {
    TableName: WhatGrowsUsers,
    Key: { email },
  };

  await dynamoDb.delete(params);
};

const addFavoritePlant = async (email, favoritePlant) => {
  const user = await getUserByEmail(email);
  user.favorites.push(favoritePlant);

  return updateUser(email, {
    name: user.name,
    password: user.password,
    favorites: user.favorites,
  });
};

const removeFavoritePlant = async (email, plantId) => {
  const user = await getUserByEmail(email);
  const updatedFavorites = user.favorites.filter(
    plant => plant.plantId !== plantId
  );

  return updateUser(email, {
    name: user.name,
    password: user.password,
    favorites: updatedFavorites,
  });
};

const updateFavoritePlantNote = async (email, plantId, newNote) => {
  const user = await getUserByEmail(email);
  const updatedFavorites = user.favorites.map(plant => {
    if (plant.plantId === plantId) {
      return { ...plant, notes: newNote };
    }
    return plant;
  });

  return updateUser(email, {
    name: user.name,
    password: user.password,
    favorites: updatedFavorites,
  });
};

module.exports = {
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
