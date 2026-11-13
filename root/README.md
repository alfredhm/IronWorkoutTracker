# Iron Workout Tracker

Iron Workout Tracker is a workout logging app with a React single-page client and an Express REST API backed by MongoDB through Mongoose. It supports accounts, workout templates and sessions, exercises, sets, and JWT-based authentication.

## Requirements

- Node.js 16 or newer
- MongoDB running locally, or a MongoDB connection URI

## Run locally

From this directory:

1. Copy `.env.example` to `.env` and replace `JWT_PRIVATE_KEY` with a long, unique secret. You can generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
2. Set `MONGODB_URI` if MongoDB is not available at `mongodb://127.0.0.1:27017/tracker`.
3. Install dependencies with `npm ci --prefix server` and `npm ci --prefix client`.
4. Start the API with `npm start`.
5. In another terminal, start the React development server with `npm run start:client`.

The API listens on port 5000 by default; the client development server uses port 3000. In production, set `NODE_ENV=production` and the API serves the built client from `client/build`.

## Build

Run `npm run build --prefix client` to create the production client bundle.
