import React, { useState, useEffect } from 'react';
import './BookingDetailsModal.css';
import axios from "axios";
import Swal from "sweetalert2";
import { IoMdRemove, IoMdAdd } from "react-icons/io";

function AdminBookingModal({ isModalOpen, onClose, booking, passengers, onUpdate }) {
    const [bookingUpdate, setBookingUpdate] = useState({
        id: booking._id,
        duration: booking.destination === null || booking.destination === "Others" ? booking.duration : booking.destination.duration,
        bookingPriceBTN: booking.bookingPriceBTN,
        bookingPriceUSD: booking.bookingPriceUSD,
        refund_id: booking.refund_id ? booking.refund_id : 0,
        payable: booking.payable || false,
        layap: booking.layap || false,
        payment_status: booking.payment_status || "Not paid"
    });

    const [refunds, setRefunds] = useState([]);
    const [imageError, setImageError] = useState(false);
    const [refundChosenPlan, setRefundChosenPlan] = useState(parseFloat(booking?.refund_id.plan / 100));
    const [passengerList, setPassengerList] = useState(passengers);
    const [activeTab, setActiveTab] = useState(0);

    // Fields
    const genderTypes = ['Male', 'Female', 'Others'];
    const medicalIssues = ['Yes', 'No'];

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
        const fetchRefund = async () => {
            try {
                const response = await axios.get("http://localhost:4001/api/refund");
                const enabledRefunds = response.data.data.filter(
                    (refund) => refund.status === "Enabled"
                );
                setRefunds(enabledRefunds);
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: "Error fetching refund data",
                    icon: "error",
                    confirmButtonColor: "#1E306D",
                    confirmButtonText: "OK",
                });
            }
        };
        fetchRefund();
    }, []);

    const fetchRefundChosen = async (rId) => {
        try {
            const response = await axios.get(`http://localhost:4001/api/refund/${rId}`);
            const refundPlan = response.data.data.plan;
            setRefundChosenPlan(parseFloat(refundPlan) / 100);
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "Error fetching refund data",
                icon: "error",
                confirmButtonColor: "#1E306D",
                confirmButtonText: "OK",
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "refund_id") {
            fetchRefundChosen(value);
        }
        setBookingUpdate((prevBooking) => ({
            ...prevBooking,
            [name]: value,
        }));
    };

    if (!isModalOpen || !booking) return null;

    return (
        <div className="booking-modal-overlay">
            <div className="booking-modal-content booking-form-container">
                <span className="service-modal-close-button" onClick={onClose}>
                    &times;
                </span>
                <div className='form-title'>Booking Details</div>

                <form>
                    <p className='booking-break-header'>Client/Agent Details</p>
                    <div className="booking-form-group">
                        <label>
                            Booking ID
                            <input
                                type="text"
                                name="bookingID"
                                value={booking.bookingID}
                                readOnly
                            />
                        </label>
                    </div>
                    <div className="booking-form-group">
                        <label>
                            Name of the client/agent
                            <input
                                type="text"
                                name="agentName"
                                value={booking.agent_name}
                                readOnly
                            />
                        </label>
                        <label>
                            Phone Number
                            <input
                                type="number"
                                name="agentPhone"
                                value={booking.agent_contact}
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
                                value={booking.agent_cid}
                                readOnly
                            />
                        </label>

                        <label>
                            Email Address
                            <input
                                type="email"
                                name="agentEmail"
                                value={booking.agent_email}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group checkbox-layap-group">
                        <label>
                            <input
                                type="checkbox"
                                name="layap"
                                checked={bookingUpdate.layap}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, layap: e.target.checked })
                                }
                            />
                            Are all passengers highlanders? (if all passengers are from Laya, Lunana, Gasa, Merak, Sakteng they will be liable for 50% discount)
                        </label>
                    </div>

                    <p className='booking-break-header'>Flight Logistics</p>
                    <div className="booking-form-group">
                        <label>
                            Destination
                            <input
                                type="text"
                                name="destination"
                                value={booking.destination === null ? booking.destination_other : booking.destination.sector}
                                readOnly
                            />
                        </label>

                        <label>
                            Pick Up Point
                            <input
                                type="text"
                                name="pickUpPoint"
                                value={booking.pickup_point}
                                readOnly
                            />
                        </label>
                    </div>

                    {booking.destination === null ?
                        <div className="booking-form-group">
                            <label>
                                Coordinates Latitude (North/South Value)
                                <input
                                    type="text"
                                    name="latitude"
                                    value={booking.latitude}
                                    readOnly
                                />
                            </label>

                            <label>
                                Coordinates Longitude (East/West Value)
                                <input
                                    type="text"
                                    name="longitude"
                                    value={booking.Longitude}
                                    readOnly
                                />
                            </label>
                        </div> : null
                    }

                    <div className="booking-form-group">
                        <label>
                            Ground Time ("If Required")
                            <input
                                name="groundTime"
                                value={booking.ground_time}
                                readOnly
                            />
                        </label>

                        <label>
                            Date Of Flight
                            <input
                                name="flightDate"
                                value={booking.flight_date}
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
                                value={booking.departure_time}
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
                                            value={passengerList[activeTab]?.name || ''}
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
                                            type='number'
                                            name="weight"
                                            required
                                            value={passengerList[activeTab]?.weight || ''}
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
                                            required
                                            value={passengerList[activeTab]?.bagWeight || ''}
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
                                value={booking.assigned_pilot ? booking.assigned_pilot.name : "No Pilots Assigned"}
                                readOnly
                            />
                        </label>
                        <label>
                            Booking Status
                            <input
                                type="text"
                                name="bookingStatus"
                                value={booking.status}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Service Type
                            <input
                                type="text"
                                name="serviceType"
                                value={booking.service_id.name}
                                readOnly
                            />
                        </label>
                        <label>
                            Booking Type
                            <input
                                type="text"
                                name="bookingType"
                                value={booking.booking_type}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Duration (Mins)
                            <input
                                type="Number"
                                name="duration"
                                value={bookingUpdate.destination === null || bookingUpdate.destination === "Others" ? 0 : bookingUpdate.duration}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, duration: e.target.value })
                                }
                            />
                        </label>

                        <label>
                            Currency Type
                            <input
                                type="Text"
                                name="price"
                                value={booking.cType}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Refund (in %)
                            <select
                                name="refund_id"
                                value={bookingUpdate.refund_id}
                                onChange={handleInputChange}
                                required
                            >
                                <option hidden value="">
                                    {booking.refund_id ? booking.refund_id.plan : "Select Refund Plan"}
                                </option>
                                {refunds.map((refund) => (
                                    <option key={refund._id} value={refund._id}>
                                        {refund.plan}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Payment Status
                            <select
                                value={bookingUpdate.payment_status}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, payment_status: e.target.value })
                                }
                            >
                                <option value="Paid">Paid</option>
                                <option value="Not paid">Not Paid</option>
                            </select>
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Price (in BTN)
                            <input
                                type="Number"
                                name="bookingPriceBTN"
                                value={Number(refundChosenPlan === 0 ? bookingUpdate.bookingPriceBTN : (bookingUpdate.bookingPriceBTN - (bookingUpdate.bookingPriceBTN * refundChosenPlan))).toFixed(2)}
                                readOnly
                            />
                        </label>
                        <label>
                            Price (in USD)
                            <input
                                type="Number"
                                name="bookingPriceUSD"
                                value={Number(refundChosenPlan === 0 ? (bookingUpdate.bookingPriceUSD) : ((bookingUpdate.bookingPriceUSD - (bookingUpdate.bookingPriceUSD * refundChosenPlan)))).toFixed(2)}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        <label>
                            Payable
                            <select
                                value={bookingUpdate.payable}
                                onChange={(e) =>
                                    setBookingUpdate({ ...bookingUpdate, payable: e.target.value === "true" })
                                }
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </label>

                        <label>
                            Payment Type
                            <input
                                type="text"
                                name="payable"
                                value={booking.payment_type}
                                readOnly
                            />
                        </label>
                    </div>

                    <div className="booking-form-group">
                        {booking.journal_no !== "None" && (
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

                    <button
                        type="submit"
                        className="admin-booking-modal-btn admin-schedule-modal-btn"
                        onClick={(e) => {
                            e.preventDefault();
                            onUpdate(bookingUpdate, passengerList);
                        }}
                    >
                        Update
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminBookingModal;