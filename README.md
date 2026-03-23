# FinTrack — Personal Finance & Friend Split Tracker

Track money you spend on behalf of friends, who owes you what, and which account you used for each transaction. Real-time sync across all devices.

---

## 🚀 Setup (5 minutes, 100% free)

### 1. Create a NEW Firebase Project
Go to [console.firebase.google.com](https://console.firebase.google.com) → Add project → name it `fintracker`

> ⚠️ Use a **separate** Firebase project from Equishield — do NOT mix them.

### 2. Add a Web App & Enable Firestore
- Project Settings → Add Web App → copy the config
- Firestore Database → Create database → Start in test mode → `asia-south1`

### 3. Edit `src/firebase.js`
Replace the placeholder values with your actual config keys.

### 4. Run
```bash
npm install
npm start
```

### 5. Register
On the login screen, click **"Register"** → create your account with phone + password.

The app auto-seeds 2 sample friends, 2 accounts, and 6 transactions on first login.

---

## 📱 Features

### Dashboard
- Total money given, received, and pending at a glance
- "Who Owes You" list with balances per friend
- Recent activity feed

### Transactions
- Add **Expense** (money you paid for a friend) or **Payment** (money received back)
- Filter by: Friend · Account · Type · Date range
- Edit or delete any transaction

### Friends
- Add friends with name and phone
- See per-friend: total given, total received, net balance
- Colour-coded avatars

### Accounts
- Add Credit Cards and Bank Accounts
- See total spent per account across all friend transactions

### Insights
- Monthly bar chart — Given vs Received trend
- Per-friend comparison chart
- Account spending pie chart
- Balance summary table

---

## 🔄 Real-Time Sync
Uses Firebase Firestore `onSnapshot()` — changes on one device appear instantly on all others.

---

## 📁 File Structure
```
fintracker/
├── public/index.html       # Google Fonts (Sora + Plus Jakarta Sans)
├── src/
│   ├── firebase.js         # ← Replace config here
│   ├── index.js
│   └── App.jsx             # Entire app
└── package.json
```

---

## 🔒 Firestore Rules (Production)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
