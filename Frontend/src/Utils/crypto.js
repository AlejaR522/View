const SECRET_KEY = "clave_super_secreta_123";

// 🔒 ENCRIPTAR
export const encrypt = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET_KEY),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return JSON.stringify({
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted))
  });
};

// 🔓 DESENCRIPTAR
export const decrypt = async (encryptedText) => {
  const encoder = new TextEncoder();
  const parsed = JSON.parse(encryptedText);

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET_KEY),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const iv = new Uint8Array(parsed.iv);
  const data = new Uint8Array(parsed.data);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
};