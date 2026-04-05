export const updateUser = async (id, updates) => {
  const { data } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) throw error;
  return data;
};