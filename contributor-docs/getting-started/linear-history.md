# Linear History and Rebasing

First off—why do we enforce linear history and rebasing?

The [commit guide linked from the official Google stylesheet](https://cbea.ms/git-commit) explains it well:

> "A well-cared for log is a beautiful and useful thing. git blame, revert, rebase, log, shortlog and other subcommands come to life. Reviewing others' commits and pull requests becomes something worth doing, and suddenly can be done independently. Understanding why something happened months or years ago becomes not only possible but efficient."

Here are some pros and cons, these are by no means exhaustive, just a selection of important ones.

**Pros:**

- The git log/history becomes a powerful tool for understanding project evolution.
- Encourages thoughtful commits—rebasing pushes developers to organize their commits locally

**Cons:**

- Rebase rewrites history which can be risky when done on shared branches

::: tip Note
At Neroli's Lab, we discourage sharing branches directly. Instead, collaborate through pull requests. For feature work, please use your own branches and open pull requests into the feature branch.
:::

## How to Rebase Your Fork

Follow these steps to keep your fork up-to-date and our commit history linear:

### 1. Fork and Clone the Repository

- Fork the repo on GitHub: [SleepAPI/SleepAPI](https://github.com/SleepAPI/SleepAPI)
- Then clone your fork:

```bash
git clone https://github.com/<your-username>/SleepAPI.git
cd SleepAPI
```

### 2. Add the Upstream Repository

Link your local repo to the original repository:

```bash
git remote add upstream https://github.com/SleepAPI/SleepAPI.git
git fetch upstream
```

### 3. Create and Checkout Your Feature Branch

```bash
git checkout -b my-feature-branch
```

### 4. Rebase Your Branch When the Upstream Changes

- Fetch latest changes:

```bash
git fetch upstream
```

- Rebase your branch:

```bash
git rebase upstream/develop
```

- Resolve any conflicts:

```bash
git add <fixed-files>
git rebase --continue
```

### 5. Force Push Your Rebasing Changes

Since rebasing rewrites history, you'll need to force push.

```bash
git push origin my-feature-branch --force-with-lease
```

### 6. Submit Your Pull Request

Head over to GitHub and open your pull request. Whenever the develop branch changes just repeat steps 4 and 5.

## Final Note

**Ask for Help**: If you get stuck, don't hesitate to reach out. We're all here to help each other!
