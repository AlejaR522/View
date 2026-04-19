import { useState } from "react";
import { encrypt } from "../Utils/crypto";
import AuthLayout from "../components/AuthLayout";
import AuthForm from "../components/AuthForm";
import { supabase } from "../lib/supabase";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {

    // 1. crear usuario en auth (seguro 🔐)
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: password
    });

    if (error) {
      alert(error.message);
      return;
    }

    // 2. CIFRAR contraseña (para admin 👀)
    const encryptedPassword = await encrypt(password);

    // 3. guardar en tabla users
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: data.user.id,
        nombre: nombre,
        correo: correo,
        role: "user",
        password_encrypted: encryptedPassword,
        descripcion_profesional: ""
      }
    ]);

    if (insertError) {
      console.log(insertError);
      alert("Error guardando usuario");
      return;
    }

    alert("Usuario creado correctamente 💙");
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
