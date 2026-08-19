# SkillForge Java Spring Boot Backend

Backend for the SkillForge one-page course-selling frontend.

## Features

- Java 17
- Spring Boot
- Razorpay order creation
- Razorpay payment signature verification
- CORS for Vite frontend (`localhost:5173`)
- No login/cart/database required for the current one-page flow
- Ready to connect to a database later for purchase/course access records

## API

### Health
GET `http://localhost:9090/api/health`

### Create Razorpay Order
POST `http://localhost:9090/api/payment/create`

Example:
```json
{
  "totalAmount": 299,
  "cartItems": [
    {
      "id": "java-dsa",
      "title": "Java + DSA Mastery",
      "price": 299,
      "qty": 1
    }
  ]
}
```

### Verify Payment
POST `http://localhost:9090/api/payment/verify`

Example:
```json
{
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_order_id": "order_xxxxx",
  "razorpay_signature": "signature_xxxxx",
  "courseId": "java-dsa"
}
```

## Setup

### 1. Requirements
- JDK 17+
- Maven 3.9+ (or use `mvnw` if you add Maven Wrapper)
- Razorpay account with API keys

### 2. Add Razorpay Test Keys

PowerShell:
```powershell
$env:RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxx"
$env:RAZORPAY_KEY_SECRET="your_test_secret"
```

Do NOT put the secret key in the React frontend.

### 3. Start backend

```powershell
mvn spring-boot:run
```

Backend:
`http://localhost:9090`

### 4. Start frontend

In the frontend project:
```powershell
npm install
npm run dev
```

Frontend:
`http://localhost:5173`

The frontend is already configured to call:
`http://localhost:9090/api/payment/create`
and
`http://localhost:9090/api/payment/verify`

If you change the backend port, update the frontend `.env`:
```env
VITE_API_URL=http://localhost:9090
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

## Important for live payments

Use Razorpay Test Mode first. After your Razorpay account is ready for live payments, replace the test key ID/secret with live API credentials on the server and use the live key ID in the frontend.

Never expose `RAZORPAY_KEY_SECRET` in React, Vite, GitHub, browser code, or `.env` files that are shipped to the frontend.

For real course delivery, add a database and create a purchase/access record only after successful server-side signature verification.
\n\n## Course access after payment\n\nAfter Razorpay signature verification, the backend validates that the requested course matches the course stored in the Razorpay order notes and returns the corresponding Google Drive folder URL. The frontend then shows an **Open Course** button.\n\nThe current course links are configured in `RazorpayService.java`.\n\n**Google Drive warning:** if a folder is set to `Anyone with the link`, anyone who obtains the URL can open it; the payment gateway cannot make a public Google Drive URL private. Google confirms that “Anyone with the link” allows anyone with the link to use the file/folder. urlGoogle Drive sharing helphttps://support.google.com/drive/answer/2494822?hl=en-IN\n\nFor stronger paid-course protection, use a private video/course platform or implement authenticated, expiring access.\n