import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import AuthForm from "../components/AuthForm";
import { supabase } from "../lib/supabase";

export default function Register() {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        const {data, error } = await supabase.auth.signUp({
            email: correo,
            password: password,
            options: {
                data: {
                    nombre: nombre, // 👈 guardamos el nombre en metadata
                },
            },
        });
        console.log("REGISTER:", data, error);

        if (error) {
            alert(error.message);
            return;
        }

        alert("Cuenta creada!");
    };

    return (
        <AuthLayout>
            <AuthForm
                isRegister
                nombre={nombre}
                setNombre={setNombre}
                correo={correo}
                setCorreo={setCorreo}
                password={password}
                setPassword={setPassword}
                onSubmit={handleRegister}
            />
        </AuthLayout>
    );
}
