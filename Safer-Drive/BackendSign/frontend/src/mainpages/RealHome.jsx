import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './RealHome.css'; // Ensure this path matches your project structure
import signImage from '../../../../static/images/sign.jpg'; // Adjust paths as necessary
import carsImage from '../../../../static/images/cars.jpg';

const DrowsinessDetection = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [inputNumber, setInputNumber] = useState('');
    const [numbers, setNumbers] = useState([]);
    const [responseMessage, setResponseMessage] = useState('');
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchNumbers(storedToken);
        }
    }, []);

    const fetchNumbers = (token) => {
        fetch('http://127.0.0.1:3001/get-numbers', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                setNumbers(data);
            } else {
                setResponseMessage('No numbers found');
            }
        })
        .catch(error => {
            console.error('Error fetching numbers:', error);
        });
    };

    const handleNumberSubmit = () => {
        if (inputNumber) {
            setNumbers(prevNumbers => [...prevNumbers, inputNumber]);
            setInputNumber('');
        }
    };

    const handleSubmit = () => {
        fetch('http://127.0.0.1:3001/add-numbers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ numbers })
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            setResponseMessage(data.message || 'Numbers saved successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
            setResponseMessage('An error occurred');
        });
    };

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };
    const handleEnterClick = () => {
        fetch('http://127.0.0.1:5000/process_number', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ numbers }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Emergency numbers sent:', data);
            // Now redirect to the Flask app
            window.location.href = 'http://localhost:5000/';
        })
        .catch(error => {
            console.error('Error sending emergency numbers:', error);
        });
    };
    
    return (
        <div>
            <nav id="navbar">
                <div className="nav-left">
                    <img src={signImage} alt="Logo" className="logo" />
                </div>
                <div className="nav-right">
                    <button id="popup-btn" onClick={toggleDropdown}>Emergency Contact</button>
                    <button id="logout-btn" onClick={() => {
                        localStorage.removeItem('token'); // Clear token on logout
                        setToken(''); // Clear token state
                        navigate('/login');
                        console.log('Logout');

                    }}>Logout</button>
                </div>
            </nav>

            {showDropdown && (
                <div className="dropdown">
                    <input
                        type="text"
                        id="input-number"
                        placeholder="Enter Emergency Contact Number"
                        value={inputNumber}
                        onChange={(e) => setInputNumber(e.target.value)}
                    />
                    <button onClick={handleNumberSubmit}>Add Number</button>
                    <button onClick={handleSubmit}>Save Numbers</button>
                    <ul>
                        {numbers.map((number, index) => (
                            <li key={index}>{number}</li>
                        ))}
                    </ul>
                    <p id="response">{responseMessage}</p>
                </div>
            )}

            <section id="intro">
                <img className="car" src={carsImage} alt="Car Image" />
                <div className="intro-content">
                    <h1><b>Welcome to the FUTURE of DRIVING</b></h1>
                    <p>Ensure your safety by detecting drowsiness and yawning. Also, get help in an emergency....</p>
                    <a href="https://github.com/RajShreyanshu28?tab=repositories" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-github icon" style={{ fontSize: '40px', marginRight: '40px' }}></i>
                    </a>
                    <button id="enter-btn" onClick={handleEnterClick}>Enter</button>

                </div>
            </section>

            <section id="main-content">
                
                <div id="instructions">
                    <h2><b>INSTRUCTIONS TO USE!</b></h2><br />
                    <h3>1 - Allow LOCATION access.<br /></h3>
                    <h3>2 - Enter the phone number of one of your emergency contacts. <br /></h3>
                    <h3>3 - Adjust the camera such that only the driver's face is visible.<br /></h3>
                </div>
            </section>
        </div>
    );
}

export default DrowsinessDetection;
