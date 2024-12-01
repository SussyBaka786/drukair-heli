import React, { useState, useEffect } from "react";
import "./BookingDetailsModal.css";
import axios from "axios";
import Swal from "sweetalert2";
import { IoMdRemove, IoMdAdd } from "react-icons/io";

function AdminScheduleModal({
  isOpen,
  onClose,
  passengers,
  booking,
  onUpdate,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({});
  const [pilots, setPilots] = useState([]);
  const bookingStatuses = [
    "Booked",
    "Pending",
    "Cancelled",
    "Confirmed",
    "Delayed",
    "On-Board",
    "Completed",
  ];
  const [refunds, setRefunds] = useState([]);
  const [bookings, setBookings] = useState([]);
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
        refund_id: booking.refund_id?._id || "",
        duration:
          booking.destination === null
            ? booking.duration
            : booking.destination?.duration || 0,
        assigned_pilot: booking.assigned_pilot ? booking.assigned_pilot : " ",
      });
    }
  }, [booking]);

  // console.log(booking.bookingPriceUSD)

  useEffect(() => {
    const fetchBooking = async () => {
      if (booking) {
        try {
          const date = booking.flight_date;
          const response = await axios.get(
            `http://localhost:4001/api/bookings`
          );
          const bookings = response.data.data;
          const filteredBookings = bookings.filter(
            (b) => new Date(b.flight_date).toLocaleDateString("en-GB") === date
          );
          setBookings(Array.isArray(filteredBookings) ? filteredBookings : []);
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Error fetching booking",
            icon: "error",
            confirmButtonColor: "#1E306D",
            confirmButtonText: "OK",
          });
        }
      }
    };
    fetchBooking();
  }, [booking]);

  useEffect(() => {
    const fetchPilots = async () => {
      try {
        const response = await axios.get("http://localhost:4001/api/users");
        const allPilots = response.data.data.filter(
          (user) => user.role.name === "PILOT"
        );
        setPilots(allPilots);
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Error fetching pilot data",
          icon: "error",
          confirmButtonColor: "#1E306D",
          confirmButtonText: "OK",
        });
      }
    };
    fetchPilots();
  }, [bookings, booking]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData, passengerList);
    onClose();
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal-content booking-form-container">
        <span className="service-modal-close-button" onClick={onClose}>
          &times;
        </span>
        <div className="form-title">Booking Details</div>

        <form onSubmit={handleSubmit}>
          <p className="booking-break-header">Client/Agent Details</p>

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
                checked={booking.layap}
                readOnly
              />
              Are all passengers highlanders? (if all passengers are from Laya,Lunana,Gasa,Merak,Sakteng they will be liable for 50% discount)
            </label>
          </div>

          <p className="booking-break-header">Flight Logistics</p>
          <div className="booking-form-group">
            <label>
              Destination
              <input
                type="text"
                name="destination"
                value={
                  booking.destination === null
                    ? booking.destination_other
                    : booking.destination.sector
                }
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

          <div className="booking-form-group">
            <label>
              Ground Time ("If Required")
              <input name="groundTime" value={booking.ground_time} readOnly />
            </label>

            <label>
              Date Of Flight
              <input name="flightDate" value={booking.flight_date} readOnly />
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
          <p className="booking-break-header">Extra Details</p>
          <div className="booking-form-group">
            <label>
              Assigned Pilot
              <select
                name="assigned_pilot"
                value={formData.assigned_pilot || ""}
                onChange={handleInputChange}
              >
                <option hidden value="">
                  {booking.assigned_pilot ? booking.assigned_pilot.name : "Assign a pilot"}
                </option>
                {pilots.map((pilot) => (
                  <option key={pilot._id} value={pilot._id}>
                    {pilot.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Booking Status
              {booking.status !== "Declined" ? (
                <select
                  name="status"
                  value={formData.status || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select status</option>
                  {bookingStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="status"
                  value={booking.status}
                  readOnly
                />
              )}
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
              Payable
              <input
                type="text"
                name="payable"
                value={booking.payable === true ? "Yes" : "No"}
                readOnly
              />
            </label>
          </div>

          <div className="booking-form-group">
            <label>
              Refund(in %)
              <select
                name="refund_id"
                value={formData.refund_id || ""}
                onChange={handleInputChange}
                required
              // readOnly
              >
                <option value="">Select refund policy</option>
                {refunds.map((refund) => (
                  <option key={refund._id} value={refund._id}>
                    {refund.plan}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Duration (Mins)
              <input
                type="Number"
                name="duration"
                value={formData.duration}
                readOnly
              />
            </label>
          </div>
          <div className="booking-form-group">
            <label>
              Payment Status
              <input
                type="text"
                name="payment_status"
                value={booking.payment_status}
                readOnly
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
              Price (in BTN)
              <input
                type="Number"
                name="bookingPriceBTN"
                value={Number(booking.refund_id ? (booking.bookingPriceBTN - (booking.bookingPriceBTN * (booking.refund_id.plan / 100))) : booking.bookingPriceBTN).toFixed(2)}
                readOnly
              />
            </label>
            <label>
              Price(in USD)
              <input
                type="Number"
                name="bookingPriceUSD"
                value={Number(booking.refund_id ? ((booking.bookingPriceUSD - (booking.bookingPriceUSD * (booking.refund_id.plan / 100)))) : (booking.bookingPriceUSD)).toFixed(2)}
                readOnly
              />
            </label>
          </div>

          <div className="booking-form-group">
            <label>
              Booking Type
              <input
                type="text"
                name="bookingType"
                value={booking.booking_type}
                readOnly
              />
            </label>
            <label>
              Payment Type
              <input
                type="text"
                name="paymentType"
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
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminScheduleModal;
