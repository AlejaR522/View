import { supabase } from "./supabase";

export const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
};

export const isAdmin = async (userId) => {
    const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

    return data?.role === "admin";
};