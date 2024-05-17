import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
const { socket } = require('../socket');
const Chat = () => {
    const [messages, setMessages] = useState([{ user: 'User', content: 'Welcome to the chat!' }]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const currentUser = queryParams.get('name');
    const [remoteUsername, setRemoteUsername] = useState('');
    useEffect(() => {
        socket.connect();
        socket.on('message', (message) => {
            console.log('message', message);
            setMessages((prevMessages) => [...prevMessages, message]);
        });
        socket.on('user-disconnected', () => {
            setMessages((prevMessages) => [...prevMessages, { user: "U", content: 'User disconnected!' }]);
            console.log('User disconnected');
            // setRemoteUsername('');
        })
        socket.on('user-connected', (msg) => {
            console.log('User connected', msg);
            setMessages((prevMessages) => [...prevMessages, { user: "U", content: 'New User connected!' }]);
        });
        return () => {
            socket.disconnect();
        };

    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            console.log('input');
            setMessages((prevMessages) => [...prevMessages, { user: currentUser, content: input }]);
            socket.emit('chatMessage', input, currentUser);
            setInput('');
        }
    };

    const isCurrentUser = (user) => {
        return currentUser == user;
    }
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                console.log('Escape key pressed');
                socket.emit('change-user', socket.id);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
    return (
        <div className="fixed right-0 top-0 h-full p-1 flex flex-col bg-white shadow-lg rounded-lg chat-container max-w-full" style={{ width: '500px' }}>
            <div className="flex-1 overflow-y-auto mb-4">
                {messages.map((message, index) => (
                    <>
                        {isCurrentUser(message.user) ?
                            (<div key={index} className={`p-2 rounded mb-1 flex items-center justify-end`}>
                                <div className="ml-2 " style={{ maxWidth: '250px', wordBreak: 'break-all' }}>
                                    {message.content}
                                </div>
                                <div
                                    className={`w-10 h-10 ml-2 rounded-full bg-green-500 flex items-center justify-center text-white`}>
                                    {message.user[0]?.toUpperCase()}
                                </div>
                            </div>) :
                            (<div key={index} className={`p-2 rounded mb-1 flex items-center justify-start`}  >
                                <div className={`w-10 h-10 rounded-full bg-${isCurrentUser(message.user) ? 'green' : 'blue'}-500 flex items-center justify-center text-white`} >
                                    {message.user[0]?.toUpperCase()}
                                </div>
                                <div className="text-left ml-2" style={{ maxWidth: '250px', wordBreak: 'break-all' }}>
                                    {message.content}
                                </div>
                            </div>)
                        }

                    </>

                ))}

                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-200"
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r-lg">Send</button>
            </form>
        </div >
    );
};

export default Chat;
