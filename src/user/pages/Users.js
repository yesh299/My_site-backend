import React, { useEffect, useState } from "react";
import UsersList from "../components/UsersList";
import { api } from "../../util/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/users");
        const mapped = (res.data.users || []).map((u) => ({
          id: u._id || u.id,
          name: u.name,
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvK7AlHpiykQ5oe7TK1w1W-UFe5VC9UjOqCQ&s",
          places: 0,
        }));
        setUsers(mapped);
      } catch (e) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="center">Loading users...</p>;
  if (error) return <p className="center">{error}</p>;
  return <UsersList items={users} />;
};

export default Users;
