import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import AuthForm from "../components/AuthForm";
import { supabase } from "../lib/supabase";
import CryptoJS from "crypto-js";

export default function Register() {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {

        // 1. crear usuario en auth
        const { data, error } = await supabase.auth.signUp({
            email: correo,
            password: password
        });

        if (error) {
            alert(error.message);
            return;
        }

        // 2. encriptar contraseña (para mostrar)
        const hashedPassword = CryptoJS.SHA256(password).toString();

        // 3. guardar en tabla users
        await supabase.from("users").insert([
            {
            id: data.user.id,
            nombre: nombre,
            correo: correo,
            role: "user",
            password_hash: hashedPassword
            }
        ]);
        };
    };
