<a href="https://nerolislab.com/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./backend/src/assets/banner.png">
    <img alt="Neroli's Lab" src="./backend/src/assets/banner-bright.png">
  </picture>
</a>

[![Discord badge][]][Discord invite]
[![codecov](https://codecov.io/gh/nerolis-lab/nerolis-lab/graph/badge.svg?token=ASFVY848GK)](https://codecov.io/gh/nerolis-lab/nerolis-lab)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://www.conventionalcommits.org/en/v1.0.0/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![Semantic Release](https://img.shields.io/badge/Semantic_Release-semver-blue)](https://semver.org/)

Neroli's Lab helps users make informed decisions regarding their investments in Pokémon Sleep. We provide tooling such as production calculators, optimal team composition algorithms, and simulation-based cooking tier lists.

## 🚀 Quick Links

- **<img src="./frontend/public/favicon.svg" width="16" height="16" alt="Website" style="vertical-align: -0.125em;"> [Live Website](https://nerolislab.com)** - Try our tools and calculators
- **<img src="https://di8m9w6rqrh5d.cloudfront.net/1zObrQ89Q4wHhgFCfYIUhMUvmNf4XjxO/big_preview_48848892-a237-4636-8aae-d5f3ff2f6482.png" width="16" alt="Discord" style="vertical-align: -0.125em;"> [Discord Community](https://discord.gg/SP9Ms69ueD)** - Get help and discuss
- **📚 [Documentation](https://docs.nerolislab.com)** - Getting started guides, architecture, and technical specifications

## 🤝 Contribute

Want to contribute? You can find out how to get started on our documentation page:

**🔗 [docs.nerolislab.com →](https://docs.nerolislab.com)**

### 📦 Build And Run Dependencies

To build and run the app locally, you will need:

- Node.js and npm
- Bun
- Docker with Compose support for the backend database
- We recommend using [nvm](https://github.com/nvm-sh/nvm) to install and select the repo's Node.js version for non-Nix setups

### ❄️ Optional Nix Dev Shell
*This option is community-maintained and is not officially supported by the core dev team.*

If you use Nix, this repo includes an optional dev shell:

```bash
nix develop
```

The dev shell provides `node`, `npm`, and `bun`. Docker is still expected to be installed and available on your system outside the dev shell.


## 🛠️ Quick Start

If you want to get the project running locally, follow these docs in order:

1. Start with [Development Setup](https://docs.nerolislab.com/getting-started/development-setup.html): prerequisites, workspace setup, and the shape of the project.
2. Build the shared library using instructions from [Common Library](https://docs.nerolislab.com/components/common.html).
3. Set up the local database and backend environment following [Backend](https://docs.nerolislab.com/components/backend.html).
4. Start the frontend with [Frontend](https://docs.nerolislab.com/components/frontend.html).

## 📄 License

Released under the [Apache 2.0 License](LICENSE.md).

---

[Discord invite]: https://discord.gg/SP9Ms69ueD
[Discord badge]: https://img.shields.io/discord/1300099710996058252?logo=discord
