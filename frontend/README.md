# Neroli's Lab - Frontend

The frontend is written in Typescript with [Vue.js 3][vue.js] and [Vuetify 3][Vuetify].

## Setup

If you'd like to be able to log in locally please set up a .env file in the frontend root with any of the following:

- VITE_GOOGLE_CLIENT_ID='\<your google client id\>'
- VITE_DISCORD_CLIENT_ID='\<your discord client id\>'
- VITE_PATREON_CLIENT_ID='\<your patreon client id\>'

You will also need to run the backend and the database locally, for more information on setting up cloud providers, the backend and database—please refer to our [backend documentation](../backend/README.md)

## Running the bot in development mode

Everytime a file in the folder is saved, the frontend will be automatically recompiled and restarted using [Vite][Vite].

### Start the development server

```
npm run dev
```

This script cleans, compiles and starts the development server.

### Run all automated tests locally

```
npm run test
```

[vue.js]: https://vuejs.org/
[Vuetify]: https://vuetifyjs.com/en/
[Vite]: https://vitejs.dev/
