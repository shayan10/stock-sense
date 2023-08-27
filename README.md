# StockSense

## Overview

StockSense is an application that allows users to integrate their investment accounts and track their portfolio performance in real-time. Some of the key features include:

- **Plaid Link Integration:** The application uses the Plaid Link API for secure authentication and retrieval of user's financial holdings, including details such as ticker symbols, quantities, and cost basis.

- **Historical and Real-Time Performance Monitoring:** Utilizing Finnhub's REST API and WebSocket services, StockSense provides both historical and real-time price information for tracking portfolio performance.

- **Real-Time Candlestick Visualizations:** Powered by the JP Morgan Perspective Framework, StockSense renders minute-by-minute candlestick charts. These candles are aggregated in real-time during trading hours.

- **Access/Refresh Token Authentication:** The application employs JWTs and a Token Blacklist approach using Redis for robust access and refresh token-based authentication. Learn more about the Authentication Service [here](link_to_authentication_service_documentation).

**Technologies Used:** TypeScript, Node.js, React.js, Socket.IO, WebSockets, PostgreSQL, Redis, Kysely, Jest.

## Table of Contents

- [Overview](#overview)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [UML Diagrams](#uml-diagrams)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)

## Usage

**Prerequisites**:
  - Please make sure to have a Plaid API Key ready. You can get your free API Key [here](https://dashboard.plaid.com/signup)
  - Please ensure you have Node Version Manager (nvm) and the TypeScript Compiler installed. You can verify both are installed by running these commands:
    ```bash
      nvm -v  # To verify nvm installation
      tsc -v  # To verify tsc installation
    ```
### Running the Node.js Backend

1. First clone this repository and navigate to server/:
```bash
  git clone https://github.com/shayan10/stock-sense.git
  # Navigate to server/
  cd server
  # Install dependencies
  npm install
```

2. Create a `.env` file with the following information. The `DATABASE_URL` variable is required locally for the `node-pg-migrate` module.

Here is an example template of the `.env` file: 

```bash
  POSTGRES_HOST=localhost
  POSTGRES_DB=name
  POSTGRES_USER=johndoe
  POSTGRES_PASSWORD=helloWorld
  POSTGRES_PORT=5432
  DATABASE_URL=postgres://POSTGRES_USER:POSTGRES_PASSWORD@localhost/POSTGRES_DB
  JWT_SECRET=example-key
  PORT=3000
  PLAID_CLIENT_ID=example-key
  PLAID_CLIENT_SECRET=example-key
  FINNHUB_API_KEY=example-key
```

If you would like to run this project locally, please make sure you have a running instance of PostgreSQL and Redis on your system.
Otherwise, you can run this project using Docker.

```bash
  # Sets up the PostgreSQL and Redis containers
  docker-compose up -d
```

3. Then, run the following commands:
```bash
  # To run the migrations
  npm run migrate:up
  # Generating the TypeScript definitions from the Database Tables
  npm run generate:types
  # Then, start the server
  npm run dev
```

You should then see this result:
```bash
> stock-sense@1.0.0 dev
> nodemon

[nodemon] 2.0.22
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): src/**/*
[nodemon] watching extensions: ts,json
[nodemon] starting `ts-node ./src/index.ts`
Connected to redis!
Connected to Postgres!
Server started on port 3000
```
### Running the React App
1. Navigate to the `client/` directory in a separate window: `cd client/`

2. Install the dependencies: `npm install`
3. Run `npm start`


## Screenshots

Include screenshots or GIFs showcasing the user interface or different aspects of your project.

## UML Diagrams

Include UML diagrams to visualize the architecture, relationships between components, or design patterns used.

## Limitations

List any known limitations or areas where the project could be improved.

## Future Improvements

Suggest potential future enhancements or features that could be added to the project.

## Demo

Provide a link to the live demo of your project if available.

## Contact

If you have any questions or feedback, feel free to contact me at [your@email.com](mailto:your@email.com).

---

Licensed under the [MIT License](LICENSE).
