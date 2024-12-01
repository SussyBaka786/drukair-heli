import React, { useState, useEffect } from 'react';
import './BookingDetailsModal.css';

function PilotScheduleModal({ isOpen, onClose, passengers, booking, onUpdate }) {
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState(booking || {});
    const bookingStatuses = ['Confirmed', 'Delayed', 'On-Board', 'Completed'];
    const [imageError, setImageError] = useState(false);

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
        onUpdate(formData);
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
                            {passengers && passengers.map((passenger, index) => (
                                <div
                                    key={index}
                                    className={`passenger-tab ${activeTab === index ? 'active' : ''}`}
                                    onClick={() => setActiveTab(index)}
                                >
                                    Passenger {index + 1}
                                </div>
                            ))}
                        </div>

                        {passengers && passengers[activeTab] && (
                            <>
                                <div className="booking-form-group">
                                    <label>
                                        Name
                                        <input
                                            type="text"
                                            name="destination"
                                            value={passengers[activeTab].name || ''}
                                            readOnly
                                        />
                                    </label>

                                    <label>
                                        Gender
                                        <input
                                            type="text"
                                            name="gender"
                                            value={passengers[activeTab].gender || ''}
                                            readOnly
                                        />
                                    </label>
                                </div>

                                <div className="booking-form-group">
                                    <label>
                                        Weight (Kg)
                                        <input
                                            name="weight"
                                            value={passengers[activeTab].weight || ''}
                                            readOnly
                                        />
                                    </label>

                                    <label>
                                        Baggage Weight (Kg)
                                        <input
                                            type="text"
                                            name="luggageWeight"
                                            value={passengers[activeTab].bagWeight || ''}
                                            readOnly
                                        />
                                    </label>
                                </div>

                                <div className="booking-form-group">
                                    <label>
                                        Passport/CID
                                        <input
                                            type="text"
                                            name="cidPassport"
                                            value={passengers[activeTab].cid || ''}
                                            readOnly
                                        />
                                    </label>

                                    <label>
                                        Contact No
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            value={passengers[activeTab].contact || ''}
                                            readOnly
                                        />
                                    </label>
                                </div>

                                <div className="booking-form-group">
                                    <label>
                                        Medical Issue
                                        <input
                                            type="text"
                                            name="medicalIssue"
                                            value={passengers[activeTab].medIssue || ''}
                                            readOnly
                                        />
                                    </label>
                                </div>
                            </>
                        )}
                    </div>

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