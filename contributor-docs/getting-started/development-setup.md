# Development Setup

This guide will help you set up your local development environment for contributing to Neroli's Lab.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Tools

1. **Node.js** (v20 or higher)

   - We recommend using [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) for easy version management. We have a dedicated .nvmrc to align our node versions. _On Windows it is recommended to use nvm inside WSL (Windows Subsystem for Linux), but other alternatives like nvm-windows exist._

   - Install Node.js: `nvm install && nvm use`

2. **Visual Studio Code**

   - We recommend [Visual Studio Code](https://code.visualstudio.com/)
   - Open the project through our \*.code-workspace file
   - Install the recommended extensions when prompted (if you miss the prompt just check recommendations in the workspace file)

### Optional Tools

1. **Bun** (recommended for faster development)

   - [Install Bun](https://bun.sh/) for faster package management and execution

2. **Docker** (for database setup)
   - [Install Docker](https://docs.docker.com/get-docker/)
   - Used for running MySQL database locally

## Initial Setup

### 1. Fork and Clone the Repository

First, fork the repository to your own GitHub account by clicking the "Fork" button on the [main repository page](https://github.com/nerolis-lab/nerolis-lab).

Then clone your fork:

```bash
# Replace 'your-username' with your actual GitHub username
git clone https://github.com/your-username/nerolis-lab.git
cd nerolis-lab

# Add the upstream remote to keep your fork updated
git remote add upstream https://github.com/nerolis-lab/nerolis-lab.git
```

### 2. Open the Workspace in VS Code

Open the cloned repository in VS Code, navigate to the workspace and open it.
Click the green "open workspace" button.

### 3. Install Dependencies and Build Modules

```bash
# Install root dependencies
npm install

# Install dependencies for each component
cd common && npm install && npm run build && cd ..
cd backend && npm install && npm run build && cd ..
cd frontend && npm install && npm run build && cd ..
```

## Component Setup

### Backend Setup

See the [Backend Documentation](../components/backend) for detailed setup instructions including:

- Database configuration
- OAuth provider setup

### Frontend Setup

See the [Frontend Documentation](../components/frontend) for detailed setup instructions including:

- Development server setup
- OAuth client configuration

## Development Workflow

Make sure you have installed and built each module.

### 1. Making Changes

1. **Common Library Changes**: Rebuild with `npm run build` in the common directory. You can also `npm run build-watch` which will automatically rebuild on changes
2. **Component Changes**: The hot-reload from `npm run dev` will handle changes automatically

### 2. Testing

```bash
# Run tests for all components
npm run test

# Hot-reloads the tests on code changes, useful during active test writing
npm run test-watch

# Or run tests for specific components
cd common && npm run test
cd backend && npm run test
cd frontend && npm run test
```

## Environment Configuration

Each component requires its own environment configuration. See the component-specific documentation for details:

- [Backend Environment Setup](../components/backend)
- [Frontend Environment Setup](../components/frontend)
