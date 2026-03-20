<h1 align="center">✨ LinkLoom - Fullstack Chat & Video Calling App ✨</h1>

![Demo App](/frontend/public/screenshot-for-readme.png)

LinkLoom is a comprehensive fullstack application built for real-time communication and language exchange. 

## 🎯 Project Scope & Requirements
This application serves as a robust platform for learners to connect, message, and video chat in real-time. 
* **Real-time Messaging**: Instant text-based communication with typing indicators, read receipts, and reactions via Stream API.
* **Seamless Video Calling**: 1-on-1 and Group Video Calls featuring screen sharing and built-in recording.
* **Authentication Security**: Custom JWT-based Authentication with fully protected React Routes.
* **Dynamic UI Themes**: Features a flexible theming system with 32 unique UI themes via DaisyUI.
* **Language Exchange Matchmaking**: Discover platform users based on complementary native and learning languages.

## 🔄 Application Flow
1. **Sign Up & Authentication**: Users register using their email. A securely hashed password and a JWT session token are generated.
2. **Profile Onboarding**: New users are required to fill out their profile, including a bio, native language, learning language, and location.
3. **Stream API Initialization**: Upon successful registration or login, the backend automatically provisions a specialized Stream Client token, synchronizing the user with the real-time Stream Chat servers.
4. **Matchmaking & Dashboard**: Users explore the "Meet New Learners" dashboard. They can send and accept friend requests to establish connections.
5. **Real-time Communication**: Once a request is accepted, a private chat channel (`/chat/:id`) is established utilizing WebSockets for instant messaging. From the chat interface, users can escalate the conversation to a real-time Video Call (`/call/:id`).

## 🧠 Project Learnings
By building or analyzing this project, developers will gain hands-on experience in:
- **Fullstack Integration**: Seamlessly coupling a `React`/`Vite` frontend with a `Node.js`/`Express` backend via REST APIs.
- **Third-Party SDK Mastery**: Implementing complex WebRTC & WebSocket logic rapidly using the **Stream SDK** for production-grade Chat and Video APIs.
- **State Management**: Managing global application state cleanly without boilerplate using **Zustand**.
- **Data Fetching & Caching**: Efficiently managing and caching server state asynchronously using **TanStack React Query**.
- **Modern Styling framework**: Building accessible and beautiful components rapidly using **TailwindCSS** and DaisyUI.
- **Database & Security**: Modeling relational-like data in **MongoDB/Mongoose** and securing sensitive routes with `jsonwebtoken` middleware.

---

## 🧪 .env Setup

### Backend (`/backend`)
Create a `.env` file in the backend directory. **Note:** The API key variable expects `STEAM` rather than `STREAM`.

```env
PORT=5001
MONGO_URI=your_mongo_uri
STEAM_API_KEY=your_stream_api_key
STEAM_API_SECRET=your_stream_api_secret
JWT_SECRET_KEY=your_jwt_secret
NODE_ENV=development
```

### Frontend (`/frontend`)
Create a `.env` file in the frontend directory:

```env
VITE_STREAM_API_KEY=your_stream_api_key
```

---

## 🔧 Run the Backend

```bash
cd backend
npm install
npm run dev
```

## 💻 Run the Frontend

```bash
cd frontend
npm install
npm run dev
```
