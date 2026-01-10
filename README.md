# QuickCall
A real-time video conferencing web application built using React, Node.js, WebRTC, and Socket.IO.
This project supports live video/audio calls, mute/unmute, camera toggle, and real-time user communication

# Live Application
https://quickcalll.onrender.com/


## Tech Stack
# Frontend
React 18

React Router

WebRTC

Socket.IO Client

Material UI

CSS

# Backend

Node.js

Express.js

Socket.IO

WebRTC Signaling Server

# Deployment
Render (Frontend + Backend)

WebSocket-based real-time communication

# Features
One-to-one and many video calling

Real-time audio & video streaming

Mute / Unmute microphone

Camera ON / OFF

Join & Leave meeting

Live peer-to-peer connection using WebRTC

Real-time signaling using Socket.IO

Responsive UI

# Application Flow
User opens the application

Joins a meeting room

Socket.IO establishes signaling connection

WebRTC creates peer-to-peer connection

Audio & video streams are exchanged

Users can mute/unmute or turn camera on/off

Call ends when user leaves

# Core Modules
Video Stream – Live camera feed

Audio Stream – Real-time voice communication

Controls Panel

Mute / Unmute

Camera ON / OFF

Leave Call

Socket Signaling

Peer Connection Handling

# Installation & Setup
Clone Repository

git clone https://github.com/Nikhil-Oggu/QuickCall.git

cd QuickCall

Backend Setup

cd backend

npm install

npm start

Frontend Setup
cd frontend

npm install

npm start

# Deployment Details
Frontend deployed on Render

Backend deployed on Render

WebRTC used for peer-to-peer media transfer

Socket.IO used for signaling & room management
