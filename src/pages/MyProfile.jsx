import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function MyProfile() {
    const [user, setUser] = useState(null);
    const [nombre, setNombre] = useState("");
    const [file, setFile] = useState(null);

    useEffect(() => {
        getUser();
    }, []);

    const getUser = async () => {
        const { data } = await supabase.auth.getUser();

        const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single();

        setUser(userData);
        setNombre(userData.nombre);
    };

    const handleUpdate = async () => {
        let avatarUrl = user.avatar_url;

        if (file) {
            const fileName = `${user.id}.png`;

            await supabase.storage
                .from("avatars")
                .upload(fileName, file, { upsert: true });

            const { data } = supabase.storage
                .from("avatars")
                .getPublicUrl(fileName);

            avatarUrl = data.publicUrl;
        }

        await supabase
            .from("users")
            .update({
                nombre,
                avatar_url: avatarUrl
            })
            .eq("id", user.id);

        alert("Perfil actualizado 💙");
    };

    return (
        <div className="p-6">
            <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border p-2 mb-2 w-full"
            />

            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
            />

            <button
                onClick={handleUpdate}
                className="bg-black text-white px-4 py-2 mt-3"
            >
                Guardar
            </button>
        </div>
    );
}