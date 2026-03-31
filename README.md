# ChatBloc

Secure real-time messaging with privacy + integrity guarantees:

- AES-256 encryption protects message content in transit and at rest.
- SHA-256 hashes create tamper-evident message fingerprints.
- Solidity smart contract stores hashes on-chain for verification.
- Socket.IO streams live message and blockchain status updates.

---

## Screenshots

Add project images in `docs/images/` and update these links.

![Hero Banner](docs/images/hero-banner.png)
![Login Screen](docs/images/login-screen.png)
![Chat Screen](docs/images/chat-screen.png)
![Verification State](docs/images/verification-state.png)

Suggested captures:

- Landing page hero section
- Register/login flow
- Live chat with pending -> confirmed blockchain update
- Verified vs tampered message result UI

---

## Table of Contents

- [Why ChatBloc](#why-chatbloc)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Environment Variables](#environment-variables)
- [Run Locally](#run-locally)
- [API Reference](#api-reference)
- [Socket Events](#socket-events)
- [Smart Contract](#smart-contract)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)

---

## Why ChatBloc

Traditional chat apps can say a message is "secure" but often stop at transport encryption.
ChatBloc adds independent integrity proof:

1. Message body is encrypted with AES-256 before persistence.
2. Plain text message hash is computed with SHA-256.
3. Hash is submitted to blockchain and later compared to recomputed hash.
4. UI exposes verification status: pending, verified, tampered, or failed.

Result: confidentiality plus verifiable message integrity.

---

## Architecture

```mermaid
flowchart LR
		U1[User A Browser] -->|HTTPS + JWT| BE[Express API]
		U2[User B Browser] -->|HTTPS + JWT| BE
		U1 <-->|Socket.IO| BE
		U2 <-->|Socket.IO| BE

		BE -->|Encrypted payloads| DB[(MongoDB)]
		BE -->|storeHash(hash)| SC[(MessageHashStorage.sol)]
		BE -->|JSON-RPC| HH[Hardhat Node / EVM Network]
		HH --> SC
```

---

## Tech Stack

### Frontend

- React 19
- Vite 8
- Tailwind CSS
- Axios
- Socket.IO client

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT auth + bcrypt
- AES-256-CBC + SHA-256 (Node crypto)
- Socket.IO server
- Ethers.js

### Blockchain

- Solidity 0.8.24
- Hardhat
- Ethers.js

---

## Project Structure

```text
.
|-- backend/
|   |-- src/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   `-- config/
|-- blockchain/
|   |-- contracts/
|   |-- scripts/
|   `-- deployments/
`-- frontend/
		`-- src/
				|-- components/
				`-- services/
```

---

## How It Works

### Send Message Flow

1. User authenticates and gets JWT token.
2. Sender submits plain text to `/api/message/send`.
3. Backend encrypts message (AES-256-CBC).
4. Backend computes SHA-256 hash of plain text.
5. Hash is sent to `MessageHashStorage.storeHash(hash)`.
6. Message is saved with `chainStatus: pending` and tx hash.
7. After tx confirmation, backend updates:
	 - `blockchainIndex`
	 - `chainStatus: confirmed`
8. Socket event notifies both users.

### Verify Flow

1. Backend decrypts stored ciphertext.
2. Recomputes SHA-256 hash.
3. Fetches on-chain hash by index.
4. Compares values and returns:
	 - `verified` if equal
	 - `tampered` if different
	 - `pending` / `failed` for in-flight or failed chain writes

---

## Environment Variables

### backend/.env

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=replace_with_long_random_secret
ENCRYPTION_SECRET=replace_with_long_random_secret

FRONTEND_URL=http://localhost:5173

BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_PRIVATE_KEY=0x<32-byte-private-key>

# Optional if not reading blockchain/deployments/local.json
CONTRACT_ADDRESS=0x...
```

### frontend/.env

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### blockchain/.env

Use `blockchain/.env.example` as baseline:

```env
LOCAL_RPC_URL=http://127.0.0.1:8545
DEPLOYER_PRIVATE_KEY=
```

---

## Run Locally

### 1) Install dependencies

```bash
cd blockchain && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

### 2) Start local blockchain

Terminal A:

```bash
cd blockchain
npm run node
```

### 3) Deploy contract

Terminal B:

```bash
cd blockchain
npm run deploy:local
```

This writes deployment info to `blockchain/deployments/local.json`.

### 4) Run backend

Terminal C:

```bash
cd backend
npm run dev
```

### 5) Run frontend

Terminal D:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

---

## API Reference

Base URL: `http://localhost:5000/api`

### Health

- `GET /health`

### Auth

- `POST /auth/register`
	- body: `{ "name": "...", "email": "...", "password": "..." }`
- `POST /auth/login`
	- body: `{ "email": "...", "password": "..." }`
- `GET /auth/users` (Bearer token required)

### Messaging

- `POST /message/send` (Bearer token required)
	- body: `{ "receiverId": "...", "message": "plain text" }`
- `GET /message/:userId` (Bearer token required)
- `POST /message/verify` (Bearer token required)
	- body: `{ "messageId": "..." }`

---

## Socket Events

Client -> Server:

- `join` with `userId`

Server -> Client:

- `new_message`
- `message_chain_update`

Use these events to keep conversations and chain status synced in real time.

---

## Smart Contract

Contract: `blockchain/contracts/MessageHashStorage.sol`

Key functions:

- `storeHash(string hash) returns (uint256 index)`
- `getHash(uint256 index) returns (string)`
- `getHashCount() returns (uint256)`

Event:

- `HashStored(uint256 indexed index, string hash, address indexed sender)`

---

## Troubleshooting

### `BLOCKCHAIN_PRIVATE_KEY is not set`

Set `BLOCKCHAIN_PRIVATE_KEY` in `backend/.env` with a funded local account private key.

### `Contract address not found`

Deploy contract first (`npm run deploy:local`) or set `CONTRACT_ADDRESS` in `backend/.env`.

### `MongoDB connection failed`

Check `MONGO_URI`, IP allowlist, and database credentials.

### `Unauthorized: Missing token`

Login first and send `Authorization: Bearer <token>`.

### Blockchain pending for too long

Ensure Hardhat node is running and backend `BLOCKCHAIN_RPC_URL` is reachable.

---

## Security Notes

- Do not commit `.env` files.
- Rotate `JWT_SECRET` and `ENCRYPTION_SECRET` periodically.
- Use HTTPS in production.
- Restrict CORS origin (`FRONTEND_URL`) to trusted domains.
- Move private key management to a secure signer service or vault for production.

---

## My Future Scope(Though won't be doing it 😊)

- Add group chats and per-room signing keys
- Add message search with encrypted index strategy
- Add wallet-based identity option
- Add automated contract deployment profiles (local/testnet/mainnet)
- Add end-to-end tests for integrity workflow

---

## Acknowledgment

Built as ChatBloc: secure chat with blockchain-backed integrity verification.
