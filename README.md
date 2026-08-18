# SkillForge Course Selling — One Page

A simple professional one-page course-selling frontend for:

- Java + DSA
- MERN Stack Web Development
- AI & Machine Learning

## Features

- One page only
- No login / registration
- No cart
- Demo button for every course
- Direct Buy Now button
- Razorpay Checkout integration
- Server-side payment create + verify API integration
- Responsive professional design

## Setup

```bash
npm install
npm run dev
```

Create `.env`:

```env
VITE_API_URL=http://localhost:9090
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

Never put the Razorpay secret key in the frontend. Keep the secret key on the backend only.

## Backend API expected

`POST /api/payment/create`

Request contains `totalAmount` and the selected course in `cartItems`.

`POST /api/payment/verify`

Receives Razorpay payment details for server-side signature verification.

## Demo links

Replace the three demo URLs in `src/App.jsx` with your actual course preview/video links.
