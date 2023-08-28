# StockSense

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Usage](#usage)
- [UML Diagrams](#uml-diagrams)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)

## Overview

StockSense is an application that allows users to integrate their investment accounts and track their portfolio performance in real-time. Some of the key features include:

- **Plaid Link Integration:** The application uses the Plaid Link API for secure authentication and retrieval of user's financial holdings, including details such as ticker symbols, quantities, and cost basis.

- **Historical and Real-Time Performance Monitoring:** Utilizing Finnhub's REST API and WebSocket services, StockSense provides both historical and real-time price information for tracking portfolio performance.

- **Real-Time Candlestick Visualizations:** Powered by the JP Morgan Perspective Framework, StockSense renders minute-by-minute candlestick charts. These candles are aggregated in real-time during trading hours.

- **Access/Refresh Token Authentication:** The application employs JWTs and a Token Blacklist approach using Redis for robust access and refresh token-based authentication. Learn more about the Authentication Service [here](link_to_authentication_service_documentation).

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

## UML Diagrams

Include UML diagrams to visualize the architecture, relationships between components, or design patterns used.

## Optimizations

- Reduced the time complexity of inserting user transactions into the Database from  ***O(n<sup>3</sup>)*** to ***O(n)*** utilizing HashMaps

Problem: Each investment a user has belongs to an account, has some quantity and cost basis, and is a type of security. With this information located in three separate arrays, the naive implementation of inserting these into the SQL Database was **O(n<sup>3</sup>)**. 

Solution: Each holding also consists of a unique account ID and security ID, this insertion can be simplified to **O(n)** time by utilizing hash maps. 

```json
{
  "accounts": [
    {
      "account_id": "5Bvpj4QknlhVWk7GygpwfVKdd133GoCxB814g",
      "balances": {
        ...
      },
      "name": "Plaid Brokerage",
      "official_name": "Plaid Brokerage",
      "subtype": "brokerage",
      "type": "investment"
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
      ...
      "iso_currency_code": "USD",
      "name": "Amazon Inc.",
      "proxy_security_id": null,
      "security_id": "d6ePmbPxgWCWmMVv66q9iPV94n91vMtov5Are",
      "sedol": null,
      "ticker_symbol": "AMZN",
      "type": "equity"
    }
  ]
}
```
Here is the pseudocode implementation of this idea. To see the TypeScript implementation, click [here]().

```
    method parseAccountData(data: Accounts[]): AccountPayload
        accounts := new array of AccountPayload
        for each account in data
            if account.account_id and account.name
                accounts.push({
                    plaid_account_id: account.account_id,
                    account_name: account.name
                })
            end if
        end for
        return accounts
    end method

    method saveAccounts(user_id: string, data: array of AccountBase): AccountMap
        parsedAccounts := parseAccountData(data)
        result := accountRepo.insert(parseInt(user_id), parsedAccounts)

        map := new AccountMap
        for each obj in result
            map.set(obj.plaid_account_id, obj.id)
        end for

        return map
    end method

    method parseSecurities(securities: Security[]): SecurityMap
        map := new SecurityMap
        for each security in securities
           map.set(security.security_id, security.ticker_symbol) 
        end for
        return map
    end method

    method parseHoldings(data: Holding[], securityMap: SecurityMap, accountMap: AccountMap): HoldingPayload[]
        holdings = []
        for each holding in data
            // Get Account ID using the Map
            account_id := accountMap.get(holding.account_id)
            // Get Ticker Symbol using the Map
            ticker_symbol := securityMap.get(holding.security_id)
            // If properties defined, then add to array
            if account_id and ticker_symbol and holding.quantity and holding.cost_basis
                holdings.push({
                    account_id,
                    plaid_account_id: holding.account_id,
                    ticker_symbol,
                    cost_basis: holding.cost_basis,
                    quantity: holding.quantity
                })
            end if
        end for
        return holdings
    end method


    method saveHoldings(user_id: string, holdings: Holding[], securities: Security[], accountMap: AccountMap)
        securityMap := parseSecurities(securities)
        parsedHoldings := parseHoldings(holdings, securityMap, accountMap)

        if parsedHoldings.length == 0
            return []
        end if
	      // Insert into Database
        result := insert(parseInt(user_id), parsedHoldings)
        return result
    end method
```

- Modified the client-side price retrival flow to allow for O(1) time lookups for each holding.

Example Table Layout:

| Ticker Symbol | Qty. | Cost Basis | Current Price | Today's Change (%) | Today's Change ($) | Profit/Loss (%) | Profit/Loss ($) |
|---------------|------|------------|---------------|--------------------|--------------------|-----------------|-----------------|
| ABC           | 100  | $1200      | $1500         | +5%                | +$300              | +25%            | +$300           |
| XYZ           | 50   | $800       | $750          | -6%                | -$50               | -6.25%          | -$50            |


Problem: Each user may have multiple holdings and several investment accounts, with holdings being repeated across accounts. If a user has 255 individual holdings but only 20 stocks, it would be inefficient to make 225 network requests, not to mention the computations for the current and total profit for each stock. 

Solution: To minimize network requests and server load to the API, I consolidated the price retrival from Finnhub into one request. Here's how it works.
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
This allows for highly-efficient O(1) time retrieval in allow rows of the table, minimizing server load and network requests from the client-side

![QuoteContextdrawio](https://github.com/shayan10/stock-sense/assets/13281021/a80e5ffd-9e13-46b8-94a3-d9cefdfc23ab)

  
- Precomputed the total position size (cost basis x quantity) for each ticker symbol to efficiently compute the % change (current and total)

## Challenges

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
