import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function GetStart() {
    const [name, setName] = useState('');
    const navigator = useNavigate();

    const handleChatOnly = () => {
        if (name.trim() !== '') {
            navigator(`/chat?name=${encodeURIComponent(name)}`);
        }
    };
    const handleVideo = () => {
        if (name.trim() !== '') {
            navigator(`/both?name=${encodeURIComponent(name)}`);
        }
    }
    return (
        <div className="flex justify-center items-center h-screen">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Enter Your Name:
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="name"
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button onClick={handleChatOnly} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" >
                        Chat
                    </button>
                    <button onClick={handleVideo} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" >
                        Video
                    </button>
                </div>
            </form>
        </div>
    );
}

export default GetStart;
