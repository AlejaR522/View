import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
    const [users, setUsers] = useState([]);

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

    return (
        <div className="p-6">
            <h1 className="text-xl mb-4">Usuarios</h1>

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