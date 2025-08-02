# Digital Wallet System

A secure, modular, and role-based backend API for a digital wallet system with JWT authentication.

## Deploy Link

https://digital-wallet-system-backend-side.vercel.app

## Features

- User registration
- JWT authentication with refresh tokens
- Role-based access control (User, Agent, Admin)
- Wallet management
- Financial transactions (send-money, deposit, withdraw, cash-in, cash-out)
- Transaction history
- Admin dashboard for user/wallet management
- Agent approval/suspend system
- Wallet block/unblock system
- Password management

## Technologies

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Cookies
- JWT
- Bcrypt

## API Endpoints

### Auth
- `POST /api/v1/auth/login` - Login with credentials
- `POST /api/v1/auth/refresh-token` - Get new access token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/change-password` - Change password (authenticated)
- `POST /api/v1/auth/forgot-password` - Forget password 
- `POST /api/v1/auth/reset-password` - Reset password

### User
- `POST /api/v1/user/register` - Register new user
- `GET /api/v1/user/all-category-user` - Get all category user(admin only)
- `GET /api/v1/user/all-users` - Get all users (admin only)
- `GET /api/v1/user/all-agents` - Get all agents (admin only)
- `GET /api/v1/user/my-profile` - Get my profile
- `GET /api/v1/user/:id` - Get single user (admin only)
- `PATCH /api/v1/user/:id` - Update user (user/agent can update their --> name, email, phone, password, nidNumber and admin can update user/agent -> isActive, isDeleted, isApproved(Approve/suspend), commissionRate)

### Wallet
- `GET /api/v1/wallet/my-wallet` - Get user wallet
- `POST /api/v1/wallet/deposit` - Deposit money (user only)
- `POST /api/v1/wallet/withdraw` - Withdraw money (user only)
- `POST /api/v1/wallet/send-money` - Transfer money to another user (user only)
- `POST /api/v1/wallet/cash-in` - Cash-in to user wallet (agent only)
- `POST /api/v1/wallet/cash-out` - Cash-out from user wallet (agent only)
- `GET /api/v1/wallet/all-wallets` - Get all wallets (admin only)
- `PATCH /api/v1/wallet/update-status/:id` - Wallet status updated --> block/unblock (admin only)
- `GET /api/v1/wallet/:id` - Get single wallet

### Transaction
- `GET /api/v1/transaction/my-transactions` - Get my transactions history (user, agent only)
- `GET /api/v1/transaction/all-transactions` - Get all transactions history (admin only)
- `GET /api/v1/transaction/commissions` - Get my agent commissions history (admin only)
- `GET /api/v1/transactions/:id` - Get single transaction

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file based on `.env.example`
4. Start MongoDB and Redis services
5. Run the app: `npm run dev`

## Environment Variables

### port
- `PORT = 5500`

### mongodb
- `MONGODB_URL = mongodb://localhost:27017/digital-wallet`

### node environment
- `NODE_ENV = production`

### jwt
- `JWT_ACCESS_SECRET = your_info`
- `JWT_ACCESS_EXPIRES = 1d`

- `JWT_REFRESH_SECRET = your_info`
- `JWT_REFRESH_EXPIRES = 30d`

### bcrypt
- `BCRYPT_SALT_ROUND = your_info`
  
### admin
- `ADMIN_EMAIL = your_info`
- `ADMIN_PASSWORD = your_info`
- `ADMIN_PHONE = your_info`
- `ADMIN_NID_NUMBER = your_info`

### frontend
- `FRONTEND_URL =  http://localhost:5173`

### SMTP gamail setup 
- `SMTP_HOST = your_info`
- `SMTP_PORT = your_info`
- `SMTP_USER = syour_info`
- `SMTP_PASS = your_info`
- `SMTP_FROM = your_info`

### wallet
- `INITIAL_BALANCE = 50`
- `COMMISSION_RATE = 1`
- `TRANSACTION_FEE = 2`

## License

### MIT

This complete implementation provides all the requested functionality with proper separation of concerns, role-based access control, and comprehensive wallet management features. The code is modular, well-structured, and follows best practices for security and error handling.
