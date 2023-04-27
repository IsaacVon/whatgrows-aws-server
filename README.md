# HTTP AWS API Gateway Lambda - WhatGrows

This project provides an API for the WhatGrows application. The API is built using AWS API Gateway, Lambda, and Node.js. It manages user authentication and CRUD operations for user data, including favorite plants.

## Database Interfaces

```typescript
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
```

## API Routes

### Public routes:

- `POST /users`: Create a new user
- `POST /login`: Login and receive an authentication token

### Protected routes (with auth middleware):

- `PUT /users/:id`: Update a user's email
- `DELETE /users/:id`: Delete a user
- `POST /users/:id/favorites`: Add a favorite plant to a user
- `DELETE /users/:id/favorites/:plantId`: Remove a favorite plant from a user
- `PATCH /users/:id/favorites/:plantId`: Update a favorite plant's note

## Usage

To use the API, make HTTP requests to the appropriate routes with the required payload. For protected routes, include the authentication token obtained from the `/login` route in the `Authorization` header, following the format: `Bearer <token>`.

## License

This project is open-source and available under the MIT License.
