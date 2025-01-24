# Development setup

The project acts as a monorepo where each module is individually deployed. It's written in Node.js with Typescript. Bun is used in the backend for testing and improved developer experience.

| Application | Description                                                                                                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| common      | A shared module between backend and frontend. This exists so we may share entities like API types without the need of re-implementing them in both backend/frontend                                                                 |
| backend     | This deployment exposes the public API running at [api.sleepapi][api.sleepapi], this API is used by our frontend website at [Neroli's Lab][nerolislab]. The backend is where the simulations, number-crunching and rankings happen. |
| frontend    | The frontend of Neroli's Lab, hosted as a static web application.                                                                                                                                                                   |
| bot         | A work-in-progress Discord bot. Currently this just sets up a basic ping command, but it is deployed and hosted 24/7. There are plans to expand this with functionality from Sleep API.                                             |

|

## Getting started

| Tool   | URL                                   |
| ------ | ------------------------------------- |
| VSCode | <https://code.visualstudio.com/>      |
| NVM    | <https://github.com/nvm-sh/nvm>       |
| docker | <https://bun.sh/>                     |
| bun    | <https://www.docker.com/get-started/> |

On Windows it is recommended to use nvm inside WSL (Windows Subsystem for Linux), but other alternatives like nvm-windows exist.

| Tool | URL                                                     |
| ---- | ------------------------------------------------------- |
| WSL  | <https://learn.microsoft.com/en-us/windows/wsl/install> |

The repository includes `sleepapi.code-workspace`, which can be opened with Visual Studio Code's "Open Workspace From File" to automatically download recommended plugins and linters. Code edited without this workspace should be run through [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/).

### 1. Setup correct version of node

Download the configured version of node. This version is specified in .nvmrc in the root of the repository.

```
nvm install
nvm use
```

### 2. Open workspace in VSCode

The workspace is defined in the file `sleepapi.code-workspace`. Install the recommended extensions when prompted.

### 3. Install and build root and common module

Start by running `npm install` in the root of the project, directly under `nerolis-lab` folder. This will set up eslint and prettier packages which work together with the workspace you set up in the previous step.

After that let's set up the common module. Both the backend and frontend modules use the common module to share entities. Before you start you should install and build the common module.

```
cd common && npm install && npm run build
```

If you add any new entities to the common module you'll need to re-build it before the backend/frontend have access to it.

### 4. See other READMEs for instructions for that package

- [backend](./backend/README.md)
- [frontend](./frontend/README.md)
- [bot](./my-gaim/README.md)

[api.sleepapi]: https://api.sleepapi.net/
[nerolislab]: https://nerolislab.com/
