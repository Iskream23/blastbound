export async function sha256(message: string): Promise<string> {
  // Encode as (utf-8) Uint8Array
  const msgBuffer = new TextEncoder().encode(message);

  // Hash the message
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    msgBuffer as BufferSource
  );

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}