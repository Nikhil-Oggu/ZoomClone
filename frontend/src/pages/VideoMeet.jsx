import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import {
  IconButton,
  TextField,
  Button,
  Badge
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "../styles/videoComponent.module.css";
import server from "../environment";

const server_url = server;
const connections = {};

const peerConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export default function VideoMeetComponent() {
  const socketRef = useRef(null);
  const socketIdRef = useRef(null);
  const localVideoref = useRef(null);

  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [videos, setVideos] = useState([]);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  // ✅ GET MEDIA ONCE (FIXED)
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        window.localStream = stream;

        if (localVideoref.current) {
          localVideoref.current.srcObject = stream;
          localVideoref.current.muted = true;
          localVideoref.current.playsInline = true;
        }
      })
      .catch(err => console.error("Media error:", err));
  }, []);

  // ✅ ENSURE VIDEO PLAYS WHEN JOINING MEETING
  useEffect(() => {
    if (!askForUsername && localVideoref.current && window.localStream) {
      localVideoref.current.srcObject = window.localStream;
      localVideoref.current.play().catch(err => console.warn("Play error:", err));
    }
  }, [askForUsername]);

  // ✅ JOIN
  const connect = () => {
    if (!username.trim()) return;
    setAskForUsername(false);
    connectToSocketServer();
  };

  const connectToSocketServer = () => {
    if (socketRef.current) return;

    socketRef.current = io(server_url);

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit("join-call", window.location.href);

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", id => {
        setVideos(v => v.filter(video => video.socketId !== id));
        delete connections[id];
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach(socketId => {
          if (connections[socketId]) return;

          connections[socketId] = new RTCPeerConnection(peerConfig);

          connections[socketId].onicecandidate = e => {
            if (e.candidate) {
              socketRef.current.emit(
                "signal",
                socketId,
                JSON.stringify({ ice: e.candidate })
              );
            }
          };

          connections[socketId].ontrack = event => {
            setVideos(prev => {
              if (prev.find(v => v.socketId === socketId)) return prev;
              return [...prev, { socketId, stream: event.streams[0] }];
            });
          };

          window.localStream.getTracks().forEach(track =>
            connections[socketId].addTrack(track, window.localStream)
          );
        });

        if (id === socketIdRef.current) {
          Object.keys(connections).forEach(id2 => {
            connections[id2]
              .createOffer()
              .then(desc => connections[id2].setLocalDescription(desc))
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({ sdp: connections[id2].localDescription })
                );
              });
          });
        }
      });
    });
  };

  const gotMessageFromServer = async (fromId, message) => {
    const signal = JSON.parse(message);
    const pc = connections[fromId];
    if (!pc) return;

    try {
      if (signal.sdp) {
        const desc = new RTCSessionDescription(signal.sdp);

        if (
          (desc.type === "answer" && pc.signalingState !== "have-local-offer") ||
          (desc.type === "offer" && pc.signalingState !== "stable")
        ) return;

        await pc.setRemoteDescription(desc);

        if (desc.type === "offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socketRef.current.emit(
            "signal",
            fromId,
            JSON.stringify({ sdp: pc.localDescription })
          );
        }
      }

      if (signal.ice) {
        await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
      }
    } catch (err) {
      console.error("SDP error:", err);
    }
  };

  // ✅ CONTROLS
  const handleAudio = () => {
    const track = window.localStream.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setAudio(track.enabled);
  };

  const handleVideo = () => {
    const track = window.localStream.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setVideo(track.enabled);
  };

  const handleScreen = async () => {
    if (screen) {
      // Stop screen sharing
      const camTrack = window.localStream.getVideoTracks()[0];
      Object.values(connections).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        if (sender) sender.replaceTrack(camTrack);
      });
      setScreen(false);
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      Object.values(connections).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });

      screenTrack.onended = () => {
        const camTrack = window.localStream.getVideoTracks()[0];
        Object.values(connections).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === "video");
          if (sender) sender.replaceTrack(camTrack);
        });
        setScreen(false);
      };

      setScreen(true);
    } catch (err) {
      console.log("Screen share error:", err);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages(prev => [...prev, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages(n => n + 1);
    }
  };

  const handleEndCall = () => {
    window.localStream.getTracks().forEach(t => t.stop());
    window.location.href = "/";
  };

  return (
    <div>
      {askForUsername ? (
        <div className={styles.lobbyContainer}>
          <div className={styles.videoPreview}>
            <video
              ref={localVideoref}
              autoPlay
              muted
              playsInline
            />
          </div>

          <div className={styles.lobbyForm}>
            <h2>Enter Lobby</h2>
            <TextField 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              onKeyPress={e => e.key === "Enter" && connect()}
              placeholder="Enter your name"
              fullWidth
              variant="outlined"
            />
            <Button onClick={connect} variant="contained" fullWidth sx={{ marginTop: 2 }}>
              Join Meeting
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          <video
            className={styles.meetUserVideo}
            ref={localVideoref}
            autoPlay
            muted
            playsInline
          />

          {videos.length === 0 ? (
            <div className={styles.waitingContainer}>
              <h2>Waiting for others to join...</h2>
              
            </div>
          ) : (
            <div className={styles.conferenceView}>
              {videos.map(v => (
                <video
                  key={v.socketId}
                  ref={ref => ref && (ref.srcObject = v.stream)}
                  autoPlay
                  playsInline
                />
              ))}
            </div>
          )}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} sx={{ color: "white" }}>
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton onClick={handleEndCall} sx={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio} sx={{ color: "white" }}>
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            <IconButton onClick={handleScreen} sx={{ color: "white" }}>
              {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
            </IconButton>

            <Badge badgeContent={newMessages} color="secondary">
              <IconButton sx={{ color: "white" }} onClick={() => setShowModal(!showModal)}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          {showModal && (
            <div className={styles.chatRoom}>
                <h1>Chat</h1>
              <div className={styles.chatContainer}>
                <div className={styles.chattingDisplay}>
                  {messages.map((msg, idx) => (
                    <div key={idx}>
                      <strong>{msg.sender}:</strong> {msg.data}
                    </div>
                  ))}
                </div>
                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyPress={e => e.key === "Enter" && sendMessage()}
                    placeholder="Type message..."
                    fullWidth
                    size="small"
                  />
                  <Button onClick={sendMessage} variant="contained">Send</Button>
                </div>
              </div>
            </div>
          )}
    </div>
      )}
    </div>
  );
}
