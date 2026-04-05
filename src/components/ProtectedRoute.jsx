import { useEffect, useState } from "react";
import { getSession } from "../lib/auth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
            getSession().then((res) => {
            setSession(res);
            setLoading(false);
        });
    }, []);

    if (loading) return <p>Cargando...</p>;

    if (!session) return <Navigate to="/" />;

    return children;
}