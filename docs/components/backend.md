# Neroli's Lab - Backend

As explained in [Development Setup](../getting-started/development-setup) you should now have Node installed with NVM, set up your development environment and built the common module. We'll now talk about getting the backend up and running.

Start by installing the required node modules with `npm install` inside the backend folder.

Create a .env file directly under the backend folder. Add the following default configuration:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=admin
DATABASE_MIGRATION="UP"
DATABASE_NAME="pokemonsleep"
```

Then start the database (MySQL) with docker compose, run this inside the backend folder:

```bash
docker compose up -d
```

If you need to recreate the database at some point you can bring it down with `docker compose down` before using the up command again.

You can inspect the database with mysql shell: `docker exec -it backend-db-1 mysql -padmin`

## Authentication
For the backend we currently support Google, Discord, and Patreon. They each require a client ID and client secret, as well as a redirect URI to be set up with the provider. You can configure any you would like available locally, but these are not required.

- GOOGLE_CLIENT_ID='\<your google client id\>'
- GOOGLE_CLIENT_SECRET='\<your google client secret\>'
- DISCORD_CLIENT_ID='\<your discord client id\>'
- DISCORD_CLIENT_SECRET='\<your discord client secret\>'
- PATREON_CLIENT_ID='\<your patreon client id\>'
- PATREON_CLIENT_SECRET='\<your patreon client secret\>'

We won't provide the values for these as they are personal, but you can generate them and configure the redirect URI at the related providers. Please follow these documentation links for instructions. The rest is managed by us already:

- [Google documentation](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid): with redirect URI `http://localhost:8001/google`
- [Discord documentation](https://discord.com/developers/docs/topics/oauth2): with redirect URI `http://localhost:8001/discord`
- [Patreon documentation](https://docs.patreon.com/#clients-and-api-keys): with redirect URI `http://localhost:8001/patreon`

If you also want to use the frontend website's login functionality you'll need to set up some additional variables in both .env files (frontend and backend)—please refer to our [frontend documentation](./frontend.md) for how to set up that .env.

## Running backend in development mode

If you installed bun as explained in [Development Setup](../getting-started/development-setup), you are now able to run `npm run dev` or `bun dev`.
This will start the backend in watch mode, directly running Typescript, and hot reload whenever a file is changed.

Bun currently doesn't properly support watching code behind workers, so if you're saving and it doesnt reload you might have to save app.ts instead (this will trigger reload).

The backend will listen to port 3000. The API is reachable using `http://localhost:3000/api` (see the live API docs at [http://localhost:3000/docs](http://localhost:3000/docs))

### Run all automated tests locally

```
npm run test
```

## Development Guidelines

When contributing to the backend component, please follow these guidelines:

### API Design

- **Follow RESTful principles** - Use appropriate HTTP methods and status codes
- **Consistent endpoints** - Follow established URL patterns and naming conventions
- **Follow route patterns** - API route goes into a router file, request validation goes into a controller file, logic goes into a service file

### Database Operations

- **Use our DAO classes (built with Knex) for database operations** - Provides proper type hints and validation for each table interaction
- **Write efficient queries** - Avoid unnecessary database calls or complex queries where possible

### Performance

As some of our tools run millions of simulations per user request—performance is critical. Please consider performance optimization whenever you make changes to the backend.

This is especially true for anything that affects central logic, like our simulation classes.
