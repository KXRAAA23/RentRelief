import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/MessagesPage.css";

const MessagesPage = () => {
  const [items, setItems] = useState([]); // bookings for renter, listings for owner
  const [selectedItem, setSelectedItem] = useState(null); // selected listing or booking
  const [bookings, setBookings] = useState([]); // approved bookings for owner
  const [selectedBooking, setSelectedBooking] = useState(null); // selected booking to chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const role = localStorage.getItem("role"); // renting or listing
  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const token = localStorage.getItem("token");

  // Fetch data based on role
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === "renting") {
          // Renter: fetch approved bookings
          const res = await axios.get("http://localhost:5000/api/bookings/approved", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setItems(res.data);
        } else if (role === "listing") {
          // Owner: fetch all bookings for their listings
          const res = await axios.get("http://localhost:5000/api/bookings/owner", {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Extract unique listings
          const listingsMap = {};
          res.data.forEach((b) => {
            const listId = b.listing._id || b.listingId._id;
            listingsMap[listId] = b.listing || b.listingId;
          });
          setItems(Object.values(listingsMap));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [role, token]);

  // Fetch approved bookings for a listing (owner)
  const fetchBookings = async (listingId) => {
    try {
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
      const res = await axios.get(
        `http://localhost:5000/api/bookings/${bookingId}/messages`,
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
      const res = await axios.post(
        `http://localhost:5000/api/bookings/${selectedBooking._id}/messages`,
        { text: newMessage },
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
                  ? `${item.listing?.title || item.listingId?.title} – ${item.listing?.station || item.listingId?.station || "N/A"}`
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
                  {b.renterId?.name} – {new Date(b.startDate).toLocaleDateString()}
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
              {role === "renting"
                ? selectedBooking.listing?.title || selectedBooking.listingId?.title
                : selectedItem.title}
            </h2>
            <div className="chat-messages">
              {messages.map((msg, i) => {
                const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
                return (
                  <div
                    key={i}
                    className={`message ${
                      String(senderId) === String(userId) ? "my-message" : "their-message"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span>{new Date(msg.timestamp || msg.createdAt).toLocaleTimeString()}</span>
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
