// src/components/home/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTaxi, FaUsers, FaRoute, FaCheckCircle } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <div style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url("/api/placeholder/1200/600")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        padding: '0 20px'
      }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Group Transportation Made Easy</h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 30px' }}>
            From bikes to buses, find the perfect vehicle for groups of any size with multiple pick-up and drop-off options.
          </p>
          <Link to="/dashboard" className="btn" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
            Book a Ride Now
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container" style={{ padding: '80px 20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '60px', fontSize: '2rem' }}>Why Choose RideGroup?</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '40px' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: '#38b2ac', marginBottom: '20px' }}>
              <FaUsers />
            </div>
            <h3 style={{ marginBottom: '15px' }}>Any Group Size</h3>
            <p>From solo travelers to large groups, we have vehicles that accommodate any party size.</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: '#38b2ac', marginBottom: '20px' }}>
              <FaRoute />
            </div>
            <h3 style={{ marginBottom: '15px' }}>Multiple Stops</h3>
            <p>Pick up everyone in your group and drop them off at different locations without the hassle.</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: '#38b2ac', marginBottom: '20px' }}>
              <FaTaxi />
            </div>
            <h3 style={{ marginBottom: '15px' }}>Diverse Fleet</h3>
            <p>Choose from bikes, cars, vans, and buses based on your specific needs and budget.</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: '#38b2ac', marginBottom: '20px' }}>
              <FaCheckCircle />
            </div>
            <h3 style={{ marginBottom: '15px' }}>Easy Booking</h3>
            <p>Our simple booking process gets you on the road in just a few clicks.</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{ backgroundColor: '#f7fafc', padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '60px', fontSize: '2rem' }}>How It Works</h2>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '40px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '30px'
            }}>
              <div style={{ 
                minWidth: '60px',
                height: '60px',
                backgroundColor: '#38b2ac',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>1</div>
              <div>
                <h3 style={{ marginBottom: '10px' }}>Enter Your Trip Details</h3>
                <p>Input your pickup and drop-off locations, add multiple stops if needed, and specify the number of passengers.</p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '30px'
            }}>
              <div style={{ 
                minWidth: '60px',
                height: '60px',
                backgroundColor: '#38b2ac',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>2</div>
              <div>
                <h3 style={{ marginBottom: '10px' }}>Browse Available Vehicles</h3>
                <p>We'll show you all the suitable vehicle options based on your group size and route requirements.</p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '30px'
            }}>
              <div style={{ 
                minWidth: '60px',
                height: '60px',
                backgroundColor: '#38b2ac',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>3</div>
              <div>
                <h3 style={{ marginBottom: '10px' }}>Select and Book</h3>
                <p>Choose your preferred vehicle, confirm your booking details, and you're all set!</p>
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Link to="/dashboard" className="btn">
              Book Your First Ride
            </Link>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div style={{ 
        backgroundColor: '#2d3748', 
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ marginBottom: '20px' }}>Ready to Simplify Group Travel?</h2>
          <p style={{ marginBottom: '30px', maxWidth: '700px', margin: '0 auto 30px' }}>
            Join thousands of satisfied customers who've found the perfect transportation solution for their groups.
          </p>
          <Link to="/register" className="btn" style={{ 
            backgroundColor: 'white', 
            color: '#2d3748',
            marginRight: '15px'
          }}>
            Sign Up
          </Link>
          <Link to="/dashboard" className="btn" style={{ 
            backgroundColor: 'transparent',
            border: '2px solid white'
          }}>
            Book Without Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', backgroundColor: '#f7fafc' }}>
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ marginBottom: '15px' }}>RideGroup</h3>
            <p>Group transportation made simple.</p>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '15px' }}>Links</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}><Link to="/" style={{ textDecoration: 'none', color: '#4a5568' }}>Home</Link></li>
              <li style={{ marginBottom: '10px' }}><Link to="/dashboard" style={{ textDecoration: 'none', color: '#4a5568' }}>Book a Ride</Link></li>
              <li style={{ marginBottom: '10px' }}><Link to="/login" style={{ textDecoration: 'none', color: '#4a5568' }}>Login</Link></li>
              <li><Link to="/register" style={{ textDecoration: 'none', color: '#4a5568' }}>Register</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '15px' }}>Contact</h4>
            <p>Email: info@ridegroup.com</p>
            <p>Phone: (123) 456-7890</p>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#718096' }}>
          <p>&copy; {new Date().getFullYear()} RideGroup. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;