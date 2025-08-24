import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/MessagesPage.css";

const MessagesPage = () => {
  const [items, setItems] = useState([]); // bookings for renter, listings for owner
  const [selectedItem, setSelectedItem] = useState(null); // selected booking/listing
  const [bookings, setBookings] = useState([]); // only for owner to select booking
  const [selectedBooking, setSelectedBooking] = useState(null); // booking being messaged
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const role = localStorage.getItem("role");
  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;

  // Fetch data based on role
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (role === "renting") {
          const res = await axios.get("http://localhost:5000/api/bookings/approved", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setItems(res.data);
        } else if (role === "listing") {
          const res = await axios.get("http://localhost:5000/api/bookings/owner", {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Extract unique listings
          const listingsMap = {};
          res.data.forEach((b) => {
            listingsMap[b.listingId._id] = b.listingId;
          });
          setItems(Object.values(listingsMap));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [role]);

  // Fetch approved bookings for a listing (owner)
  const fetchBookings = async (listingId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/bookings/listing/${listingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(res.data.filter((b) => b.status === "approved"));
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  // Fetch messages for a booking
  const fetchMessages = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/messages/booking/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSelectedBooking(null);
    setMessages([]);
    if (role === "listing") fetchBookings(item._id);
    else {
      setSelectedBooking(item);
      fetchMessages(item._id);
    }
  };

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    fetchMessages(booking._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedBooking) return;
    try {
      const token = localStorage.getItem("token");
      const receiverId =
        role === "renting"
          ? selectedBooking.listingId.userID
          : selectedBooking.renterId._id;

      const res = await axios.post(
        "http://localhost:5000/api/messages",
        {
          bookingId: selectedBooking._id,
          text: newMessage,
          receiverId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="messages-container">
      <div className="messages-sidebar">
        <h2>{role === "renting" ? "Your Approved Bookings" : "Your Listings"}</h2>
        {items.length === 0 ? (
          <p>{role === "renting" ? "No approved bookings yet." : "No listings yet."}</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li
                key={item._id}
                className={selectedItem?._id === item._id ? "active" : ""}
                onClick={() => handleSelectItem(item)}
              >
                {role === "renting"
                  ? `${item.listingId?.title} – ${item.listingId?.station || "N/A"}`
                  : item.title}
              </li>
            ))}
          </ul>
        )}

        {/* Owner side: list approved bookings */}
        {role === "listing" && selectedItem && bookings.length > 0 && (
          <>
            <h3>Approved Bookings</h3>
            <ul>
              {bookings.map((b) => (
                <li
                  key={b._id}
                  className={selectedBooking?._id === b._id ? "active" : ""}
                  onClick={() => handleSelectBooking(b)}
                >
                  {b.renterId.name} – {new Date(b.startDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="chat-section">
        {selectedBooking ? (
          <>
            <h2>
              Chat about{" "}
              {role === "renting" ? selectedBooking.listingId.title : selectedItem.title}
            </h2>
            <div className="chat-messages">
              {messages.map((msg) => {
                // Normalize senderId for both string and object
                const senderId =
                  typeof msg.sender === "string" ? msg.sender : msg.sender?._id;

                return (
                  <div
                    key={msg._id}
                    className={`message ${
                      String(senderId) === String(userId) ? "my-message" : "their-message"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                );
              })}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p>
            Select a {role === "renting" ? "booking" : "booking from the listing"} to start
            messaging
          </p>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
