import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import AuthForm from "../components/AuthForm";
import { supabase } from "../lib/supabase";

export default function Login() {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email: correo,
            password: password,
    });

        if (error) alert(error.message);
            else alert("Bienvenido!");
        };

    return (
        <AuthLayout>
            <AuthForm
                correo={correo}
                setCorreo={setCorreo}
                password={password}
                setPassword={setPassword}
                onSubmit={handleLogin}
            />
        </AuthLayout>
    );
}