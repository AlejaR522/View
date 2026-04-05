import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const { data, error } = await supabase
            .from("users")
            .select("*");

        if (error) {
            console.log(error);
            return;
        }

        setUsers(data);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl">Usuarios</h1>
                <button
                    onClick={handleLogout}
                    className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
                >
                    Salir
                </button>
            </div>

            {users.map((user) => (
                <div
                    key={user.id}
                    className="border p-3 rounded mb-2"
                >
                    <img
                        src={user.avatar_url || "https://via.placeholder.com/100"}
                        className="w-16 h-16 rounded-full mb-2"
                    />

                    <p>{user.nombre}</p>
                    <p>{user.correo}</p>
                </div>
            ))}
        </div>
    );
}
