import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { socket } from '../socket';

// Replace this with your actual server URL

const VideoCall = () => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const username = process.env.METERED_USERNAME;
    const credential = process.env.METERED_PASSWORD;
    useEffect(() => {

        const initializePeer = (stream) => {
            const peer = new Peer({
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' },
                        {
                            urls: "stun:stun.relay.metered.ca:80",
                        },
                        {
                            urls: "turn:global.relay.metered.ca:80",
                            username,
                            credential,
                        },
                        {
                            urls: "turn:global.relay.metered.ca:80?transport=tcp",
                            username,
                            credential,
                        },
                        {
                            urls: "turn:global.relay.metered.ca:443",
                            username,
                            credential,
                        },
                        {
                            urls: "turns:global.relay.metered.ca:443?transport=tcp",
                            username,
                            credential,
                        },
                    ]
                }
            });

            peer.on('open', (id) => {
                console.log('My peer ID is: ' + id);
                socket.emit('join-room', 'room', id);
            });

            peer.on('call', (call) => {
                console.log('Incoming call:', call);
                call.answer(stream);
                call.on('stream', (remoteStream) => {
                    setRemoteStream(remoteStream);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                    }
                });
            });

            socket.on('user-connected', (userId) => {
                console.log('User connected:', userId);
                const call = peer.call(userId, stream);
                call.on('stream', (remoteStream) => {
                    setRemoteStream(remoteStream);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                    }
                });
            });

            peerInstance.current = peer;
        };

        const getAccessToMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                return stream;
            } catch (err) {
                console.error('Error accessing media devices:', err);
            }
        };

        getAccessToMedia().then((stream) => {
            initializePeer(stream);
        });
        return () => {
            if (peerInstance.current) {
                peerInstance.current.destroy();
            }
            socket.disconnect();
        };
    }, []);
    useEffect(() => {
        if (remoteStream) {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
        }
    }, [remoteStream]);
    return (
        <div>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: 300, height: 300 }}></video>
            {remoteStream && <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 300, height: 300 }}></video>}
        </div>
    );
};

export default VideoCall;
