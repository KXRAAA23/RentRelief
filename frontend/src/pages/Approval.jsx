import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Approval.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:5000/api/admin/pending-verifications",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(data.filter(u => u));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleAction = async (userId, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/verify-document/${userId}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(users.map(user => {
        if (!user || user._id !== userId) return user;
        return {
          ...user,
          documents: user.documents
            ? { ...user.documents, status: action === "approve" ? "approved" : "rejected" }
            : null
        };
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-dashboard">
  {users.length === 0 ? (
    <p>No pending verifications.</p>
  ) : (
    <div className="admin-cards-container">
      {users.map(user => {
        if (!user) return null; 
        return (
          <div className="admin-card" key={user._id}>
            <h3>{user.name || "No Name"}</h3>
            <p>{user.email || "No Email"}</p>

            <div className="document-preview">
              {user.documents ? (
                <img
                  src={`http://localhost:5000${user.documents.docUrl}`}
                  alt="document"
                />
              ) : (
                <p>No document uploaded</p>
              )}
            </div>

            <p>Status: {user.documents?.status || "N/A"}</p>

            {user.documents?.status === "pending" && (
              <div className="action-buttons">
                <button className="approve" onClick={() => handleAction(user._id, "approve")}>Approve</button>
                <button className="reject" onClick={() => handleAction(user._id, "reject")}>Reject</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  )}
</div>

  );
};

export default AdminDashboard;
