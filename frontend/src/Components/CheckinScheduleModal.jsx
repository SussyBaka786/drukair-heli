import React, { useState, useEffect } from 'react';
import './BookingDetailsModal.css';
import { IoMdRemove, IoMdAdd } from "react-icons/io";

function PilotScheduleModal({ isOpen, onClose, passengers, booking, onUpdate }) {
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState(booking || {});
    const bookingStatuses = ['Confirmed', 'Delayed', 'On-Board', 'Completed'];
    const [imageError, setImageError] = useState(false);


    const [passengerList, setPassengerList] = useState();

    // Fields
    const genderTypes = ['Male', 'Female', 'Others'];
    const medicalIssues = ['Yes', 'No'];

    useEffect(() => {
        if (passengers && Array.isArray(passengers)) {
            setPassengerList(passengers);
        }
    }, [passengers]);

    const addPassenger = () => {
        const newPassenger = {
            name: '',
            gender: '',
            weight: '',
            bagWeight: '',
            cid: '',
            contact: '',
            medIssue: ''
        };
        setPassengerList([...passengerList, newPassenger]);
    };

    const removePassenger = (index) => {
        const updatedPassengers = passengerList.filter((_, i) => i !== index);
        setPassengerList(updatedPassengers);
        // Reset active tab if the current one is removed
        if (index === activeTab && updatedPassengers.length > 0) {
            setActiveTab(Math.max(0, index - 1)); // Move to the previous passenger or first if none left
        }
    };
    const handleImageError = () => {
        setImageError(true);
    };

    useEffect(() => {
        if (booking) {
            setFormData({
                ...booking,
                status: booking.status || bookingStatuses[0],
                duration:
                    booking.destination === null
                        ? booking.duration
                        : booking.destination?.duration || 0,
            });
        }
    }, [booking]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData, passengerList);
        onClose();
    };

    if (!isOpen || !booking) return null;

    // Safely access nested properties
    const serviceName = booking.service_id?.name || 'N/A';
    const currencyType = booking?.cType || '';
    const destinationSector = booking.destination === null ? booking.destination_other : booking.destination?.sector;
    const pilotName = booking.assigned_pilot?.name || 'No Pilots Assigned';

    return (
        <div className="booking-modal-overlay">
            <div className="booking-modal-content booking-form-container">
                <span className="service-modal-close-button" onClick={onClose}>
                    &times;
                </span>
                <div className='form-title'>Booking Details</div>

                <form onSubmit={handleSubmit}>
                    <p className='booking-break-header'>Client/Agent Details</p>
                    <div className="booking-form-group">
                        <label>
                            Name of the client/agent
                            <input
                                type="text"
                                name="agentName"
                                value={booking.agent_name || ''}
                                readOnly
                            />
                        </label>
                        <label>
                            Phone Number
                            <input
                                type="number"
                                name="agentPhone"
                                value={booking.agent_contact || ''}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            CID
                            <input
                                type="text"
                                name="agentCid"
                                value={booking.agent_cid || ''}
                                readOnly
                            />
                        </label>

                        <label>
                            Email Address
                            <input
                                type="email"
                                name="agentEmail"
                                value={booking.agent_email || ''}
                                readOnly
                            />
                        </label>
                    </div>

                    <p className='booking-break-header'>Flight Logistics</p>
                    <div className="booking-form-group">
                        <label>
                            Destination
                            <input
                                type="text"
                                name="destination"
                                value={destinationSector || ''}
                                readOnly
                            />
                        </label>

                        <label>
                            Pick Up Point
                            <input
                                type="text"
                                name="pickUpPoint"
                                value={booking.pickup_point || ''}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Ground Time ("If Required")
                            <input
                                name="groundTime"
                                value={booking.ground_time || ''}
                                readOnly
                            />
                        </label>

                        <label>
                            Date Of Flight
                            <input
                                name="flightDate"
                                value={booking.flight_date || ''}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Time of Departure
                            <input
                                type="text"
                                name="departureTime"
                                value={booking.departure_time || ''}
                                readOnly
                            />
                        </label>

                        <label>
                            Permission for Private Helipad
                            <input
                                type="text"
                                name="name"
                                value={booking.permission ? "Yes" : "No"}
                                readOnly
                            />
                        </label>
                    </div>

                    <div>
                        <div className="passenger-tab-wrapper">
                            {passengerList && passengerList.map((passenger, index) => (
                                <div
                                    key={index}
                                    className={`passenger-tab ${activeTab === index ? 'active' : ''}`}
                                    onClick={() => setActiveTab(index)}
                                >
                                    Passenger {index + 1}
                                </div>
                            ))}
                        </div>

                        {passengerList && passengerList[activeTab] && (
                            <>
                                <div className="booking-form-group">
                                    <label>
                                        Name
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={passengerList[activeTab]?.name || ''
                                            }
                                            onChange={(e) => {
                                                const updatedPassengers = [...passengerList];
                                                updatedPassengers[activeTab].name = e.target.value;
                                                setPassengerList(updatedPassengers);
                                            }}
                                        />
                                    </label>

                                    <label> Gender
                                        <select
                                            name="gender"
                                            value={passengerList[activeTab]?.gender || ''}
                                            required
                                            onChange={(e) => {
                                                const updatedPassengers = [...passengerList];
                                                updatedPassengers[activeTab].gender = e.target.value;
                                                setPassengerList(updatedPassengers);
                                            }}
                                        >
                                            <option value="" disabled>Select gender</option>
                                            {genderTypes.map((gender) => (
                                                <option key={gender} value={gender}>{gender}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <div className="booking-form-group">
                                    <label>
                                        Weight (Kg)
                                        <input
                                            type="number"
                                            name="weight"
                                            value={passengerList[activeTab]?.weight || ''}
                                            required
                                            onChange={(e) => {
                                                const updatedPassengers = [...passengerList];
                                                updatedPassengers[activeTab].weight = e.target.value;
                                                setPassengerList(updatedPassengers);
                                            }}
                                        />
                                    </label>

                                    <label>
                                        Baggage Weight (Kg)
                                        <input
                                            type="number"
                                            name="luggageWeight"
                                            value={passengerList[activeTab]?.bagWeight || ''}
                                            required
                                            onChange={(e) => {
                                                const updatedPassengers = [...passengerList];
                                                updatedPassengers[activeTab].bagWeight = e.target.value;
                                                setPassengerList(updatedPassengers);
                                            }}
                                        />
                                    </label>
                                </div>

                                <div className="booking-form-group">
                                    <label>
                                        Passport/CID
                                        <input
                                            type="text"
                                            name="cidPassport"
                                            required
                                            value={passengerList[activeTab]?.cid || ''}
                                            onChange={(e) => {
                                                const updatedPassengers = [...passengerList];
                                                updatedPassengers[activeTab].cid = e.target.value;
                                                setPassengerList(updatedPassengers);
                                            }}
                                        />
                                    </label>

                                    <label>
                                        Contact No
                                        <input
                                            type="number"
                                            name="phoneNumber"
                                            required
                                            value={passengerList[activeTab]?.contact || ''}
                                            onChange={(e) => {
                                                const updatedPassengers = [...passengerList];
                                                updatedPassengers[activeTab].contact = e.target.value;
                                                setPassengerList(updatedPassengers);
                                            }}
                                        />
                                    </label>
                                </div>

                                <div className="booking-form-group">
                                    <label>
                                        Medical Issue
                                        <select
                                            name="medicalIssue"
                                            value={passengerList[activeTab]?.medIssue || ''}
                                            required
                                            onChange={(e) => {
                                                const updatedPassengers = [...passengerList];
                                                updatedPassengers[activeTab].medIssue = e.target.value;
                                                setPassengerList(updatedPassengers);
                                            }}
                                        >
                                            <option value="" disabled>Select Medical Issue</option>
                                            {medicalIssues.map((medIssue) => (
                                                <option key={medIssue} value={medIssue}>{medIssue}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                            </>
                        )}

                        {passengerList.length > 1 && (
                            <button
                                type="button"
                                className='passenger-btn'
                                onClick={() => removePassenger(activeTab)}
                                style={{ marginBottom: '20px' }}
                            >
                                Remove Passenger
                                <div className="passenger-icon-container" >
                                    <IoMdRemove className='passenger-icon' />
                                </div>
                            </button>
                        )}

                        {passengerList.length < 6 && (
                            <button type="button" className='passenger-btn' onClick={addPassenger}>
                                Add More
                                <div className="passenger-icon-container">
                                    <IoMdAdd className='passenger-icon' />
                                </div>
                            </button>
                        )}
                    </div>
                    <div className="whiteSpace"></div>

                    <p className='booking-break-header'>Extra Details</p>
                    <div className="booking-form-group">
                        <label>
                            Assigned Pilot
                            <input
                                type="text"
                                name="assignedPilot"
                                value={pilotName}
                                readOnly
                            />
                        </label>
                        <label>
                            Booking Status
                            <select
                                name="status"
                                value={formData.status || bookingStatuses[0]}
                                onChange={handleInputChange}
                                required
                            >
                                {bookingStatuses.map((status, index) => (
                                    <option key={index} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Service Type
                            <input
                                type="text"
                                name="serviceType"
                                value={serviceName}
                                readOnly
                            />
                        </label>
                        <label>
                            Booking Type
                            <input
                                type="text"
                                name="bookingType"
                                value={booking.booking_type || ''}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Price(in {currencyType})
                            <input
                                type="text"
                                name="price"
                                value={Number(booking.refund_id ? (booking.price - (booking.price * (booking.refund_id.plan / 100))) : booking.price).toFixed(2) || ''}
                                readOnly
                            />
                        </label>
                        <label>
                            Payment Type
                            <input
                                type="text"
                                name="paymentType"
                                value={booking.payment_type || ''}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        {booking.journal_no && booking.journal_no !== "None" && (
                            <label>
                                Journal Number
                                <input
                                    type="text"
                                    name="journalNumber"
                                    value={booking.journal_no}
                                    readOnly
                                />
                            </label>
                        )}
                    </div>

                    {booking.image && (
                        <div className="booking-form-group">
                            <label>
                                Payment Screenshot
                                {!imageError ? (
                                    <img
                                        src={booking.image}
                                        alt="Payment screenshot"
                                        style={{
                                            maxWidth: "200px",
                                            height: "250px",
                                            objectFit: "cover",
                                        }}
                                        onError={handleImageError}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "200px",
                                            height: "250px",
                                            backgroundColor: "#f0f0f0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#666",
                                        }}
                                    >
                                        Image failed to load
                                    </div>
                                )}
                            </label>
                        </div>
                    )}

                    <button type="submit" className="admin-booking-modal-btn admin-schedule-modal-btn">
                        Update
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PilotScheduleModal;