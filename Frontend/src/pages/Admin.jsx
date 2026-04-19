import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { decrypt } from "../Utils/crypto";
import { Api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { getSession } from "../lib/auth";

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3v11m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function splitText(doc, label, value, maxWidth) {
  const safeValue = value?.trim() || "Sin informacion";
  return doc.splitTextToSize(`${label}: ${safeValue}`, maxWidth);
}

export default function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [downloadingPdf, setDownloadingPdf] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    setLoading(true);

    const session = await getSession();
    const currentEmail = session.user.email;

    const { data, error } = await Api
      .from("users")
      .select("id, nombre, correo, role, avatar_url, password_encrypted, descripcion_profesional");

    if (error) {
      console.log(error);
    } else {
      const filtered = data.filter((user) => user.correo !== currentEmail);
      setUsuarios(filtered);
    }

    setLoading(false);
  };

  const handleDecrypt = async (user) => {
    try {
      if (!user.password_encrypted) return;

      const decrypted = await decrypt(user.password_encrypted);

      setVisiblePasswords((prev) => ({
        ...prev,
        [user.id]: decrypted,
      }));
    } catch (error) {
      console.log("Error desencriptando:", error);
    }
  };

  const handleGeneratePdf = async (user) => {
    setDownloadingPdf((prev) => ({ ...prev, [user.id]: true }));

    try {
      const doc = new jsPDF({
        unit: "mm",
        format: "a4",
      });

      const marginX = 18;
      let currentY = 24;
      const lineWidth = 174;

      doc.setFillColor(0, 0, 0);
      doc.roundedRect(12, 12, 186, 38, 6, 6, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Reporte de Usuario", marginX, 28);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleString("es-CO")}`, marginX, 36);

      currentY = 62;
      doc.setTextColor(20, 20, 20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(user.nombre || "Sin nombre", marginX, currentY);

      currentY += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const profileLines = [
        ...splitText(doc, "Correo", user.correo, lineWidth),
        ...splitText(doc, "Rol", user.role, lineWidth),
        ...splitText(doc, "Avatar URL", user.avatar_url, lineWidth),
        ...splitText(doc, "Descripcion profesional", user.descripcion_profesional, lineWidth),
      ];

      doc.text(profileLines, marginX, currentY);

      currentY += profileLines.length * 6 + 6;
      doc.setDrawColor(220, 220, 220);
      doc.line(marginX, currentY, 192, currentY);

      currentY += 12;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("Documento generado desde el panel administrador.", marginX, currentY);

      const fileSafeName = (user.nombre || "usuario").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_");
      doc.save(`reporte_${fileSafeName || "usuario"}.pdf`);
    } finally {
      setDownloadingPdf((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const handleLogout = async () => {
    await Api.auth.signOut();
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-[#f3f2ee] px-2 py-2 text-zinc-950 sm:px-3 md:px-4 lg:px-5">
      <section className="mx-auto min-h-[calc(100vh-16px)] max-w-[1600px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:min-h-[calc(100vh-24px)] sm:rounded-3xl md:rounded-[40px]">
        <header className="border-b border-black/10 bg-black text-white">
          <div className="flex flex-col gap-3 px-3 py-4 sm:gap-4 sm:px-5 sm:py-5 md:gap-4 md:px-8 md:py-7 lg:flex-row lg:items-center lg:justify-between lg:px-12">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-medium transition hover:bg-white/10 sm:px-4 sm:py-3 sm:text-sm"
            >
              <ArrowLeftIcon /> Volver
            </button>

            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/45 sm:text-[11px]">Control Panel</p>
              <h1 className="mt-1 text-lg font-semibold tracking-tight sm:mt-2 sm:text-xl md:text-3xl">Panel Admin</h1>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full border border-white/15 bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 sm:px-5 sm:py-3 md:text-sm"
            >
              Cerrar sesion
            </button>
          </div>
        </header>

        <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8 lg:px-12">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 sm:text-[11px]">Directorio</p>
            <h2 className="mt-1.5 text-lg font-semibold tracking-tight sm:mt-2 sm:text-xl md:text-2xl">Usuarios del Sistema</h2>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf9] px-4 py-12 text-center text-sm font-medium text-zinc-500 sm:rounded-3xl sm:px-5 sm:py-16">
              Cargando usuarios...
            </div>
          ) : usuarios.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/15 bg-[#fafaf9] px-4 py-12 text-center text-sm font-medium text-zinc-500 sm:rounded-3xl sm:px-5 sm:py-16">
              No hay usuarios registrados
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {usuarios.map((user, index) => (
                <div key={user.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition hover:border-black/20 sm:rounded-3xl sm:p-5 md:p-6">
                  <div className="space-y-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 sm:text-[11px]">Usuario {String(index + 1).padStart(2, "0")}</p>
                        <p className="mt-1 text-sm font-semibold tracking-tight sm:text-base md:text-lg">{user.nombre || "Sin nombre"}</p>
                      </div>

                      <button
                        onClick={() => handleGeneratePdf(user)}
                        disabled={downloadingPdf[user.id]}
                        className="flex items-center justify-center gap-2 rounded-full border border-black/10 bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-4 sm:text-sm"
                      >
                        <DownloadIcon />
                        {downloadingPdf[user.id] ? "Generando..." : "Generar PDF"}
                      </button>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-lg border border-black/10 bg-[#f7f7f5] p-2.5 sm:rounded-xl sm:p-3">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Correo</p>
                        <p className="mt-0.5 truncate text-xs font-medium text-zinc-700 sm:text-sm">{user.correo || "Sin correo"}</p>
                      </div>

                      <div className="rounded-lg border border-black/10 bg-[#f7f7f5] p-2.5 sm:rounded-xl sm:p-3">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Rol</p>
                        <p className="mt-0.5 truncate text-xs font-medium text-zinc-700 sm:text-sm">{user.role || "Sin rol"}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-black/10 bg-[#f7f7f5] p-2.5 sm:rounded-xl sm:p-3">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">Descripcion profesional</p>
                      <p className="mt-1 whitespace-pre-wrap text-xs leading-6 text-zinc-700 sm:text-sm">
                        {user.descripcion_profesional || "Este usuario aun no ha agregado una descripcion profesional."}
                      </p>
                    </div>

                    <div className="rounded-lg border border-black/10 bg-[#f7f7f5] p-2.5 sm:rounded-xl sm:p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Contrasena</p>
                          <p className="mt-0.5 truncate text-xs font-mono text-zinc-700 sm:text-sm">
                            {visiblePasswords[user.id] ? visiblePasswords[user.id] : user.password_encrypted ? "•".repeat(20) : "Sin contrasena"}
                          </p>
                        </div>

                        {!visiblePasswords[user.id] && user.password_encrypted && (
                          <button
                            onClick={() => handleDecrypt(user)}
                            className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-black px-2.5 py-1.5 text-white transition hover:bg-zinc-800 sm:px-3 sm:py-2"
                            title="Desencriptar contrasena"
                          >
                            <EyeIcon />
                            <span className="text-[10px] sm:text-xs">Ver</span>
                          </button>
                        )}

                        {visiblePasswords[user.id] && (
                          <button
                            onClick={() =>
                              setVisiblePasswords((prev) => {
                                const newState = { ...prev };
                                delete newState[user.id];
                                return newState;
                              })
                            }
                            className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-zinc-100 px-2.5 py-1.5 text-black transition hover:bg-zinc-200 sm:px-3 sm:py-2"
                            title="Ocultar contrasena"
                          >
                            <EyeIcon />
                            <span className="text-[10px] sm:text-xs">Ocultar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
