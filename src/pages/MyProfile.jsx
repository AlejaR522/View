import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { updateUser } from "../services/userService";

function MyProfile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    updateUser();
  }, []);

  const updateUser = async () => {
    // const { data } = await supabase.auth.updateUser();
    const user = {
        id:"123",
        user_metadata: {
            nombre: "Juan Pérez"
        },
        email: "juan.perez@example.com"
    }
    setUser(data.user);
    setName(data.user.user_metadata?.nombre || "");
  };

  const handleUpdate = async () => {
    await updateUser(user.id, { 
        nombre: name,
        correo: email
     });
    alert("Actualizado 💙");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Mi perfil</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <button
        onClick={handleUpdate}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Guardar
      </button>
    </div>
  );
}

export default MyProfile;