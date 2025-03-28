# Contributing

You can find beginner-friendly issues [here][good first issues].
Start by forking and cloning the repository, you can find a general workflow for contributing to open source projects [HERE](https://github.com/asmeurer/git-workflow)

## Development Setup

The first step to contributing is getting the development environment up and running. Check out [Development Setup](DEVELOPMENT_SETUP.md) to get started.

## Respect the code standard

We're always open to suggestions regarding improvements to the code standard or code structure in place, but until any code standard changes have been enforced; please adhere to the current code structure.

It's better to have a sub-optimal code standard in place, but have all of the code follow this code standard than have more optimal code standard in some places and different code standard in others.

The goal is for everyone to get familiar with the code standard and recognize patterns regardless of which part of Neroli's Lab you're working on.

## Quality Assurance

Please write automated tests for any new functionality added. There are plenty of examples in the code, they are written using vitest.

## Commit standard

We use the well-known [conventional commits][conventional] as commit standard. This is also enforced in our pipeline, so any commits that don't follow this standard won't be allowed to merge.

If you're uncertain about how to write more detailed commits following this format you can always fallback to this shorthand:

```
git commit -m "feat: short description of your task"
```

## Pull requests

Please open your pull requests to the develop branch. Please rebase merge your commits to the develop branch. The develop branch requires linear history (no merge commits). You can do this directly from your PR on Github. For more information on linear history, please read our [linear history document](./LINEAR_HISTORY.md)

## Contributing outside code

Finally, you are always welcome to contribute to the Sleep API community directly on [Discord][Discord]. Whether its feature requests, UI suggestions, bug reports or just interacting with us socially.

Thank you!

[conventional]: https://www.conventionalcommits.org/
[good first issues]: https://github.com/SleepAPI/SleepAPI/contribute
[Discord]: https://discord.gg/ndzTXRHWzK
