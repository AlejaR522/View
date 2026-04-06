import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/auth";


export default function Admin() {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = async () => {
        const session = await getSession();
        const currentEmail = session.user.email;

        const { data, error } = await supabase
            .from("users")
            .select(`
                nombre,
                correo,
                password_hash
            `);

    if (error) console.log(error);
        else {
            const filtered = data.filter(
            user => user.correo !== currentEmail
        );

        setUsuarios(filtered);
        }
    };

    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

return (
    <div className="min-h-screen bg-black p-10">
        
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl text-white font-bold">
                Panel Admin
            </h1>

            <button
                onClick={handleLogout}
                    className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
                >
                Cerrar sesión
            </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
            {usuarios.map((user) => (
                <div key={user.id} className="border-b py-3">
                    <p className="text-black font-semibold">{user.nombre}</p>
                    <p className="text-black">{user.correo}</p>
                    <p className="text-xs text-gray-700 break-all">
                        {user.password_hash}
                    </p>
                </div>
            ))}
        </div>
    </div>
    );
}