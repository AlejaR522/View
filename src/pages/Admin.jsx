import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/auth";

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export default function Admin() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = async () => {
        setLoading(true);
        const session = await getSession();
        const currentEmail = session.user.email;

        const { data, error } = await supabase
            .from("users")
            .select(`
                id,
                nombre,
                correo,
                password_hash
            `);

        if (error) {
            console.log(error);
        } else {
            const filtered = data.filter(
                user => user.correo !== currentEmail
            );
            setUsuarios(filtered);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    return (
        <main className="min-h-screen bg-[#f3f2ee] px-2 py-2 text-zinc-950 sm:px-3 md:px-4 lg:px-5">
            <section className="mx-auto min-h-[calc(100vh-16px)] max-w-[1600px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:min-h-[calc(100vh-24px)] sm:rounded-3xl md:rounded-[40px] md:shadow-[0_40px_120px_rgba(0,0,0,0.10)]">
                {/* Header */}
                <header className="border-b border-black/10 bg-black text-white">
                    <div className="flex flex-col gap-3 px-3 py-4 sm:gap-4 sm:px-5 sm:py-5 md:gap-4 md:px-8 md:py-7 lg:flex-row lg:items-center lg:justify-between lg:px-12">
                        <button
                            type="button"
                            onClick={() => navigate("/home")}
                            className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-medium transition hover:bg-white/10 sm:px-4 sm:py-3 sm:text-sm"
                            title="Volver"
                        >
                            <ArrowLeftIcon />
                            Volver
                        </button>

                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-widest text-white/45 sm:text-[11px]">Control Panel</p>
                            <h1 className="mt-1 text-lg font-semibold tracking-tight sm:mt-2 sm:text-xl md:text-3xl">Panel Admin</h1>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="rounded-full border border-white/15 bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 sm:px-5 sm:py-3 md:text-sm"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8 lg:px-12">
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 sm:text-[11px]">Directorio</p>
                        <h2 className="mt-1.5 text-lg font-semibold tracking-tight sm:mt-2 sm:text-xl md:text-2xl">Usuarios del Sistema</h2>
                    </div>

                    {loading ? (
                        <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf9] px-4 py-12 text-center text-sm font-medium text-zinc-500 sm:rounded-3xl sm:px-5 sm:py-16 md:rounded-3xl md:px-6 md:py-20">
                            Cargando usuarios...
                        </div>
                    ) : usuarios.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf9] px-4 py-12 text-center text-sm font-medium text-zinc-500 sm:rounded-3xl sm:px-5 sm:py-16 md:rounded-3xl md:px-6 md:py-20">
                            No hay usuarios registrados
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="gap-3 space-y-3 sm:gap-4 sm:space-y-4">
                                {usuarios.map((user, index) => (
                                    <div
                                        key={user.id}
                                        className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition hover:border-black/20 sm:rounded-3xl sm:p-5 md:rounded-4xl md:p-6"
                                    >
                                        <div className="space-y-2.5 sm:space-y-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 sm:text-[11px]">Usuario {String(index + 1).padStart(2, "0")}</p>
                                                <p className="mt-1 truncate text-sm font-semibold tracking-tight sm:text-base md:text-lg">{user.nombre || "Sin nombre"}</p>
                                            </div>

                                            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                                                <div className="rounded-lg border border-black/10 bg-[#f7f7f5] p-2.5 sm:rounded-xl sm:p-3">
                                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Correo</p>
                                                    <p className="mt-0.5 truncate text-xs font-medium text-zinc-700 sm:mt-1 sm:text-sm">{user.correo || "Sin correo"}</p>
                                                </div>

                                                <div className="rounded-lg border border-black/10 bg-[#f7f7f5] p-2.5 sm:rounded-xl sm:p-3 md:col-span-2">
                                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Hash Contraseña</p>
                                                    <p className="mt-0.5 truncate font-mono text-[10px] text-zinc-700 sm:mt-1 sm:text-xs">{user.password_hash || "Sin hash"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 rounded-2xl bg-black px-4 py-4 text-xs leading-5 text-white/75 sm:rounded-3xl sm:px-5 sm:py-5 md:rounded-4xl md:px-6 md:py-6 md:text-sm md:leading-6">
                                Total de usuarios: <span className="font-semibold text-white">{usuarios.length}</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}