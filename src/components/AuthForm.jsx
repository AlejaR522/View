import Input from "./Input";
import Button from "./Button";

export default function AuthForm({
    isRegister,
    nombre,
    setNombre,
    correo,
    setCorreo,
    password,
    setPassword,
    onSubmit,
}) {
    return (
        <div className="w-80 space-y-4">

            {isRegister && (
            <Input
                placeholder="Nombre"
                onChange={(e) => setNombre(e.target.value)}
            />
            )}

            <Input
                placeholder="Correo"
                onChange={(e) => setCorreo(e.target.value)}
            />

            <Input
                type="password"
                placeholder="Contraseña"
                onChange={(e) => setPassword(e.target.value)}
            />

            <Button
                text={isRegister ? "Crear cuenta" : "Iniciar sesión"}
                onClick={onSubmit}
            />

        </div>
    );
}