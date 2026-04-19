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

      const { data, error } = await supabase
        .from("users")
        .select("id, nombre, correo, avatar_url, descripcion_profesional")
        .eq("id", id)
        .maybeSingle();

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
    <main className="min-h-screen bg-[#f3f2ee] px-2 py-2 text-zinc-950 sm:px-3 md:px-4 lg:px-5">
      <section className="mx-auto min-h-[calc(100vh-16px)] max-w-[1600px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:min-h-[calc(100vh-24px)] sm:rounded-3xl md:rounded-[40px] md:shadow-[0_40px_120px_rgba(0,0,0,0.10)]">
        <header className="border-b border-white/10 bg-black text-white">
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
              <p className="text-[10px] uppercase tracking-widest text-white/45 sm:text-[11px]">Public Profile</p>
              <h1 className="mt-1 truncate text-lg font-semibold tracking-tight sm:mt-2 sm:text-xl md:text-3xl">{user?.nombre || "Perfil"}</h1>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-white/15 bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 sm:px-5 sm:py-3 md:text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf9] px-4 py-12 text-center text-sm font-medium text-zinc-500 sm:rounded-3xl sm:px-5 sm:py-16 md:rounded-3xl md:px-6 md:py-20">
              Cargando usuario...
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-xs font-medium text-red-700 sm:rounded-3xl sm:px-5 sm:py-10 md:px-6">
              {errorMessage}
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 md:gap-6 lg:grid-cols-[480px_minmax(0,1fr)] xl:grid-cols-[520px_minmax(0,1fr)] lg:gap-6 xl:gap-8">
              <aside className="space-y-3 sm:space-y-4 md:space-y-5">
                <div className="overflow-hidden rounded-2xl bg-black sm:rounded-3xl md:rounded-4xl">
                  {user?.avatar_url ? (
                    <img alt={user?.nombre || "Usuario"} className="h-80 w-full object-cover sm:h-96 md:h-[480px] lg:h-[520px] xl:h-[620px]" src={user.avatar_url} />
                  ) : (
                    <div className="flex h-80 w-full items-center justify-center text-5xl font-semibold text-white sm:h-96 sm:text-6xl md:h-[480px] md:text-7xl lg:h-[520px] lg:text-8xl xl:h-[620px] xl:text-9xl">
                      {(user?.nombre || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </aside>

              <section className="flex flex-col justify-between gap-4 sm:gap-5 md:gap-6">
                <div className="grid gap-3 sm:gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="rounded-2xl border border-black/10 bg-[#fbfbfa] p-4 sm:rounded-3xl sm:p-6 md:rounded-4xl md:p-8">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 sm:text-[11px]">Executive Profile</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-black sm:mt-3 sm:text-2xl md:text-3xl lg:text-4xl">{user?.nombre || "Sin nombre"}</h2>
                    <p className="mt-3 max-w-3xl text-xs leading-5 text-zinc-600 sm:mt-4 sm:text-sm sm:leading-6 md:text-base md:leading-7">
                      Perfil individual dentro del directorio. Esta vista toma la información directamente desde la base de datos para mostrar los datos visibles del usuario.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-1">
                    <article className="rounded-xl border border-black/10 bg-black px-3 py-3 text-white sm:rounded-2xl sm:px-4 sm:py-4 md:rounded-3xl md:px-5 md:py-5">
                      <p className="text-[10px] uppercase tracking-wider text-white/45 sm:text-[11px]">Tipo</p>
                      <p className="mt-2 text-lg font-semibold sm:text-xl md:text-2xl">Public</p>
                    </article>
                    <article className="rounded-xl border border-black/10 bg-[#f7f7f5] px-3 py-3 sm:rounded-2xl sm:px-4 sm:py-4 md:rounded-3xl md:px-5 md:py-5">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 sm:text-[11px]">Source</p>
                      <p className="mt-2 text-lg font-semibold text-black sm:text-xl md:text-2xl">DB</p>
                    </article>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_8px_20px_rgba(0,0,0,0.04)] sm:rounded-3xl sm:p-6 md:rounded-4xl md:p-8">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 sm:text-[11px]">Contact Information</p>

                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-black/10 bg-[#f7f7f5] px-3 py-3 sm:mt-5 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4 md:rounded-3xl md:px-6 md:py-5">
                    <div className="rounded-full bg-black p-2 text-white flex-shrink-0 sm:p-2.5 md:p-3">
                      <MailIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 sm:text-xs">Correo</p>
                      <p className="truncate pt-1 text-xs font-medium text-zinc-700 sm:pt-1.5 sm:text-sm md:text-base">{user?.correo || "Sin correo"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-[#f7f7f5] p-4 sm:rounded-3xl sm:p-6 md:rounded-4xl md:p-8">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 sm:text-[11px]">Professional Summary</p>
                  <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-zinc-700 sm:text-sm sm:leading-7 md:text-base">
                    {user?.descripcion_profesional || "Este usuario aun no ha agregado una descripcion profesional."}
                  </p>
                </div>

                <div className="rounded-2xl bg-black px-4 py-4 text-xs leading-5 text-white/75 sm:rounded-3xl sm:px-5 sm:py-5 md:rounded-4xl md:px-6 md:py-6 md:text-sm md:leading-6">
                  Diseño limpio y centrado en lectura. Si este usuario actualiza su información en Mi Perfil, esta vista reflejará esos cambios al volver a cargar.
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
