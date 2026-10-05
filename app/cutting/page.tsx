"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CuttingPage() {
  const router = useRouter();

  const [orderNo, setOrderNo] = useState("");
  const [targetQty, setTargetQty] = useState("");
  const [fabricRollId, setFabricRollId] = useState("");
  const [actualFabricYds, setActualFabricYds] = useState("");
  const [message, setMessage] = useState("");

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setMessage("Creating cutting order...");

    try {
      const response = await fetch("/api/cutting-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNo,
          recipeId: 1,
          targetQty: Number(targetQty),
          fabricRollId,
          actualFabricYds: Number(actualFabricYds),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create order");
        return;
      }

      setMessage(
        `Order ${data.order.orderNo} created successfully.`
      );

      setOrderNo("");
      setTargetQty("");
      setFabricRollId("");
      setActualFabricYds("");
    } catch {
      setMessage("Something went wrong.");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold text-gray-500">
              APPARELFLOW ERP
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Cutting Supervisor
            </h1>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">
            Create Cutting Order
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Create a production batch and send it for verification.
          </p>
        </div>

        <div className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
          <form
            onSubmit={createOrder}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Order Number
              </label>

              <input
                value={orderNo}
                onChange={(event) =>
                  setOrderNo(event.target.value)
                }
                placeholder="Example: CO-003"
                className="w-full rounded-xl border p-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Target Quantity
              </label>

              <input
                type="number"
                min="1"
                value={targetQty}
                onChange={(event) =>
                  setTargetQty(event.target.value)
                }
                placeholder="100"
                className="w-full rounded-xl border p-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Fabric Roll ID
              </label>

              <input
                value={fabricRollId}
                onChange={(event) =>
                  setFabricRollId(event.target.value)
                }
                placeholder="Example: ROLL-003"
                className="w-full rounded-xl border p-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Actual Fabric Used (yards)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={actualFabricYds}
                onChange={(event) =>
                  setActualFabricYds(event.target.value)
                }
                placeholder="155"
                className="w-full rounded-xl border p-3"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-black p-3 font-semibold text-white hover:bg-gray-800"
            >
              Create Cutting Order
            </button>
          </form>

          {message && (
            <div className="mt-5 rounded-xl bg-gray-100 p-4 text-sm">
              {message}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

