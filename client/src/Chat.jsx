
// -------------=-=-=-=

import { useEffect, useState, useRef, useContext } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import axios from "axios";
import { UserContext } from "./UserContext.jsx";
import uniqBy from 'lodash/uniqBy';
import Contact from "./Contact.jsx";
import ChImage from '/Ch.jpg';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [ws, setWs] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [offlinePeople, setOfflinePeople] = useState({});
    const { username, id, setId, setUsername } = useContext(UserContext);
    const [newMessageText, setNewMessageText] = useState('');
    const divUnderMessages = useRef();

    useEffect(() => {
        connectToWs();
    }, [selectedUserId]);

    function connectToWs() {
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws);

        ws.addEventListener('message', handleMessage);

        ws.addEventListener('error', (error) => {
            console.error("WebSocket error:", error);
            alert("WebSocket error occurred. Trying to reconnect...");
            connectToWs();
        });

        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected. Trying to reconnect.');
                connectToWs();
            }, 1000);
        });
    }

    function showOnlinePeople(peopleArray) {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
    }

    function handleMessage(ev) {
        const messageData = JSON.parse(ev.data);
        console.log({ ev, messageData });
        if ('online' in messageData) {
            showOnlinePeople(messageData.online);
        }
        else if ('text' in messageData) {
            if (messageData.sender === selectedUserId) {
                setMessages(prev => ([...prev, { ...messageData }]));
            }
        }
    }

    function logout() {
        axios.post('/logout').then(() => {
            setWs(null);
            setId(null);
            setUsername(null);
        });
    }

    function sendMessage(ev, file = null) {
        if (ev) ev.preventDefault();
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
            file,
        }));
        if (file) {
            axios.get('/messages/' + selectedUserId).then(res => {
                setMessages(res.data);
            });
        } else {
            setNewMessageText('');
            setMessages(prev => ([...prev, {
                text: newMessageText,
                sender: id,
                recipient: selectedUserId,
                _id: Date.now(),
            }]));
        }
    }

    function sendFile(ev) {
        const file = ev.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            sendMessage(null, {
                name: file.name,
                data: reader.result,
            });
        };
        reader.onerror = (error) => {
            console.error("File reading error:", error);
            alert("Failed to read file. Please try again.");
        };
    }

    useEffect(() => {
        const div = divUnderMessages.current;
        if (div) {
            div.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages]);

    useEffect(() => {
        axios.get('/people').then(res => {
            const offlinePeopleArr = res.data
                .filter(p => p._id !== id)
                .filter(p => !Object.keys(onlinePeople).includes(p._id));
            const offlinePeople = {};
            offlinePeopleArr.forEach(p => {
                offlinePeople[p._id] = p;
            });
            setOfflinePeople(offlinePeople);
        });
    }, [onlinePeople]);

    useEffect(() => {
        if (selectedUserId) {
            axios.get('/messages/' + selectedUserId).then(res => {
                setMessages(res.data);
            });
        }
    }, [selectedUserId]);

    const onlinePeopleExclOurUser = { ...onlinePeople };
    delete onlinePeopleExclOurUser[id];

    const messagesWithoutDupes = uniqBy(messages, '_id');

    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center p-4"
            style={{ backgroundImage: `url(${ChImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} >
            <div className='bg-gray-100 bg-opacity-60 w-full max-w-5xl h-[90vh] flex rounded-lg shadow-lg overflow-hidden'>
                <div className='bg-gray-50 bg-opacity-60 w-1/3 flex flex-col p-4'>
                    <div className="flex-grow overflow-y-auto no-scrollbar">
                        <Logo />
                        {Object.keys(onlinePeopleExclOurUser).map(userId => (
                            <Contact
                                key={userId}
                                id={userId}
                                online={true}
                                username={onlinePeopleExclOurUser[userId]}
                                onClick={() => { setSelectedUserId(userId); console.log({ userId }) }}
                                selected={userId === selectedUserId} />
                        ))}
                        {Object.keys(offlinePeople).map(userId => (
                            <Contact
                                key={userId}
                                id={userId}
                                online={false}
                                username={offlinePeople[userId].username}
                                onClick={() => setSelectedUserId(userId)}
                                selected={userId === selectedUserId} />
                        ))}
                    </div>
                    <div className="p-2 text-center flex items-center justify-center">
                        <span className="mr-2 text-md text-gray-900 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                            </svg> {username}
                        </span>
                        <button onClick={logout} className="text-md bg-blue-500 py-1 px-2 text-white border rounded-md hover:bg-blue-600 hover:scale-105 transition duration-200">Logout</button>
                    </div>
                </div>

                <div className='bg-blue-200 bg-opacity-50 w-2/3 p-4 flex flex-col rounded-lg'>
                    <div className="flex-grow overflow-y-auto no-scrollbar relative">
                        {!selectedUserId && (
                            <div className="flex h-full flex-grow items-center justify-center">
                                <div className="text-gray-500">&larr; Select a person from the sidebar to Start a Conversation</div>
                            </div>
                        )}
                        {!!selectedUserId && (
                            <div className="relative h-full">
                                <div className="overflow-y-scroll no-scrollbar absolute top-0 left-0 right-0 bottom-2 px-4">
                                    {messagesWithoutDupes.map(message => (
                                        <div key={message._id} className={(message.sender === id ? 'text-right' : 'text-left')}>
                                            <div className={"p-3 my-2 rounded-lg text-sm inline-block text-left transition duration-300 hover:scale-105 " + (message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-600')}>
                                                {message.text}
                                                {message.file && (
                                                    <div>
                                                        <a target="_blank" className="border-b flex items-center gap-1 hover:text-black transition duration-200" href={axios.defaults.baseURL + '/uploads/' + message.file}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.061l-7.81 7.81a.75.75 0 0 0 1.06 1.06L18.97 6.841a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                                                            </svg>
                                                            {message.file}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={divUnderMessages}></div>
                                </div>
                            </div>
                        )}
                    </div>
                    {!!selectedUserId && (
                        <form className="flex gap-2 mt-2" onSubmit={sendMessage}>
                            <input type="text"
                                value={newMessageText}
                                onChange={ev => setNewMessageText(ev.target.value)}
                                placeholder="Type your message here"
                                className="bg-white border p-2 flex-grow rounded-md" />
                            <label className="bg-blue-200 p-2 text-gray-600 border border-blue-300 rounded-md cursor-pointer hover:bg-blue-300 hover:scale-105 transition duration-200">
                                <input type="file" className="hidden" onChange={sendFile} />
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                    <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                                </svg>

                            </label>
                            <button type="submit" className="bg-blue-500 p-2 text-white rounded-md hover:bg-blue-600 hover:scale-105 transition duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M4.5 19.5V12l8.25-1.5L4.5 9v-7.5l17.25 9-17.25 9Z" />
                                </svg>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
