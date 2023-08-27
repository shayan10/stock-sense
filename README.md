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
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Screenshots](#screenshots)
- [UML Diagrams](#uml-diagrams)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)

## Installation

**Prerequisite**: Please make sure to have a Plaid API Key ready. You can get your free API Key [here](https://dashboard.plaid.com/signup)

Step-by-step instructions on how to set up and install the project locally.

## Usage

Instructions on how to use your project. Include any command-line instructions, endpoints for APIs, or user interactions for a UI.

## Features

Highlight the key features of your project. You can use bullet points or descriptions.

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
