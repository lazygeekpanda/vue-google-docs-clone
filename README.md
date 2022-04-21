# Google Docs clone with collaboration plugin

***This is a proof of concept work***

Build google docs clone with collaboration between multiple users on top of TinyMCE editor. No premium plugin used. Collaboration plugin is custom. Client application is communicating with backend through WebSockets only.


## Install
Run
```
npm install
```
inside root, client & server folders.

---

## 1. Run concurrently

Easiest way to launch the app, run command at root folder
```
npm run start
```
This will launch both the client and server applications.

By default use http://localhost:3500

## 2. Run separately
Run server application (from root folder)
```
cd server && npm run dev
```

Run client application (from root folder)
```
cd client && npm run serve
```

