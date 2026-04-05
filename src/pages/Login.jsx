import { useState, useEffect } from "react";
import AuthLayout from "../components/AuthLayout";
import AuthForm from "../components/AuthForm";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { getSession, isAdmin } from "../lib/auth";

export default function Login() {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
        const session = await getSession();

        if (session) {
            const admin = await isAdmin(session.user.id);

            if (admin) {
                navigate("/admin");
            }
            console.log("IS ADMIN:", admin);
        }
    };

        checkUser();
    }, []);

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: correo,
            password: password,
    });

    console.log("LOGIN:", data, error);
    console.log("EMAIL:", correo);
    console.log("PASSWORD:", password);

    if (error) {
        alert(error.message);
        return;
    }

    const user = data.user;

    const admin = await isAdmin(user.id);

    if (admin) {
        navigate("/admin");
        } else {
            navigate("/home"); // luego cambiaremos a /home
    }
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