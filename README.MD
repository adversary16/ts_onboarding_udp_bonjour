## Configuring

The service is generally config-less. The only there adjustable parameters are:

- UDP_SERVICE_SERVER_PORT: an integer port number for server to listen on;
- UDP_CLIENT_PERSISTENT_ID: a UUID string that will be used as client Id instead of the one randomly generated on startup.

Both parameters are set via environment variables, either set via CLI or .env file.

## Running

### Development mode

Run `npm run dev` from the project root to start both client and server in watch mode.

To start either client or server separately, call `npm run client-dev` (client) or `npm run server-dev` respectively from the project root.

### Production mode

Run `npm run start` from the project root to build and launch both client and server in prod mode.

To start either client or server separately run `npm run prestart` to compile the source code, and then call `npm run client` or `npm run server` to get the respective script running.

## Developing

### Prepare your environment

This project is guaranteedly compatible with Node v18 and up.

#### Install NodeJS

Best way to get all the different node versions you might require is NVM, the Node Version Manager. This is a CLI utility that lets you switch between Node versions on-the-fly.

For Linux and Mac, there is an [official NVM repo](https://github.com/nvm-sh/nvm). Follow the instruction enclosed to set it up on your system.

For Windows, use Nvm-Windows, a similar project pursuing the same goal. Check their [GitHub repo](https://github.com/coreybutler/nvm-windows) for installation instructions.

Alternatively, you can use Docker and Docker Compose to containerize your environment.

#### Configure your IDE

This project was developed in Visual Studio Code. You are free to use any other IDE of your liking, but if you are new to Node \ TypeScript development, Visual Studio Code might be the best fit.

##### Extensions

The bare minimum to make your work environment more convenient includes two extensions:

- ESLint (dbaeumer.vscode-eslint). This extension integrates with ESlint the Javascript/Typescript linting to provide handy syntax and error highlighting and even fix common errors automatically.
- Prettier (esbenp.prettier-vscode). This extension integrates with Prettier the code tidier for Javascript/Typescript and helps you maintain a code style zero effort.

##### Enabling auto-tidying for your project

Once the extensions are all set, ensure there is a **.vscode** directory in your project root, and there is a file **settings.json** inside it. If either is missing, create both.

Put these lines settings.json to enable on-save automated formatting, and to delegate this formatting to Prettier:

`{
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
  }`
