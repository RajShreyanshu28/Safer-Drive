import React, { useEffect } from 'react';
import { Link } from "react-router-dom";

const Home = () => {
  useEffect(() => {
    // Redirect to the Flask application after 3 seconds
    
    const timer = setTimeout(() => {
      window.location.href = 'http://localhost:5000/';
    }, 3000);

    // Cleanup the timer when the component is unmounted
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ backgroundImage: "linear-gradient(#00d5ff,#0095ff,rgba(93,0,255,.555))" }} className="d-flex flex-column justify-content-center align-items-center text-center vh-100">
      <h1>Login Success Page</h1>
      <p>Redirecting to the main application...</p>

      <Link to='/login' className="btn btn-light my-5">Logout</Link>
    </div>
  )
}

export default Home;
