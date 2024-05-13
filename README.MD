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
    "editor.formatOnSave": true 
  }
`

##### Ensure the project dependencies are installed and up to date.

If there are **node_modules** or **package-lock.json** present in a newly cloned project, delete them to ensure no outdated or platform-incompatible dependencies are used.

Now, run `npm i` or `npm install` to pull whatever is listed in **dependencies** and **devDependencies** of the **package.json**.

###### You're all set.

### Project structure

#### General overview

    ├── dist         # Compiled files. Folder name is changed by setting the outDir parameter in tsconfig.json. Auto-generated when tsc is invoked.
    ├── assets       # Static media content (external accessibility implied):
    ├── src          # Source files. Only contains Jacascript/Typescript compatible formats (js / jsx, ts / tsx, mjs, json);
        ├── shared          # In this project, this dir includes code shared between client and server. Alternatively, lib.
        ├── server          # Self-descriptive.
        ├── client          # Self-descriptive.
    ├── node_modules # External dependencies pulled via npm install. NEVER include this folder to a git repo to avoid git tree bloating.
    └── README.md   # YOU ARE HERE

#### Module structure

Maintaining a comprehensive structure within functional modules is a pratice worth following. It will save time and effort both reading and developing code.

In this project, the structure is quite generic.

    ├── (module root)
        ├── services          # contains elements of the business logic, segmented by domain. In most cases, a service is stateful and thus is exported as a singleton object.
            ├── someService/  #
                ├── index.ts      # service root. Exports the instance of the service. Export name usually matches the dir name.
                ├── constants.ts  # contains constant values used throughout the service.
                ├── config.ts     # (optional) if there are runtime constant values dependent on environment, sometimes they are stored in a separate file.
                ├── types.ts      # All things type: definitions, type checkers etc.
                ├── utils/        # Stateless utility stuff. Usually a collection on named or lambda functions.
                ├── helpers/      # Stateful utility stuff. Occasionally merged with utils
        ├── controllers       # Toolchain to handle external input, dispatch it to respective services and return a result
        ├── routes       # Often combined with controllers. Maps input routes to controller methods
        ├── config            # Self-descriptive.

#### Project file structure

The general rule is: a file should be as atomic is possible.

Since import/export module system is basically object oriented programming in disguise, putting everything to one single file is pretty much like creating a god class, which is a well known antipattern.

To keep it atomic, do the following:

- if there is a class, it has to be the only export. If you instantiate it right there, in most cases there will be one or two exports - either the class and the object, or the object only. (Exclusion: this particular module is a collection of utility classes, such as specific error types);

- if there is a function initially developed for one of the modules and then reused elsewhere, extract it to a separate file with a separate export. These usually go to /utils of your project;

- if a class has non-static methods that don't refer to **this** object (and are thus in fact context-independent), put them to /utils as well. They are most likely independent of the classes' domain;

#### Named exports vs default exports

Given the atomicity, you might feel like resorting to the default export syntax (`export default new Something()`) instead of named exports (`export const something = new Something()`).

In smaller projects, this is, well, okay. But it is way better to keep to the named ones.

1. Named exports are easier to handle and refactor. Default exports are natively imported under whatever name possible. (`import randomImportName from 'something'`). Thus you are definitely having a hard time once you want to find all occurences of importing **something**. With named export, import name matches the export name, unless declared explicitly. And even if you rename the import deliberately, you'll be able to look it up by the exported name, as it goes `import { whyWouldICallItThisWay: something } from something` with both initial and replacement names in one line.

2. Named exports work great with your IDE. Import suggestion is quite faulty when there is just some generic nameless default export, but with named exports your IDE will know you are trying to refer to a particular value once you type its name.

3. It saves your memory and storage (to a degree). If there are multiple exports in a file, and you only import one of them, the others will not be stored in the memory unless they are needed. And with module bundlers capable of rearranging the code (say, WebPack or Babel), using the named exports allows for detecting the lesser used or unused exports and basically exclude them from the resulting package.

#### Object-oriented vs functional style

This project is written in object-oriented paradigm with a slight addition of arrow functions. But you can freely extend it the way you want. Unlike many other languages, Typescript and Javascript are multiparadigm: it means, you can write both object-oriented, functional and procedural-ish code. Even within one project, or module, or file. And all the parts will get along just fine.
