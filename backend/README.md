# Neroli's Lab - Backend

As explained in [Development Setup](../DEVELOPMENT_SETUP.md) you should now have Node installed with NVM, set up your development environment and built the common module. We'll now talk about getting the backend up and running.

Start by installing the required node modules with `npm install` inside the backend folder.

Create a .env file directly under the backend folder. Add the following default configuration:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=admin
DATABASE_MIGRATION="UP"
```

Then start the database (MySQL) with docker compose, run this inside the backend folder:

```bash
docker compose up -d
```

If you need to recreate the database at some point you can bring it down with `docker compose down` before using the up command again.

You can inspect the database with mysql shell: `docker exec -it backend-db-1 mysql -padmin`

If you also want to use the frontend website's login functionality you'll need to set up some additional variables in both .env files (frontend and backend)—please refer to our [frontend documentation](../frontend/README.md) for how to set up that .env.

For the backend we currently support Google, Discord and Patreon. They all require a client id and client secret. Pick any one (or multiple) you would like.

- GOOGLE_CLIENT_ID='\<your google client id\>'
- GOOGLE_CLIENT_SECRET='\<your google client id\>'
- DISCORD_CLIENT_ID='\<your discord client id\>'
- DISCORD_CLIENT_SECRET='\<your discord client id\>'
- PATREON_CLIENT_ID='\<your patreon client id\>'
- PATREON_CLIENT_SECRET='\<your patreon client id\>'

I won't provide the values for these as they are personal, but you can generate a pair at the related provider.

Please follow any of these documentations, for any of these you only need to follow the instruction to get a client id, client secret and configure redirect uri. The rest is managed by us already:

- [Google documentation](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid): with redirect uri http://localhost:8001/google
- [Discord documentation](https://discord.com/developers/docs/topics/oauth2): with redirect uri http://localhost:8001/discord
- [Patreon documentation](https://docs.patreon.com/#clients-and-api-keys): with redirect uri http://localhost:8001/patreon

## Running backend in development mode

If you installed bun as explained in [Development Setup](../DEVELOPMENT_SETUP.md), you are now able to run `npm run dev` or `bun dev`.
This will start the backend in watch mode, directly running Typescript, and hot reload whenever a file is changed.

Bun currently doesn't properly support watching code behind workers, so if you're saving and it doesnt reload you might have to save app.ts instead (this will trigger reload).

The backend will listen to port 3000. The API is reachable using <http://localhost:3000/docs>

### Run all automated tests locally

```
npm run test
```
