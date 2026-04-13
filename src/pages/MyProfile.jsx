import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.862 3.487a2.25 2.25 0 113.182 3.182L8.25 18.463 4.5 19.5l1.037-3.75L16.862 3.487z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8h3l1.5-2h7L17 8h3v10H4V8zm8 7a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const previewObjectUrlRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtiene el usuario autenticado y luego trae su fila en la tabla `users`.
    const getUser = async () => {
      setLoading(true);
      setMessage("");

      const { data: authData, error: authError } = await supabase.auth.getUser();
      const authUser = authData.user;

      if (authError || !authUser) {
        navigate("/");
        return;
      }

      // `maybeSingle()` evita el 406 cuando todavia no existe fila en `users`.
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (userError) {
        setMessage("No se pudo cargar tu perfil en este momento.");
        setLoading(false);
        return;
      }

      let resolvedUser = userData;

      // Si existe en Auth pero no en la tabla `users`, creamos la fila base.
      if (!resolvedUser) {
        const fallbackNombre = authUser.user_metadata?.nombre || authUser.email?.split("@")[0] || "Usuario";

        const { data: insertedUser, error: insertError } = await supabase
          .from("users")
          .insert([{ id: authUser.id, nombre: fallbackNombre, correo: authUser.email ?? "", role: "user" }])
          .select()
          .single();

        if (insertError) {
          setMessage("No encontramos tu perfil en la base de datos y no pudimos crearlo.");
          setLoading(false);
          return;
        }

        resolvedUser = insertedUser;
      }

      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }

      setUser(resolvedUser);
      setNombre(resolvedUser.nombre ?? "");
      setCorreo(resolvedUser.correo ?? authUser.email ?? "");
      setPreviewUrl(resolvedUser.avatar_url ?? "");
      setLoading(false);
    };

    getUser();
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  const handleUpdate = async () => {
    if (!user) {
      return;
    }

    setSaving(true);
    setMessage("");
    let avatarUrl = user.avatar_url ?? "";

    // Si eligio una imagen nueva, se sube primero al bucket de storage.
    if (file) {
      const mimeToExt = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
      const extension = mimeToExt[file.type] || "jpg";
      const version = Date.now();
      const fileName = `${user.id}/avatar-${version}.${extension}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

      if (uploadError) {
        setMessage("No se pudo subir la imagen: " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      avatarUrl = data.publicUrl;
    }

    const trimmedNombre = nombre.trim();
    const trimmedCorreo = correo.trim();

    if (!trimmedNombre || !trimmedCorreo) {
      setMessage("Nombre y correo son obligatorios.");
      setSaving(false);
      return;
    }

    // Guarda la version visible del perfil dentro de la tabla `users`.
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ nombre: trimmedNombre, correo: trimmedCorreo, avatar_url: avatarUrl })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      setMessage("No se pudo actualizar tu perfil en la base de datos.");
      setSaving(false);
      return;
    }

    let nextMessage = "Perfil actualizado correctamente.";

    // Solo intenta sincronizar Auth cuando el correo realmente cambia.
    if (trimmedCorreo !== (user.correo ?? "").trim()) {
      const { error: authUpdateError } = await supabase.auth.updateUser({
        email: trimmedCorreo,
        data: { nombre: trimmedNombre },
      });

      if (authUpdateError) {
        nextMessage = "Tu perfil se guardo, pero el correo no se pudo sincronizar con Auth.";
      }
    }

    setUser(updatedUser);
    setPreviewUrl(updatedUser.avatar_url ?? "");
    setFile(null);
    setMessage(nextMessage);
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Muestra preview local para que el usuario vea la foto antes de guardarla.
  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null;

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    setFile(nextFile);

    if (nextFile) {
      const objectUrl = URL.createObjectURL(nextFile);
      previewObjectUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
      return;
    }

    setPreviewUrl(user?.avatar_url ?? "");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f2ee] px-2 py-2 sm:px-3 md:px-4">
        <div className="mx-auto max-w-[1600px] rounded-2xl border border-black/10 bg-white p-4 text-center text-sm font-medium text-zinc-500 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:rounded-3xl sm:p-8 md:rounded-[40px] md:p-12 md:text-base">
          Cargando perfil...
        </div>
      </main>
    );
  }

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
              Volver al directorio
            </button>

            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/45 sm:text-[11px]">Personal Area</p>
              <h1 className="mt-1 text-lg font-semibold tracking-tight sm:mt-2 sm:text-xl md:text-3xl">My Profile</h1>
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

        <div className="grid gap-3 px-3 py-4 sm:gap-4 sm:px-5 sm:py-6 md:gap-5 md:px-8 md:py-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-10 lg:py-10 xl:grid-cols-[430px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="space-y-3 sm:space-y-4 md:space-y-5">
            <div className="relative overflow-hidden rounded-2xl bg-black p-3 text-white sm:rounded-3xl sm:p-4 md:rounded-4xl md:p-5">
              <div className="absolute inset-x-0 top-0 h-16 bg-[radial-gradient(circle_at_top,#3b3b3b_0%,transparent_70%)] opacity-50" />
              <div className="relative">
                <div className="overflow-hidden rounded-2xl bg-zinc-900 sm:rounded-3xl md:rounded-4xl">
                  {previewUrl ? (
                    <img alt={nombre || "Mi avatar"} className="h-64 w-full object-cover sm:h-80 md:h-96 lg:h-[440px]" src={previewUrl} />
                  ) : (
                    <div className="flex h-64 w-full items-center justify-center text-4xl font-semibold text-white sm:h-80 sm:text-5xl md:h-96 md:text-6xl lg:h-[440px] lg:text-7xl">
                      {(nombre || "M")[0].toUpperCase()}
                    </div>
                  )}
                </div>

                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-semibold transition hover:bg-white/15 sm:mt-4 sm:gap-3 sm:px-4 sm:py-3 sm:text-sm">
                  <CameraIcon />
                  Cambiar fotografía
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            <article className="rounded-2xl border border-black/10 bg-[#f7f7f5] p-3 sm:rounded-3xl sm:p-4 md:rounded-4xl md:p-5">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 sm:text-[11px]">Guía</p>
              <p className="mt-2.5 text-xs leading-5 text-zinc-600 sm:mt-3 sm:text-sm sm:leading-6 md:text-base md:leading-7">
                Aquí puedes ajustar tu identidad visual y tus datos principales. Los cambios se reflejan en el perfil público y en el directorio.
              </p>
            </article>
          </aside>

          {/* Main Content */}
          <section className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="grid gap-3 sm:gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="rounded-2xl border border-black/10 bg-[#fbfbfa] p-4 sm:rounded-3xl sm:p-5 md:rounded-4xl md:p-7">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 sm:text-[11px]">Información principal</p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight sm:mt-3 sm:text-xl md:text-2xl lg:text-3xl">Profile Settings</h2>
                <p className="mt-2.5 max-w-2xl text-xs leading-5 text-zinc-600 sm:mt-3 sm:text-sm sm:leading-6 md:text-base md:leading-7">
                  Mantener esta información actualizada hace que el resto del sistema muestre tu perfil de forma consistente.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-1">
                <article className="rounded-xl border border-black/10 bg-black px-3 py-3 text-white sm:rounded-2xl sm:px-4 sm:py-4 md:rounded-3xl md:px-5 md:py-5">
                  <p className="text-[10px] uppercase tracking-wider text-white/45 sm:text-[11px]">Estado</p>
                  <p className="mt-2 text-lg font-semibold sm:text-xl md:text-2xl">{saving ? "Saving" : "Ready"}</p>
                </article>
                <article className="rounded-xl border border-black/10 bg-[#f7f7f5] px-3 py-3 sm:rounded-2xl sm:px-4 sm:py-4 md:rounded-3xl md:px-5 md:py-5">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 sm:text-[11px]">Preview</p>
                  <p className="mt-2 text-lg font-semibold text-black sm:text-xl md:text-2xl">{file ? "Nueva" : "Actual"}</p>
                </article>
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid gap-3 sm:gap-4 md:gap-5">
              <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 sm:text-[11px]">Nombre completo</label>
                <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 shadow-[0_6px_16px_rgba(0,0,0,0.03)] sm:rounded-2xl sm:gap-3 sm:px-4 sm:py-3.5 md:rounded-3xl md:px-5 md:py-4 md:gap-3">
                  <input 
                    value={nombre} 
                    onChange={(event) => setNombre(event.target.value)} 
                    className="w-full bg-transparent text-sm font-semibold tracking-tight outline-none sm:text-base md:text-lg" 
                    placeholder="Tu nombre"
                  />
                  <span className="rounded-full border border-black/10 p-1.5 text-zinc-500 flex-shrink-0 sm:p-2 md:p-2.5"><EditIcon /></span>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 sm:text-[11px]">Correo profesional</label>
                <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 shadow-[0_6px_16px_rgba(0,0,0,0.03)] sm:rounded-2xl sm:gap-3 sm:px-4 sm:py-3.5 md:rounded-3xl md:px-5 md:py-4">
                  <input 
                    type="email" 
                    value={correo} 
                    onChange={(event) => setCorreo(event.target.value)} 
                    className="w-full bg-transparent text-xs outline-none sm:text-sm md:text-base" 
                    placeholder="correo@ejemplo.com"
                  />
                  <span className="rounded-full border border-black/10 p-1.5 text-zinc-500 flex-shrink-0 sm:p-2 md:p-2.5"><EditIcon /></span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-black px-3 py-3 text-xs leading-5 text-white/75 sm:rounded-3xl sm:px-4 sm:py-4 md:rounded-4xl md:px-5 md:py-5 md:text-sm md:leading-6">
              Bienvenido a tu espacio personal.
            </div>

            {message ? (
              <p
                className={`rounded-xl px-3 py-2.5 text-xs font-medium sm:rounded-2xl sm:px-4 sm:py-3 md:rounded-3xl md:px-5 md:py-4 md:text-sm ${
                  message.includes("correctamente") || message.includes("Se guardo el perfil")
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </p>
            ) : null}

            <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-4 sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="w-full rounded-full bg-black px-4 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-5 sm:py-3 md:px-7 md:py-4 md:text-sm"
              >
                {saving ? "Guardando cambios..." : "Guardar cambios"}
              </button>

              <p className="text-xs text-zinc-500 sm:text-sm">Vista previa activa: {file ? "imagen nueva seleccionada" : "foto guardada"}</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
