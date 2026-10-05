
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: number;
  orderNo: string;
  targetQty: number;
  fabricRollId: string;
  actualFabricYds: number;
  status: string;
  recipe: {
    name: string;
    recipeCode: string;
  };
};

export default function SewingQueuePage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function loadQueue() {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/sewing-queue", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load sewing queue");
        return;
      }

      setOrders(data.orders);

      if (data.orders.length === 0) {
        setMessage("No verified batches are ready for sewing.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
      setLoaded(true);
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
              Sewing Queue
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Verified cutting batches ready for sewing.
            </p>
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
        {!loaded && !loading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Sewing Queue
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Load verified batches ready for sewing.
            </p>

            <button
              onClick={loadQueue}
              className="mt-5 rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Load Queue
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            Loading sewing queue...
          </div>
        )}

        {loaded && !loading && orders.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              No batches ready for sewing
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Only verified cutting batches appear here.
            </p>

            <button
              onClick={loadQueue}
              className="mt-5 rounded-xl border px-5 py-3 font-medium hover:bg-gray-100"
            >
              Refresh
            </button>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <p className="text-sm text-gray-500">
                      {order.recipe.recipeCode}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900">
                      {order.orderNo}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                      {order.recipe.name}
                    </p>
                  </div>

                  <span className="h-fit rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                    VERIFIED
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Target Quantity
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {order.targetQty}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Fabric Roll
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {order.fabricRollId}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Fabric Used
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {order.actualFabricYds} yd
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center">
              <button
                onClick={loadQueue}
                className="rounded-xl border bg-white px-5 py-3 font-medium hover:bg-gray-100"
              >
                Refresh Queue
              </button>
            </div>
          </div>
        )}

        {message && (
          <p className="mt-5 text-center text-sm text-gray-500">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}

