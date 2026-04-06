import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6h16v12H4V6zm0 1l8 6 8-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
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
        .select("id, nombre, correo, avatar_url")
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
    <main className="min-h-screen bg-[#f3f2ee] px-3 py-3 text-zinc-950 sm:px-4 lg:px-5">
      <section className="mx-auto min-h-[calc(100vh-24px)] max-w-[1600px] overflow-hidden rounded-[40px] border border-black/10 bg-white shadow-[0_40px_120px_rgba(0,0,0,0.10)]">
        <header className="border-b border-white/10 bg-black text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-7 sm:px-8 lg:px-12">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
              title="Volver"
            >
              <ArrowLeftIcon />
              Volver
            </button>

            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[0.38em] text-white/45">
                Public Profile
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {user?.nombre || "Perfil"}
              </h1>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200"
            >
              Cerrar sesion
            </button>
          </div>
        </header>

        <div className="px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
          {loading ? (
            <div className="rounded-[32px] border border-dashed border-black/15 bg-[#fafaf9] px-6 py-20 text-center text-lg font-medium text-zinc-500">
              Cargando usuario...
            </div>
          ) : errorMessage ? (
            <div className="rounded-[32px] border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : (
            <div className="grid gap-8 xl:grid-cols-[520px_minmax(0,1fr)]">
              <aside className="space-y-5">
                <div className="overflow-hidden rounded-[36px] bg-black">
                  {user?.avatar_url ? (
                    <img
                      alt={user?.nombre || "Usuario"}
                      className="h-[620px] w-full object-cover"
                      src={user.avatar_url}
                    />
                  ) : (
                    <div className="flex h-[620px] w-full items-center justify-center text-9xl font-semibold text-white">
                      {(user?.nombre || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </aside>

              <section className="flex flex-col justify-between gap-6">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="rounded-[36px] border border-black/10 bg-[#fbfbfa] p-8 sm:p-10">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">
                      Executive Profile
                    </p>
                    <h2 className="mt-4 text-5xl font-semibold tracking-tight text-black">
                      {user?.nombre || "Sin nombre"}
                    </h2>
                    <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-600">
                      Perfil individual dentro del directorio. Esta vista toma la informacion
                      directamente desde la base de datos para mostrar los datos visibles del usuario.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
                    <article className="rounded-[30px] border border-black/10 bg-black px-5 py-6 text-white">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Tipo</p>
                      <p className="mt-3 text-2xl font-semibold">Public</p>
                    </article>
                    <article className="rounded-[30px] border border-black/10 bg-[#f7f7f5] px-5 py-6">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">Source</p>
                      <p className="mt-3 text-2xl font-semibold text-black">DB</p>
                    </article>
                  </div>
                </div>

                <div className="rounded-[36px] border border-black/10 bg-white p-8 shadow-[0_16px_40px_rgba(0,0,0,0.05)] sm:p-10">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">
                    Contact Information
                  </p>

                  <div className="mt-6 flex items-center gap-4 rounded-[30px] border border-black/10 bg-[#f7f7f5] px-6 py-6">
                    <div className="rounded-full bg-black p-3 text-white">
                      <MailIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Correo</p>
                      <p className="truncate pt-2 text-lg font-medium text-zinc-700">
                        {user?.correo || "Sin correo"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[34px] bg-black px-7 py-7 text-sm leading-7 text-white/75">
                  Diseno limpio y centrado en lectura. Si este usuario actualiza su informacion en
                  `MyProfile`, esta vista reflejara esos cambios al volver a cargar.
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
