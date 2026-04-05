import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Profile() {
    const { id } = useParams();
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const { data } = await supabase
            .from("users")
            .select("*")
            .eq("id", id)
            .single();

        setUser(data);
    };

    if (!user) return <p>Cargando...</p>;

    return (
        <div className="p-6">
            <img
                src={user.avatar_url || "https://via.placeholder.com/150"}
                className="w-24 h-24 rounded-full mb-4"
            />

            <h2 className="text-xl">{user.nombre}</h2>
            <p>{user.correo}</p>
        </div>
    );
}