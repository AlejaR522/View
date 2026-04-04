import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = async () => {
        const { data, error } = await supabase
            .from("users")
            .select(`
                id,
                nombre,
                correo,
                auth:auth.users(encrypted_password)
            `);

    if (error) console.log(error);
        else setUsuarios(data);
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl mb-6">Panel Admin</h1>

            <div className="border p-4">
                {usuarios.map((user) => (
                <div key={user.id} className="border-b py-2">
                    <p>{user.nombre}</p>
                    <p>{user.correo}</p>
                    <p className="text-xs">
                        {user.auth?.encrypted_password}
                    </p>
                </div>
            ))}
            </div>
        </div>
    );
}