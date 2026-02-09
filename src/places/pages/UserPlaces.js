import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaceList from "../components/PlaceList";
import { api } from "../../util/api";

const UserPlaces = () => {
  const { userId } = useParams();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/places/user/${userId}`);
        const data = res.data.places || [];
        const mapped = data.map((p) => ({
          id: p._id || p.id,
          title: p.title,
          description: p.description,
          address: p.address,
          location: p.location,
          creator: p.creator,
          imageUrl:
            "https://images.ctfassets.net/1aemqu6a6t65/6iCC1vCYS1Br0sfIVbVBAH/13cc013e2e3f76bb247452bcfa4eb6d6/empire-state-building-observatory-ctc-7009-3000x2000?w=1200&h=800&q=75",
        }));
        setPlaces(mapped);
      } catch (e) {
        setError("Failed to load places");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (loading) return <p className="center">Loading places...</p>;
  if (error) return <p className="center">{error}</p>;
  return <PlaceList items={places} />;
};

export default UserPlaces;
