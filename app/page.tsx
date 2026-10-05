"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("Logging in...");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "CUTTING_VERIFIER") {
        router.push("/verification");
      } else if (data.user.role === "SEWING_SUPERVISOR") {
        router.push("/sewing-queue");
      } else if (data.user.role === "CUTTING_SUPERVISOR") {
        router.push("/cutting");
      } else {
        setMessage("Unknown user role");
      }
    } catch {
      setMessage("Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-500">
            APPARELFLOW ERP
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-gray-600">
            Sign in to manage production operations.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-black p-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Sign in
          </button>
        </form>

        {message && (
          <p className="mt-5 rounded-lg bg-gray-100 p-3 text-center text-sm text-gray-700">
            {message}
          </p>
        )}

        <div className="mt-8 border-t pt-5 text-xs text-gray-500">
          <p>Demo password: Password123!</p>
        </div>
      </div>
    </main>
  );
}