import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { socket } from '../socket';

// Replace this with your actual server URL

const VideoCall = () => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [chat, setChat] = useState('');
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerInstance = useRef(null);
    // const username = process.env.REACT_APP_METERED_USERNAME;
    // const credential = process.env.REACT_APP_METERED_PASSWORD;
    const [isRowView, setIsRowView] = useState(false);

    const toggleView = () => {
        setIsRowView(!isRowView);
    };

    useEffect(() => {
        socket.connect();
        const initializePeer = (stream) => {
            const peer = new Peer({
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' },
                        // {
                        //     urls: "stun:stun.relay.metered.ca:80",
                        // },
                        // {
                        //     urls: "turn:global.relay.metered.ca:80",
                        //     username,
                        //     credential,
                        // },
                        // {
                        //     urls: "turn:global.relay.metered.ca:80?transport=tcp",
                        //     username,
                        //     credential,
                        // },
                        // {
                        //     urls: "turn:global.relay.metered.ca:443",
                        //     username,
                        //     credential,
                        // },
                        // {
                        //     urls: "turns:global.relay.metered.ca:443?transport=tcp",
                        //     username,
                        //     credential,
                        // },
                    ]
                }
            });

            peer.on('open', (id) => {
                console.log('My peer ID is: ' + id);
                socket.emit('join-room', id);

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

            socket.on('user-connected', (userId, msg) => {
                console.log('User connected:', userId);
                console.log(msg)
                const call = peer.call(userId, stream);
                call.on('stream', (remoteStream) => {
                    setRemoteStream(remoteStream);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                    }
                });
            });
            socket.on('user-disconnected', (userId) => {
                console.log('User disconnected:', userId);
                console.log('Remote stream:', remoteStream);
                if (remoteVideoRef.current) {
                    setRemoteStream(null);
                    remoteVideoRef.current.srcObject = null;
                }
                peerInstance.current = null;
            });
            peerInstance.current = peer;
        };

        const getAccessToMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                setLocalStream(stream);
                // const remoteStream = new MediaStream();
                // setRemoteStream(remoteStream);
                // if (remoteVideoRef.current) {
                //     remoteVideoRef.current.srcObject = remoteStream;
                // }
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
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                console.log('Escape key pressed');
                if (remoteVideoRef.current) {
                    setRemoteStream(null);
                    remoteVideoRef.current.srcObject = null;
                }
                // console.log('Peer instance:', peerInstance.current?.id);
                socket.emit('change-user', peerInstance.current?.id);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
    return (
        <div >
            <div className={`w-full h-96 flex justify-center bg-gray-200 ${isRowView ? '' : ''}`}>
                <video ref={localVideoRef} autoPlay playsInline muted className='shadow-md'></video>
            </div>
            {remoteStream ? (
                <div className={`w-full flex justify-center ${isRowView ? 'gap-4 mt-5' : 'h-40 mt-5'}`}>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                    ></video>
                </div>
            ) : <img src="/200w.gif" alt="GIF" />}
            <button onClick={toggleView} className='absolute top-0 right-0 m-4 p-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors'>
                {isRowView ? 'Normal View' : 'Row View'}
            </button>
        </div>

    );
};

export default VideoCall;
