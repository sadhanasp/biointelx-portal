// Simple demo/mock auth used for the presentation login page.
// It simulates server latency and validates minimal rules locally.
export default function mockAuth(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (typeof email === "string" && email.includes("@") && typeof password === "string" && password.length >= 4) {
        resolve({ email, name: email.split("@")[0] });
      } else {
        reject(new Error("Invalid credentials (demo). Use an email and a password of length >= 4."));
      }
    }, 700);
  });
}
