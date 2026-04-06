import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 17L17 7m0 0H8m9 0v9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function Avatar({ name, src, size = "h-16 w-16", textSize = "text-xl" }) {
  if (src) {
    return <img alt={name || "Usuario"} className={`${size} rounded-full object-cover`} src={src} />;
  }

  return (
    <div className={`${size} ${textSize} flex items-center justify-center rounded-full bg-black font-semibold text-white`}>
      {(name || "U")[0].toUpperCase()}
    </div>
  );
}

export default function Home() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Carga en paralelo el usuario autenticado y la lista completa desde Supabase.
    const loadHomeData = async () => {
      setLoading(true);
      setErrorMessage("");

      const [{ data: authData, error: authError }, { data: usersData, error: usersError }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("users").select("id, nombre, correo, avatar_url").order("nombre", { ascending: true }),
      ]);

      if (authError || usersError) {
        setErrorMessage(authError?.message || usersError?.message || "No se pudo cargar la informacion.");
        setLoading(false);
        return;
      }

      const loggedUserId = authData.user?.id ?? null;
      const allUsers = usersData ?? [];

      setUsers(allUsers.filter((user) => user.id !== loggedUserId));
      setCurrentUser(allUsers.find((user) => user.id === loggedUserId) ?? null);
      setLoading(false);
    };

    loadHomeData();
  }, []);

  // El filtro se recalcula con el texto del buscador.
  const filteredUsers = (() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const fullName = user.nombre?.toLowerCase() ?? "";
      const email = user.correo?.toLowerCase() ?? "";
      return fullName.includes(query) || email.includes(query);
    });
  })();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f3f2ee] px-2 py-2 text-zinc-950 sm:px-4 sm:py-4 lg:px-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#ffffff_0%,transparent_36%),radial-gradient(circle_at_bottom_right,#d9d9d9_0%,transparent_30%)]" />

      <section className="relative mx-auto flex min-h-[calc(100vh-16px)] w-full max-w-[1600px] flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_40px_120px_rgba(0,0,0,0.10)] sm:min-h-[calc(100vh-32px)] sm:rounded-[40px]">
        <header className="overflow-hidden border-b border-black/10 bg-black text-white">
          <div className="flex flex-col gap-6 px-4 py-5 sm:px-8 sm:py-7 lg:px-12">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate("/me")}
                  className="group flex w-full items-center gap-4 rounded-full border border-white/15 bg-white/5 px-2 py-2 pr-4 transition hover:bg-white/10 sm:w-auto sm:pr-5"
                  title="Ir a mi perfil"
                >
                  <div className="overflow-hidden rounded-full ring-2 ring-white/15">
                    <Avatar name={currentUser?.nombre} src={currentUser?.avatar_url} size="h-12 w-12" textSize="text-base" />
                  </div>

                  <div className="min-w-0 text-left">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Mi espacio</p>
                    <p className="max-w-[180px] truncate text-sm font-medium">{currentUser?.nombre || "Perfil"}</p>
                  </div>
                </button>

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-white/50 sm:tracking-[0.4em]">Network Directory</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">Executive Contacts</h1>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-full border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 sm:w-auto"
              >
                Cerrar sesion
              </button>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/50">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre o correo..."
                  className="h-14 w-full rounded-full border border-white/10 bg-white/6 pl-14 pr-5 text-sm text-white outline-none backdrop-blur-sm transition placeholder:text-white/45 focus:border-white/30 focus:bg-white/10 sm:h-16 sm:pr-6 sm:text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <article className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Usuarios</p>
                  <p className="mt-3 text-2xl font-semibold sm:text-3xl">{users.length}</p>
                </article>

                <article className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Resultados</p>
                  <p className="mt-3 text-2xl font-semibold sm:text-3xl">{filteredUsers.length}</p>
                </article>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 px-4 py-5 sm:px-8 sm:py-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-10">
          <aside className="space-y-4">
            <article className="rounded-[28px] border border-black/10 bg-[#f7f7f5] p-5 sm:rounded-[32px] sm:p-7">
              <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Bienvenido</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-black">{currentUser?.nombre || "Usuario"}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Explora perfiles, revisa datos de contacto y entra al detalle de cada usuario desde un directorio limpio y rapido.
              </p>
            </article>

            <article className="rounded-[28px] border border-black/10 bg-black p-5 text-white sm:rounded-[32px] sm:p-7">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Enfoque</p>
              <p className="mt-4 text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                Diseño minimalista, contraste alto y una lectura clara para perfiles profesionales.
              </p>
            </article>
          </aside>

          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Directorio</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">People Overview</h2>
              </div>

              <div className="w-full rounded-full border border-black/10 bg-[#f7f7f5] px-4 py-2 text-center text-xs text-zinc-500 sm:w-auto sm:text-sm">
                Vista expandida para navegacion rapida
              </div>
            </div>

            {loading ? (
              <div className="rounded-[28px] border border-dashed border-black/15 bg-[#fafaf9] px-6 py-16 text-center text-lg font-medium text-zinc-500 sm:rounded-[32px] sm:py-20">
                Cargando usuarios...
              </div>
            ) : errorMessage ? (
              <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-medium text-red-700 sm:rounded-[32px]">
                {errorMessage}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-black/15 bg-[#fafaf9] px-6 py-16 text-center text-lg font-medium text-zinc-500 sm:rounded-[32px] sm:py-20">
                No encontramos usuarios con esa busqueda.
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                {filteredUsers.map((user, index) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="group rounded-[28px] border border-black/10 bg-white p-5 text-left shadow-[0_16px_40px_rgba(0,0,0,0.05)] transition hover:-translate-y-1.5 hover:border-black/20 hover:shadow-[0_22px_50px_rgba(0,0,0,0.09)] sm:rounded-[32px] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="overflow-hidden rounded-full ring-1 ring-black/10">
                          <Avatar name={user.nombre} src={user.avatar_url} size="h-14 w-14 sm:h-16 sm:w-16" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-400">Contacto {String(index + 1).padStart(2, "0")}</p>
                          <p className="mt-2 truncate text-lg font-semibold tracking-tight sm:text-xl">{user.nombre || "Sin nombre"}</p>
                          <p className="mt-2 truncate text-sm text-zinc-500">{user.correo || "Sin correo"}</p>
                          <p className="mt-4 text-xs uppercase tracking-[0.32em] text-zinc-300">View profile</p>
                        </div>
                      </div>

                      <div className="rounded-full border border-black/10 p-2.5 text-zinc-500 transition group-hover:border-black group-hover:text-black sm:p-3">
                        <ArrowUpRightIcon />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
