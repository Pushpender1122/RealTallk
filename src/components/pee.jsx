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

    useEffect(() => {

        const initializePeer = (stream) => {
            const peer = new Peer({
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' },
                        {
                            urls: 'turn:numb.viagenie.ca',
                            credential: 'muazkh',
                            username: 'webrtc@live.com'
                        },
                        {
                            urls: 'turn:192.158.29.39:3478?transport=udp',
                            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                            username: '28224511:1379330808'
                        },
                        {
                            urls: 'turn:192.158.29.39:3478?transport=tcp',
                            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                            username: '28224511:1379330808'
                        },
                        {
                            urls: 'turn:turn.bistri.com:80',
                            credential: 'homeo',
                            username: 'homeo'
                        },
                        {
                            urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
                            credential: 'webrtc',
                            username: 'webrtc'
                        }
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
