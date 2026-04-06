import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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

function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.862 3.487a2.25 2.25 0 113.182 3.182L8.25 18.463 4.5 19.5l1.037-3.75L16.862 3.487z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 8h3l1.5-2h7L17 8h3v10H4V8zm8 7a3 3 0 100-6 3 3 0 000 6z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
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
        const fallbackNombre =
          authUser.user_metadata?.nombre ||
          authUser.email?.split("@")[0] ||
          "Usuario";

        const { data: insertedUser, error: insertError } = await supabase
          .from("users")
          .insert([
            {
              id: authUser.id,
              nombre: fallbackNombre,
              correo: authUser.email ?? "",
              role: "user",
            },
          ])
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
      // Forzamos extensión según el tipo MIME real del archivo
      const mimeToExt = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
      };
      const extension = mimeToExt[file.type] || "jpg";
      const version = Date.now();

      // Guardamos en una carpeta con el id del usuario y un nombre distinto por subida.
      const fileName = `${user.id}/avatar-${version}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type, // <-- esto es clave para evitar el 400
        });

      if (uploadError) {
        console.error("Upload error:", uploadError); // para ver el error exacto
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

    console.log("Actualizando perfil con:", {nombre, correo, avatarUrl});

    // Guarda la version visible del perfil dentro de la tabla `users`.
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        nombre: trimmedNombre,
        correo: trimmedCorreo,
        avatar_url: avatarUrl,
      })
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
        nextMessage =
          "Tu perfil se guardo, pero el correo no se pudo sincronizar con Auth.";
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
      <main className="min-h-screen bg-[#f3f2ee] px-3 py-3">
        <div className="mx-auto max-w-[1600px] rounded-[40px] border border-black/10 bg-white p-12 text-center text-lg font-medium text-zinc-500 shadow-[0_30px_90px_rgba(0,0,0,0.08)]">
          Cargando perfil...
        </div>
      </main>
    );
  }

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
              Volver al directorio
            </button>

            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[0.38em] text-white/45">Personal Area</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">My Profile</h1>
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

        <div className="grid gap-8 px-6 py-8 sm:px-8 xl:grid-cols-[430px_minmax(0,1fr)] lg:px-12 lg:py-10">
          <aside className="space-y-5">
            <div className="relative overflow-hidden rounded-[36px] bg-black p-5 text-white">
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,#3b3b3b_0%,transparent_70%)] opacity-50" />
              <div className="relative">
                <div className="overflow-hidden rounded-[32px] bg-zinc-900">
                  {previewUrl ? (
                    <img
                      alt={nombre || "Mi avatar"}
                      className="h-[460px] w-full object-cover"
                      src={previewUrl}
                    />
                  ) : (
                    <div className="flex h-[460px] w-full items-center justify-center text-8xl font-semibold text-white">
                      {(nombre || "M")[0].toUpperCase()}
                    </div>
                  )}
                </div>

                <label className="mt-5 flex cursor-pointer items-center justify-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-4 text-sm font-semibold transition hover:bg-white/15">
                  <CameraIcon />
                  Cambiar fotografia
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <article className="rounded-[32px] border border-black/10 bg-[#f7f7f5] p-7">
              <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Guia</p>
              <p className="mt-4 text-sm leading-7 text-zinc-600">
                Aqui puedes ajustar tu identidad visual y tus datos principales. Los cambios se
                reflejan en el perfil publico y en el directorio.
              </p>
            </article>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="rounded-[36px] border border-black/10 bg-[#fbfbfa] p-7 sm:p-9">
                <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">
                  Informacion principal
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight">Profile Settings</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">
                  Mantener esta informacion actualizada hace que el resto del sistema muestre tu
                  perfil de forma consistente.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
                <article className="rounded-[30px] border border-black/10 bg-black px-5 py-6 text-white">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Estado</p>
                  <p className="mt-3 text-2xl font-semibold">{saving ? "Saving" : "Ready"}</p>
                </article>
                <article className="rounded-[30px] border border-black/10 bg-[#f7f7f5] px-5 py-6">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">Preview</p>
                  <p className="mt-3 text-2xl font-semibold text-black">{file ? "Nueva" : "Actual"}</p>
                </article>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
                  Nombre completo
                </label>
                <div className="flex items-center gap-3 rounded-[30px] border border-black/10 bg-white px-6 py-6 shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
                  <input
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none"
                    placeholder="Tu nombre"
                  />
                  <span className="rounded-full border border-black/10 p-2 text-zinc-500">
                    <EditIcon />
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
                  Correo profesional
                </label>
                <div className="flex items-center gap-3 rounded-[30px] border border-black/10 bg-white px-6 py-6 shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
                  <input
                    type="email"
                    value={correo}
                    onChange={(event) => setCorreo(event.target.value)}
                    className="w-full bg-transparent text-lg outline-none"
                    placeholder="correo@ejemplo.com"
                  />
                  <span className="rounded-full border border-black/10 p-2 text-zinc-500">
                    <EditIcon />
                  </span>
                </div>
              </div>
            </div>




            <div className="rounded-[32px] border border-black/10 bg-black px-6 py-5 text-sm leading-7 text-white/75">
            Bienvenido a tu espacio personal.
            </div>

            {message ? (
              <p
                className={`rounded-[26px] px-5 py-4 text-sm font-medium ${
                  message.includes("correctamente") || message.includes("Se guardo el perfil")
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="rounded-full bg-black px-7 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Guardando cambios..." : "Guardar cambios"}
              </button>

              <p className="text-sm text-zinc-500">
                Vista previa activa: {file ? "imagen nueva seleccionada" : "foto guardada"}
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
