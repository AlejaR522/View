import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { updateUser } from "../services/userService";

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await updateUser(id);
    setUser(data);
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <div>
      <img src={user.avatar_url} alt="" width="100" />
      <h2>{user.nombre}</h2>
      <p>{user.correo}</p>
    </div>
  );
}

export default Profile;