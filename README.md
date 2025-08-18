## Tours and Travel App

An Angular 20 SSR-enabled travel discovery app for activities, hotels, restaurants, and AI-powered search.

### Prerequisites
* Node.js 18+ (or 20+)
* npm 9+
* (optional) Angular CLI globally: `npm i -g @angular/cli`

### Installation
* `npm install` (install dependencies)
* `npm outdated` (optional: verify dependency updates)

### Development
* `npm run dev` (alias: `npm start`)
* Open `http://localhost:4200`

## Linter
* `npm run lint`

## Tests
* `npm run test`
* `npm run test:headless`
* `npm run coverage`

### Build (SSR)
* `npm run build` (builds browser and server bundles into `dist/tours-and-travel`)
* `npm run serve` (runs the Node SSR server)
  * Default port: `4000` (override with `PORT=xxxx`)

### Production
* `npm run build` then `npm run serve`
* Open `http://localhost:4000`

### Firebase Hosting
This project includes a Firebase Hosting setup for static deployment of the browser build (no SSR on Hosting).
* `npm run firebase:login` (login to Firebase)
* `npm run firebase:use` (select your Firebase project)
* `npm run firebase:serve` (emulate hosting locally)
* `npm run firebase:deploy` (deploy only hosting)
* `npm run deploy` (build then deploy hosting)

### Available Scripts
* **dev/start**: Run the dev server at `http://localhost:4200`
* **build**: Build for production (SSR output in `dist/tours-and-travel`)
* **serve**: Start Node SSR server from the build (`http://localhost:4000` by default)
* **watch**: Rebuild on changes (development)
* **lint**: Run ESLint
* **test**: Run unit tests (watch)
* **test:headless**: Run unit tests once in headless Chrome
* **coverage**: Generate test coverage report
* **firebase:login/use/serve/deploy**: Firebase workflows
* **deploy**: Build then deploy to Firebase Hosting

### Author
* Author  : Carl Victor "Vicky" Datu
### Installation
* `npm install` (installing dependencies)
* `npm outdated` (verifying dependencies)

### Developpement
* `npm run start`
* in your browser [http://localhost:4200](http://localhost:4200) 

## Linter
* `npm run lint`

## Tests
* `npm run test`
* `npm run coverage`

### Compilation
* `npm run build`       ( without SSR)

### Production
* `npm run serve`
* in your browser [http://localhost:4000](http://localhost:4000) 


### Author
* Author  : Carl Victor "Vicky" Datu
