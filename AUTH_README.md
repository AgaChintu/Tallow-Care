# Tallow Care — Authentication System

Complete production-ready auth system integrated into the Tallow Care frontend.

---

## Project Structure

```
Tallow-Care/
├── Frontend/               ← React + Vite (existing + auth)
│   ├── src/
│   │   ├── api/
│   │   │   └── authAPI.js          ← Axios instance + all auth API calls
│   │   ├── context/
│   │   │   └── AuthContext.jsx     ← Global auth state (Context API)
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Signup.jsx      ← Multi-step signup + OTP
│   │   │   │   └── Login.jsx       ← Login + Google
│   │   │   └── ...existing pages
│   │   ├── components/
│   │   │   └── Navbar.jsx          ← Updated with auth state
│   │   ├── App.jsx                 ← Updated with routes
│   │   └── main.jsx                ← Updated with providers
│   └── .env                        ← Frontend env vars
│
└── Backend/                ← Node.js + Express
    ├── config/
    │   └── db.js                   ← MongoDB connection
    ├── controllers/
    │   └── authController.js       ← All auth logic
    ├── middleware/
    │   └── authMiddleware.js       ← JWT protection
    ├── models/
    │   ├── User.js                 ← User schema
    │   └── Otp.js                  ← OTP schema (auto-TTL)
    ├── routes/
    │   └── authRoutes.js           ← All auth routes
    ├── utils/
    │   ├── generateOTP.js          ← Crypto secure OTP
    │   ├── generateToken.js        ← JWT signing
    │   └── sendMail.js             ← Nodemailer + Gmail
    ├── .env                        ← Backend secrets
    └── server.js                   ← Express entry point
```

---

## Setup Instructions

### 1. MongoDB

Create a free cluster at [mongodb.com](https://cloud.mongodb.com).
Copy your connection URI.

### 2. Gmail App Password

1. Go to your Google Account → Security
2. Enable 2-Step Verification
3. Go to **App Passwords** → create one for "Mail"
4. Copy the 16-character password

### 3. Google OAuth Client ID

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable **Google+ API** / **Google Identity**
3. Credentials → Create OAuth 2.0 Client ID → Web application
4. Add Authorized JavaScript origins:
   - `http://localhost:5173`
5. Copy the Client ID

---

### 4. Backend `.env`

Edit `Backend/.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tallow-care
JWT_SECRET=your_random_long_secret_here
JWT_EXPIRES_IN=7d
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 5. Frontend `.env`

Edit `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

---

## Running the App

### Backend
```bash
cd Backend
npm install
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/check-username` | None | Live username availability check |
| POST | `/auth/send-email-otp` | None | Send 6-digit OTP to email |
| POST | `/auth/verify-email-otp` | None | Verify OTP |
| POST | `/auth/signup` | None | Create account (after OTP verified) |
| POST | `/auth/login` | None | Login with username/email + password |
| POST | `/auth/google` | None | Google OAuth login/signup |
| GET | `/auth/profile` | JWT | Get current user profile |

---

## Auth Features

- ✅ Multi-step signup (info → verify → OTP)
- ✅ Real email OTP via Gmail (5-min expiry, auto-deleted from MongoDB)
- ✅ Live username availability (debounced, real-time)
- ✅ Password strength meter
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Google Sign-In / Sign-Up
- ✅ Auto-generated usernames for Google users
- ✅ JWT authentication (7-day tokens)
- ✅ Protected routes via middleware
- ✅ Persistent sessions (localStorage)
- ✅ Navbar updates with user avatar + dropdown
- ✅ Logout
- ✅ Mobile-first responsive UI
- ✅ Phone verification (UI + backend structure ready)
