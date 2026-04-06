import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6h16v12H4V6zm0 1l8 6 8-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Carga el usuario seleccionado segun el id que llega por la URL.
    const loadUser = async () => {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase.from("users").select("id, nombre, correo, avatar_url").eq("id", id).maybeSingle();

      if (error) {
        setErrorMessage("No se pudo cargar este perfil.");
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("Este perfil no existe o ya no esta disponible.");
        setLoading(false);
        return;
      }

      setUser(data);
      setLoading(false);
    };

    loadUser();
  }, [id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-[#f3f2ee] px-2 py-2 text-zinc-950 sm:px-4 sm:py-4 lg:px-5">
      <section className="mx-auto min-h-[calc(100vh-16px)] max-w-[1600px] overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_40px_120px_rgba(0,0,0,0.10)] sm:min-h-[calc(100vh-32px)] sm:rounded-[40px]">
        <header className="border-b border-white/10 bg-black text-white">
          <div className="flex flex-col gap-4 px-4 py-5 sm:px-8 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:px-12">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10 sm:w-auto"
              title="Volver"
            >
              <ArrowLeftIcon />
              Volver
            </button>

            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/45 sm:tracking-[0.38em]">Public Profile</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{user?.nombre || "Perfil"}</h1>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-full border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 sm:w-auto"
            >
              Cerrar sesion
            </button>
          </div>
        </header>

        <div className="px-4 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          {loading ? (
            <div className="rounded-[28px] border border-dashed border-black/15 bg-[#fafaf9] px-6 py-16 text-center text-lg font-medium text-zinc-500 sm:rounded-[32px] sm:py-20">
              Cargando usuario...
            </div>
          ) : errorMessage ? (
            <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-medium text-red-700 sm:rounded-[32px]">
              {errorMessage}
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[520px_minmax(0,1fr)] xl:gap-8">
              <aside className="space-y-5">
                <div className="overflow-hidden rounded-[28px] bg-black sm:rounded-[36px]">
                  {user?.avatar_url ? (
                    <img alt={user?.nombre || "Usuario"} className="h-[300px] w-full object-cover sm:h-[520px] xl:h-[620px]" src={user.avatar_url} />
                  ) : (
                    <div className="flex h-[300px] w-full items-center justify-center text-7xl font-semibold text-white sm:h-[520px] sm:text-8xl xl:h-[620px] xl:text-9xl">
                      {(user?.nombre || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </aside>

              <section className="flex flex-col justify-between gap-5 sm:gap-6">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px] xl:gap-5">
                  <div className="rounded-[28px] border border-black/10 bg-[#fbfbfa] p-6 sm:rounded-[36px] sm:p-10">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Executive Profile</p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-5xl">{user?.nombre || "Sin nombre"}</h2>
                    <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
                      Perfil individual dentro del directorio. Esta vista toma la informacion directamente desde la base de datos para mostrar los datos visibles del usuario.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
                    <article className="rounded-[24px] border border-black/10 bg-black px-4 py-5 text-white sm:rounded-[30px] sm:px-5 sm:py-6">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Tipo</p>
                      <p className="mt-3 text-xl font-semibold sm:text-2xl">Public</p>
                    </article>
                    <article className="rounded-[24px] border border-black/10 bg-[#f7f7f5] px-4 py-5 sm:rounded-[30px] sm:px-5 sm:py-6">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">Source</p>
                      <p className="mt-3 text-xl font-semibold text-black sm:text-2xl">DB</p>
                    </article>
                  </div>
                </div>

                <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(0,0,0,0.05)] sm:rounded-[36px] sm:p-10">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Contact Information</p>

                  <div className="mt-6 flex items-center gap-4 rounded-[24px] border border-black/10 bg-[#f7f7f5] px-5 py-5 sm:rounded-[30px] sm:px-6 sm:py-6">
                    <div className="rounded-full bg-black p-3 text-white">
                      <MailIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Correo</p>
                      <p className="truncate pt-2 text-base font-medium text-zinc-700 sm:text-lg">{user?.correo || "Sin correo"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-black px-6 py-6 text-sm leading-7 text-white/75 sm:rounded-[34px] sm:px-7 sm:py-7">
                  Diseño limpio y centrado en lectura. Si este usuario actualiza su informacion en `MyProfile`, esta vista reflejara esos cambios al volver a cargar.
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
