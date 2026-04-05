import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between p-4 border-b">
      <h1 className="font-bold">View</h1>

      <div className="flex gap-4">
        <button onClick={() => navigate("/home")}>Inicio</button>
        <button onClick={() => navigate("/me")}>Mi perfil</button>
        <button onClick={() => navigate("/")}>Salir</button>
      </div>
    </div>
  );
}

export default Navbar;