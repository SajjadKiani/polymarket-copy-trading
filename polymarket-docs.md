# Polymarket Platform Overview for Large Language Models (LLMs)

This document provides a comprehensive, structured overview of the Polymarket platform, its core components, and its technical interfaces, specifically tailored for Large Language Models (LLMs) to facilitate accurate information retrieval, summarization, and integration.

Polymarket is a decentralized information markets platform built on the Polygon network, allowing users to trade on the outcomes of real-world events.

## 1. Core Concepts and Architecture

### 1.1. Decentralized Information Markets
Polymarket operates as a prediction market where users buy and sell shares representing the potential outcomes of future events.

*   **Markets:** Created for specific, verifiable events (e.g., "Will X happen by Y date?").
*   **Outcomes:** Typically binary ("Yes" or "No"), tokenized as distinct ERC-1155 tokens.
*   **Collateral:** All trading is collateralized by **USDC.e (Bridged USDC)** on the Polygon network.
*   **Pricing:** Market prices reflect the crowd's perceived probability of an outcome occurring.

### 1.2. Conditional Token Framework (CTF)
Polymarket utilizes **Gnosis' Conditional Token Framework (CTF)** to tokenize market outcomes.

*   **Tokenization:** Outcome shares are distinct **ERC-1155** tokens.
*   **PositionIds:** The outcome tokens are technically referred to as "positionIds" in the CTF, derived from a collateral token (USDC.e) and a `collectionId`.
*   **Splitting:** One unit of USDC.e collateral can be "split" into a full set of outcome tokens (e.g., 1 YES share and 1 NO share).
*   **Merging:** A full set of outcome tokens can be "merged" back into one unit of USDC.e collateral.
*   **Redeeming:** After a market is resolved, users with shares in the winning outcome can redeem them for the underlying USDC.e collateral.

### 1.3. Market Resolution (UMA Optimistic Oracle)
Market outcomes are resolved permissionlessly using **UMA's Optimistic Oracle (OO)**.

*   **Process:** The OO acts as a generalized escalation game. A price (outcome) is proposed. If undisputed within a liveness period, it is finalized. If disputed, it is escalated to the **Data Verification Mechanism (DVM)** for a token-holder vote.
*   **Adapter:** Polymarket uses a custom smart contract, `UmaCtfAdapter`, to interface between the CTF and the UMA OO.
*   **Clarifications:** The `UmaCtfAdapter` supports a bulletin board feature for market creators to issue "clarifications" to the question's ancillary data.

### 1.4. Proxy Wallets
Polymarket employs a smart contract wallet system to enhance user experience.

*   **Mechanism:** When a user first trades, a **1-of-1 multisig** is deployed on Polygon, controlled by the user's EOA (MetaMask or MagicLink).
*   **Function:** This "proxy wallet" holds all the user's positions and USDC.e.
*   **Benefits:** Enables improved UX through atomic multi-step transactions and gasless transactions via relayers on the Gas Station Network.

### 1.5. Negative Risk Markets
Certain "winner-take-all" events can be deployed as "negative risk" markets to increase capital efficiency.

*   **Mechanism:** A NO share in any market within the event can be converted into 1 YES share in all other markets.
*   **Augmented Negative Risk:** A system where named outcomes, a collection of unnamed outcomes, and an "other" outcome are deployed. Unnamed outcomes can be clarified later via the bulletin board. Trading should only occur on named outcomes.

## 2. Technical Interfaces (APIs)

Polymarket provides several APIs for programmatic interaction and data access.

### 2.1. Central Limit Order Book (CLOB) API
The CLOB API is the primary interface for trading and market making.

*   **Base URL:** `https://clob.polymarket.com`
*   **Functionality:** Placing, canceling, and viewing orders.
*   **Authentication:** Requires an API key (Builder Key) and a signed payload for authenticated requests (e.g., placing orders).
*   **Key Endpoints:**
    *   `POST /orders`: Place a single or batch of orders.
    *   `GET /orders`: Get active orders for a market or user.
    *   `DELETE /orders`: Cancel orders.
    *   `GET /trades`: Get recent trades.
    *   `GET /status`: Check the health and status of the CLOB.

### 2.2. Gamma API (Market Data)
The Gamma API provides comprehensive market and event metadata.

*   **Base URL:** `https://gamma.polymarket.com`
*   **Functionality:** Fetching market details, event information, and user profiles.
*   **Key Endpoints:**
    *   `/markets`: Get a list of markets, filterable by various parameters.
    *   `/events`: Get event metadata.
    *   `/sports`: Get sports metadata.
    *   `/tags`: Get tag metadata.
    *   `/comments`: Get comments by ID or user address.
    *   `/search`: Search markets, events, and profiles.

### 2.3. Data API (User and Historical Data)
The Data API provides historical trading data and user-specific information.

*   **Base URL:** `https://data-api.polymarket.com`
*   **Functionality:** Accessing user positions, trade history, and market statistics.
*   **Key Endpoints (Core):**
    *   `/positions`: Get current open positions for a user.
    *   `/trades`: Get trades for a user or markets.
    *   `/activity`: Get user activity (trades, splits, merges, redemptions).
    *   `/holders`: Get top holders for markets.
    *   `/closed-positions`: Get closed positions for a user.
*   **Key Endpoints (Misc):**
    *   `/traded`: Get total markets a user has traded.
    *   `/oi`: Get open interest.
    *   `/live-volume`: Get live volume for an event.
*   **Key Endpoints (Builders):**
    *   `/v1/builders/leaderboard`: Get aggregated builder leaderboard.
    *   `/v1/builders/volume`: Get daily builder volume time-series.

### 2.4. Bridge API (Deposits)
The Bridge API facilitates multi-chain deposits to the Polymarket platform.

*   **Base URL:** `https://bridge.polymarket.com`
*   **Functionality:** Bridging assets from various supported chains (Ethereum, Solana, Arbitrum, Base, etc.) and automatically swapping them to USDC.e on Polygon.
*   **Key Endpoints:**
    *   `POST /deposit`: Create unique deposit addresses for bridging assets.
    *   `GET /supported-assets`: Get all supported chains and tokens for deposits.

### 2.5. Websocket (WSS)
Provides real-time data streams for market and user updates.

*   **Functionality:** Subscribing to real-time updates for market changes and user-specific events.
*   **Channels:**
    *   **Market Channel:** Real-time updates for a specific market (e.g., order book changes, trades).
    *   **User Channel:** Real-time updates for a specific user (e.g., new orders, fills, cancellations).
*   **RTDS (Real Time Data Stream):** A separate websocket for real-time data like crypto prices and comments.

### 2.6. Subgraph (GraphQL)
Polymarket provides open-source subgraphs for querying aggregated on-chain data.

*   **Functionality:** Provides a GraphQL interface for indexing and querying useful aggregate calculations and event indexing (volume, user positions, market data, etc.).
*   **Hosted Versions:** Available on Goldsky for Orders, Positions, Activity, Open Interest, and PNL.

## 3. Polymarket Builders Program

The Builders Program is designed to incentivize market makers and developers to contribute liquidity and build on top of Polymarket.

*   **Incentives:** Liquidity providers (makers) are automatically eligible for an incentive program based on posting resting limit orders.
*   **Scoring:** Rewards are calculated based on a formula that rewards participation, two-sided depth, and tight spreads relative to the mid-market price.
*   **Builder Keys:** Developers can obtain Builder Keys for authenticated access to the CLOB API.
*   **Order Attribution:** Orders placed via the CLOB API can be attributed to a specific builder, allowing them to participate in the rewards program and leaderboards.
*   **Builder Signing Server:** A component for builders to securely sign order payloads for the CLOB.
*   **Relayer Client:** A component for interacting with the CLOB as a relayer.

## 4. Key Technical Details

| Feature | Detail |
| :--- | :--- |
| **Blockchain** | Polygon Mainnet |
| **Collateral** | USDC.e (Bridged USDC) |
| **Outcome Tokens** | ERC-1155 (Conditional Tokens) |
| **Resolution Oracle** | UMA Optimistic Oracle (OO) |
| **Trading Interface** | Central Limit Order Book (CLOB) API |
| **User Wallet** | 1-of-1 Multisig Proxy Wallet (Gnosis Safe Factory) |
| **Data Access** | Gamma API (Metadata), Data API (Historical/User), Subgraph (GraphQL) |
| **Real-Time Data** | Websocket (WSS) |
| **Deposit Bridge** | Bridge API (Multi-chain to USDC.e on Polygon) |

***

This README serves as a foundational knowledge base for understanding the technical and architectural components of the Polymarket platform. For implementation details, refer to the specific API documentation sections.
