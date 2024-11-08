import { useState, useContext } from "react";
import bgImage from '/bg.jpg';
import axios from "axios";
import { UserContext } from "./UserContext.jsx";

export default function RegisterAndLoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
    
    async function handleSubmit(ev) {
        ev.preventDefault();

        // Use absolute URL to avoid any connection issues
        const url = `http://localhost:4000/${isLoginOrRegister === 'register' ? 'register' : 'login'}`;

        try {
            // Send the request to the server
            const { data } = await axios.post(url, { username, password });
            setLoggedInUsername(username);
            setId(data.id);
        } catch (error) {
            console.error("Error during registration or login:", error);
            // Optionally: Display error message to the user
        }
    }

    return (
        <div
            className="h-screen flex flex-col items-center justify-center"
            style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg transition-transform transform hover:scale-105 hover:text-blue-300 animate__animated animate__fadeInDown">
                Welcome to MernChat App
            </h1>
            <h2 className="text-3xl font-bold text-yellow-400 mb-8 drop-shadow-lg transition-transform transform hover:scale-105 hover:text-yellow-300 animate__animated animate__fadeIn animate__delay-1s">
                Register and Login
            </h2>
            <p className="text-lg text-white mb-4 animate__animated animate__fadeIn animate__delay-2s">
                Join us and connect with friends!
            </p>
            <form
                className="bg-gray-500 bg-opacity-40 w-74 p-6 mx-auto mb-12 rounded-lg shadow-lg transition-transform transform hover:scale-105" 
                onSubmit={handleSubmit}
            >
                <input
                    value={username}
                    onChange={ev => setUsername(ev.target.value)}
                    type="text"
                    placeholder="Username"
                    className="block w-full rounded-sm p-2 mb-2 border bg-opacity-10 bg-slate-200 text-black"
                />
                <input
                    value={password}
                    onChange={ev => setPassword(ev.target.value)}
                    type="password"
                    placeholder="Password"
                    className="block w-full rounded-sm p-2 mb-2 border bg-opacity-10 bg-gray-50 text-black"
                />
                <button
                    className="bg-blue-500 text-white block w-full text-lg rounded-md p-2 hover:bg-blue-600 transition-shadow shadow-md hover:shadow-lg"
                >
                    {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
                </button>

                <div className="text-lime-400 mt-4 text-center text-xl">
                    {isLoginOrRegister === 'register' && (
                        <div>
                            Already have an account?{' '}
                            <button 
                                type="button" 
                                onClick={() => setIsLoginOrRegister('login')} 
                                className="text-red-300 transition-colors duration-200"
                            >
                                Login
                            </button>
                        </div>
                    )}
                    {isLoginOrRegister === 'login' && (
                        <div>
                            Don't have an account?{' '}
                            <button 
                                type="button" 
                                onClick={() => setIsLoginOrRegister('register')} 
                                className="text-red-300 transition-colors duration-200"
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
