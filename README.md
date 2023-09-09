# StockSense

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Usage](#usage)
- [Architecture](#architecture)
- [Optimizations](#optimizations)
- [Challenges](#challenges)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)

## Overview

Users often have their investments spread across numerous their brokerage, 401k, Roth IRA, and other retirement accounts. It can be tedious to keep track of these investments and get a comprehensive view of their market performance. I wanted to use my skills in designing REST APIs and API integration to build a robust and secure application which allows users to keep track of their holdings across all their accounts. Here are some of the key features include:

- **Plaid Link Integration:** The application uses the Plaid Link API for secure authentication and retrieval of user's financial holdings, including details such as ticker symbols, quantities, and cost basis.

- **Historical and Real-Time Performance Monitoring:** Utilizing Finnhub's REST API and WebSocket services, StockSense provides both historical and real-time price information for tracking portfolio performance.

- **Real-Time Candlestick Visualizations:** Powered by the JP Morgan Perspective Framework, StockSense renders minute-by-minute candlestick charts. These candles are aggregated in real-time during trading hours.

- **Access/Refresh Token Authentication:** The application employs JWTs and a Token Blacklist approach using Redis for robust access and refresh token-based authentication. Learn more about the Authentication Service [here](https://github.com/shayan10/stock-sense/tree/main/server/src/services/authentication).

**Technologies Used:** TypeScript, Node.js, React.js, Socket.IO, WebSockets, PostgreSQL, Redis, Kysely, Jest.


## Screenshots

Include screenshots or GIFs showcasing the user interface or different aspects of your project.

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

2. Create a `.env` file with the following information.

Here is an example template of the `.env` file: 

```bash
  POSTGRES_HOST=localhost
  POSTGRES_DB=name
  POSTGRES_USER=johndoe
  POSTGRES_PASSWORD=helloWorld
  POSTGRES_PORT=5432
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

## Architecture

The application was primarily seperated into authentication and Plaid-related services, with the authentication service responsible for managing user credentials such as passwords and issuing tokens, while the Plaid services primarily worked to retrieve user data and store in the PostgreSQL database for further processing.

### Authentication Service

![Authentication](https://github.com/shayan10/stock-sense/assets/13281021/26c77c92-4844-4af8-8814-e81c40c5716f)

Here is a summary of the responsibilities of each component:

- `TokenService`: This is responsible for issuing user access and refresh tokens, refreshing and rotating the user's access and refresh tokens, verifying the validity of user tokens, and delegates to the `TokenBlacklist` to revoke user tokens.
- `TokenBlacklist`: This revokes the user's access and refresh tokens to prevent relay attacks. The blacklist works by storing the user's token in a Redis cache for its remaining validity period, after which it is evicted from the list. This is to ensure that the list does not grow particularly large.
- `RequiredUserProps`: This is an interface which specifies the minimum elements required for each user, such as a username and password
- `AuthRepo`: This component has a singular function, which is to find a user with a given username. It delegates to the `userRepo`, which can be any object that satisfies the `IUserRepo` interface and returns the user object, and this at a minimum satisfies the `RequiredUserProps`
- `AuthController`: This brings all the services together, accepting the plaintext username and password, validating the user's password and issuing tokens, and providing a mechanism to refresh and logout the user from their current session.

I seperated many of these components into **service-level** and **controller-level** classes to be compliant with the principle of **Single Responsibility**. The benefit of this is that each of the components are independent of each other's implementation, as long as the interfaces are met. The **AuthController**, in particular, has a generic type `T` while extending the interface `RequiredUserProps` so that it can be used with different user models and interfaces, effectively decoupling these services from the rest of the application. 

For more details on how the authentication service works, [click here]().

### Plaid Services

![image](https://github.com/shayan10/stock-sense/assets/13281021/be1b1e68-b246-4296-a1f6-c3d760cf600f)


The Plaid Services consist of the following components:
- `PlaidClient`: This is a wrapper class around the `PlaidAPI` object provided by the official Plaid library, returning the object with the assigned `PLAID_CLIENT_ID` and `PLAID_SECRET_KEY`
- `PlaidService`: Responsible for retrieving Plaid credentials such as Link and Access Tokens, as well as retrieving raw user investment data (including accounts, securities, holdings..)
- `PlaidRouter`: This is the front-facing `HTTP` interface for users to interact with, allowing them to make requests including but not limited to:
  	- Request a link token
  	- Exchanging their link tokens for access tokens, allowing StockSense to retrieve their information
- `HoldingAdapter` and `AccountAdapter`: Responsible for transforming the raw account and holding retrieved by Plaid to be consistent with the database schema defined [here](#db-schema)
- `AccountRepo` and `HoldingRepo`: Responsible for any database-related operations concerning the `Accounts` and `Holdings` tables such as insertion, retrieval, etc. 

## Optimizations

### Reduced the time complexity of inserting user investments into the Database from  ***O(n<sup>3</sup>)*** to ***O(n)*** utilizing HashMaps

### Problem

Every holding in the user's investment account has some security and it belongs to a account. Before inserting the holding into the database, we first need to persist the account and security information in our database. The problem, however, is that the Plaid raw data only makes available the `plaid_security_id` and the `plaid_account_id`,
which offers no way accounts to holdings in the database.

Here is an example of the raw responses from Plaid:

```json
{
  "accounts": [
    {
      "account_id": "5Bvpj4QknlhVWk7GygpwfVKdd133GoCxB814g",
      "name": "Plaid Brokerage"
     },
  ],
  "holdings": [
    {
      "account_id": "JqMLm4rJwpF6gMPJwBqdh9ZjjPvvpDcb7kDK1",
      "cost_basis": 1,
      "quantity": 0.01,
      "security_id": "d6ePmbPxgWCWmMVv66q9iPV94n91vMtov5Are",
    },
  ],
  "securities": [
    {
      "iso_currency_code": "USD",
      "name": "Amazon Inc.",
      "security_id": "d6ePmbPxgWCWmMVv66q9iPV94n91vMtov5Are",
      "ticker_symbol": "AMZN"
    }
  ]
}
```
### Solution

#### Inefficient Way:
Use three for-loops to iterate insert each holding, but this would have a worse-case runtime of ***O(n<sup>3</sup>)***, which is terribly inefficient. 

Here is the pseudocode implementation of this process: 
```
	for every acc in accounts:
		acc_id = db.insert(acc)
		for every sec in security:
			sec_id = db.insert(sec)
			for every h in holding:
				db.insert(h, account=acc_id, security=sec_id)
```

This process can be significantly optimized to **O(n)** by taking advantage of the fact that the `account_id` and `security_id` values are unique, and two accounts or securities cannot share the same id. To do this, I created two maps, an `accountMap` and a `securityMap`. Here is a breakdown of this process:

1) Create the `securityMap`, where the unique `security_id` serves as the key, and the `ticker_symbol` serves as the value:

*NOTE*: The security is not stored in it's own database table, and since the ticker symbols for equities are generally unique, we only need to keep track of the ticker for every user holding.

```
	securityMap = {}
	for every sec in security:
		securityMap[sec.security_id] = sec.ticker_symbol 
```

2) Create the `accountMap`, where the `account_id` is the key and the database ID of the account is the value:

```
	accountMap = {}
	for every acc in account:
		acc_id = db.insert(acc)
		accountMap[acc.account_id] = acc_id
```

3) Combine these two maps to insert the holding into the database:

```
	for every h in holdings:
		db.insert(h, ticker_symbol=securityMap[h.security_id, account=accountMap[h.account_id])
```

Result: significantly reduced response times with a O(n) time approach for new users importing their investments into the app, resulting in a seamless user experience.

### Modified the client-side price retrival flow to allow for O(1) time lookups for each holding.

Example Table Layout:

| Ticker Symbol | Qty. | Cost Basis | Current Price | Today's Change (%) | Today's Change ($) | Profit/Loss (%) | Profit/Loss ($) |
|---------------|------|------------|---------------|--------------------|--------------------|-----------------|-----------------|
| ABC           | 100  | $1200      | $1500         | +5%                | +$300              | +25%            | +$300           |
| XYZ           | 50   | $800       | $750          | -6%                | -$50               | -6.25%          | -$50            |


#### Problem

Each user may have multiple holdings and several investment accounts, with holdings being repeated across accounts. If a user has 255 individual holdings but only 20 stocks, it would be inefficient to make 225 network requests, not to mention the computations for the current and total profit for each stock. 

#### Solution
To minimize network requests and server load to the API, I consolidated the price retrival from Finnhub into one request. Here's how it works.
1) Database gives the list of distinct stocks owned by the user
2) Node.js API makes a request to Finnhub for stock information
3) This data is temporarily cached in Redis in case many users own the same stock (likely with S&P500, GOOGL, APPL etc.)
4) Is returned the user in the following format:
   ```json
   [
	"ticker_symbol": {
		"open": 12.75,
		"current_price": 13.69,
		"previous_close": 12.59,
		"current_percent_change": 0.43,
		"timestamp": "2023-08-27T14:30:00.000Z",
		"low": 13.0,
		"high": 13.4
	}
   ]
   ```

This approach is summarized here:
```
Database => Node.js API => Redis Cache => User

1) Request distinct stock list
                         |
2) Request stock data    |
   => Stock data         |
                         |
3) Cache                 |
   => Cached stock data  |
                         |
4) Response              |
   => JSON formatted data|
```
**Result**: highly-efficient O(1) time price retrieval in all rows of the table, minimizing server load and network requests from the client-side.

![QuoteContextdrawio drawio](https://github.com/shayan10/stock-sense/assets/13281021/c2d6c214-cf19-4f0d-857c-8672914c5276)

### Precomputed the total position size (cost basis x quantity) for each ticker symbol to efficiently compute the % change (current and total)

#### Problem
To monitor investment performance effectively, users need to track their overall profit/loss (P/L) and daily changes. However, the initial approach involved inefficiently iterating through all account rows, resulting in an O(n) runtime for computing P/L. This was problematic as n could exceed the number of owned stocks, leading to noticeable client-side delays.

#### Solution
To optimize P/L calculations, I shifted focus to distinct stocks owned across accounts, typically fewer than individual holdings. I used SQL aggregates to efficiently compute the total shares (position size) and position value (position cost) for each stock. This approach improved performance significantly:

```sql
SELECT ticker_symbol, SUM(quantity) as total_quantity, SUM(quantity*cost_basis) AS position_size FROM holdings WHERE user_id=${user_id} GROUP BY ticker_symbol;
```

TLDR: It selects all the entries in the database for stocks belonging to a user, segments these rows by the ticker symbols, add calculates the total number of shares owned and the total cost of each position.

![image](https://github.com/shayan10/stock-sense/assets/13281021/aece2e94-908b-4507-bb08-01e12083a8d0)

Here is the example output of this query:

```json
[
  {
    "ticker_symbol": "AAPL",
    "position_size": 1000,
    "positon_cost": 15000.0
  },
  {
    "ticker_symbol": "GOOG",
    "position_size": 500,
    "positon_cost": 250000.0
  },
  {
    "ticker_symbol": "MSFT",
    "position_size": 800,
    "positon_cost": 32000.0
  },
  {
    "ticker_symbol": "AMZN",
    "position_size": 600,
    "positon_cost": 180000.0
  }
]

```

This greatly simplifies the computations on the client side because now, instead of iterating over all the rows from every account, we can simply just iterate over the position metrics returned for each stock and take the difference.

**Result**: Greatly reduced render times for client dashboard after moving the bulk of these computations to the server-side.

To take a look at how this was integrated on the client-side, have a look at the [code](https://github.com/shayan10/stock-sense/blob/main/client/src/services/Quotes.ts).

## Challenges
- One of the main challenges was designing the authentication service. Although I had envisioned how this service would come together, segmenting the service into maintainable and loosely-coupled components was a challenge since I had to identify what each component should be responsible for. For example, I struggled for a long time on whether or not to combine the `TokenService` and the `TokenBlacklist` into one component. However, by falling back to the Single Responsibility Principle, I ultimately decided on separating the two since this provided the best flexibility and increased my code's reusability, since I can use this service in future projects even if I switch out the implementations
- As a first-time React user, integrating the authentication flow on the client-side proved to be more complex than initially thought. React has a mechanism for triggering changes and fetching data through it's `useEffect` hook, which takes in a callback function and a dependency array: `useEffect(callback, [])`. This hook is called whenever an element inside the dependency array changes, and on occasion this ended up trigerring an infinite loop. While this was frustrating to debug, this gave me the learning experience necessary on how to avoid some of the common pitfalls in React, which will undoubtely prove useful in later projects.

## Limitations

- While both Plaid and Finnhub return cryptocurrency data, I have found the data returned from Plaid around cryptocurrencies to be inconsistent, since it may either be marked as a `cryptocurrency`, `currency`, or `other`, with the `ticker_symbol` returned having varying formats, making it difficult to parse. Although this was not a feature I could include due to time constraints, it is certainly one I want to include to enhance the utility of the app.
- With the Finnhub Free Tier, it only returned real-time data for equities listed on the NASDAQ and NYSE, and since the real-time visualizations were a key part of the app, I opted to only accept equities for the moment. The integration of the paid-tier from Finnhub, however, would let me visualize additional securities such as mutual funds, ETFs, bonds etc., as well as crytocurrencies.

## Future Improvements

- I would like the ability to have asynchronous updates to a user's portfolio. Plaid does offer this capability and is something I would like to implement in the future. My current working solution is to have a webhook that is triggered whenever there is an update, and this information is then given to a message queue such as **RabbitMQ** to asynchronously update the database.
- Although mentioned in the limitations, I would like to implement the functionality neccessary to allow users to add cryptocurrencies to their portfolio. Due to time constraints I was not able to implement this feature, but this is one I definitely want to implement.
  
## Contact

If you have any questions or feedback, feel free to contact me at [shayankhan28@gmail.com](shayankhan28@gmail.com).

