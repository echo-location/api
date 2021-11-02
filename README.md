## api

Official API for echoLocation.

```
$ curl --request GET http://localhost:8000/user # dev
```

#### Requirements

##### Global

- `cors` : Provide middleware for Cross-origin resource sharing (CORS)
- `dotenv` : Access .env configuration files
- `express` : Minimal Node framework for client-server.
- `mongoose` : Tool for MongoDB schema modelling.

##### Development

- `@babel/core` : Babel core compiler (support Javacript backwards compatibility in browsers/environments).
- `@babel/node` : Babel command line tools (Node-based transpilation/compilation).
- `@babel/preset-env` : Official preset for ES6+ transpilation.
- `babel/jest` : Babel support for Jest testing library.
- `jest` : Testing library with Node + MongoDB support.
- `mongodb-memory-server` : Provide in-memory MongoDB that doesn't affect main database. Useful for testing & debugging.
- `nodemon` : Tool for automatically restarting Node on file change.
- `regenerator-runtime` : Allows async/await
  compatibility.
- `supertest` : Library for testing HTTPS server.
- `husky` : Improves git hooks.

#### Installation

```
git clone https://github.com/echo-location/api
npm i
npm start
```

#### Branches

- For setting up branches for future development, consult the following syntax.
- **Syntax**

  - Branches should be written as `{FEATURE}-{firstName}{lastName}`
  - For example, a component for a report button would have a branch labelled `reportButton-johnDoe`

- `git checkout -b {branchName}` : Create a new branch.
- `git branch -a` : View all branches in local & origin repository
- `git checkout {branchName}` : Check out an exisitng branch.

#### Webhooks

- [Discord](https://github.com/Falconerd/discord-bot-github)
