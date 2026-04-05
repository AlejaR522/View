import { supabase } from "./supabase";

export const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
};

export const isAdmin = async (userId) => {
    const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
        
    console.log("USER ID:", userId);
    console.log("ADMIN QUERY:", data, error);

    return !!data;
};