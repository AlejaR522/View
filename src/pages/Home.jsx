import { useEffect, useState } from "react";
import { updateUser } from "../services/userService";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await updateUser();
    setUsers(data);
  };

  return (
    <div>
      <Navbar />

      <div className="p-6">
        <input
          placeholder="Buscar usuario..."
          className="border p-2 rounded w-full mb-4"
        />

        {users.map((user) => (
          <div
            key={user.id}
            className="border p-3 rounded mb-2 cursor-pointer hover:bg-gray-100"
            onClick={() => navigate(`/profile/${user.id}`)}
          >
            {user.nombre}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;