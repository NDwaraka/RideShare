// src/components/booking/BookingDetails.js
import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaCreditCard, FaPaypal } from 'react-icons/fa';

const BookingDetails = ({ selectedVehicle, pickupPoints, dropPoints, passengers, onCancel, onConfirm }) => {
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    
    return `${year}-${month}-${day}`;
  };

  const handleConfirm = () => {
    if (!bookingDate || !bookingTime) {
      alert('Please select date and time for your booking');
      return;
    }
    
    onConfirm({
      vehicle: selectedVehicle,
      pickupPoints,
      dropPoints,
      passengers,
      date: bookingDate,
      time: bookingTime,
      paymentMethod
    });
  };

  return (
    <div className="booking-container" style={{ marginTop: '30px' }}>
      <h3 style={{ marginBottom: '20px' }}>Complete Your Booking</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4 style={{ marginBottom: '15px' }}>Booking Summary</h4>
          
          <div style={{ 
            backgroundColor: '#f7fafc', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '24px', marginRight: '15px' }}>{selectedVehicle.icon}</span>
              <div>
                <h5 style={{ margin: 0 }}>{selectedVehicle.name}</h5>
                <span style={{ color: '#718096', fontSize: '14px' }}>{selectedVehicle.capacity}</span>
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Pickup Points:</div>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {pickupPoints.map((point, index) => (
                  <li key={index}>{point || 'Not specified'}</li>
                ))}
              </ul>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Drop-off Points:</div>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {dropPoints.map((point, index) => (
                  <li key={index}>{point || 'Not specified'}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Passengers:</div>
              <span>{passengers}</span>
            </div>
          </div>
          
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#ebf8ff', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Price Details:</div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '10px' 
            }}>
              <span>Base fare</span>
              <span>{selectedVehicle.price}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '10px' 
            }}>
              <span>Service fee</span>
              <span>$5.00</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 'bold',
              borderTop: '1px solid #bee3f8',
              paddingTop: '10px'
            }}>
              <span>Total</span>
              <span>${(parseFloat(selectedVehicle.price.replace('$', '')) + 5).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '15px' }}>Booking Details</h4>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <FaCalendarAlt style={{ marginRight: '5px' }} />
              Select Date
            </label>
            <input
              type="date"
              className="form-input"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={getCurrentDate()}
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <FaClock style={{ marginRight: '5px' }} />
              Select Time
            </label>
            <input
              type="time"
              className="form-input"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>Payment Method</div>
            
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px',
                border: `2px solid ${paymentMethod === 'card' ? '#38b2ac' : '#e2e8f0'}`,
                borderRadius: '8px',
                marginBottom: '10px',
                cursor: 'pointer'
              }}
              onClick={() => setPaymentMethod('card')}
              >
                <FaCreditCard style={{ marginRight: '10px', color: '#718096' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Credit / Debit Card</div>
                  <div style={{ fontSize: '14px', color: '#718096' }}>Visa, MasterCard, AmEx</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <input
                    type="radio"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px',
                border: `2px solid ${paymentMethod === 'paypal' ? '#38b2ac' : '#e2e8f0'}`,
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setPaymentMethod('paypal')}
              >
                <FaPaypal style={{ marginRight: '10px', color: '#718096' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>PayPal</div>
                  <div style={{ fontSize: '14px', color: '#718096' }}>Pay with your PayPal account</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <input
                    type="radio"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex',
            gap: '15px',
            marginTop: '30px'
          }}>
            <button 
              onClick={onCancel}
              style={{ 
                flex: 1,
                padding: '12px',
                backgroundColor: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              className="btn"
              style={{ flex: 1 }}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;