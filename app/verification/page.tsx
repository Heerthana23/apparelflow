
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VerificationItem = {
  id: number;
  expectedQty: number;
  actualQty: number;
  status: "GREEN" | "YELLOW" | "RED";
  component: {
    componentName: string;
  };
};

type Order = {
  id: number;
  orderNo: string;
  targetQty: number;
  fabricRollId: string;
  actualFabricYds: number;
  recipe: {
    name: string;
    recipeCode: string;
  };
  verificationItems: VerificationItem[];
};

export default function VerificationPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function loadOrders() {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/cutting-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load orders");
        return;
      }

      setOrders(data.orders);

      if (data.orders.length === 0) {
        setMessage("No batches pending verification.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }

  async function updateQuantity(
    itemId: number,
    actualQty: number
  ) {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    const response = await fetch("/api/verification/items", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        itemId,
        actualQty,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Failed to update quantity");
      return;
    }

    await loadOrders();
  }

  async function approveOrder(orderId: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setMessage("Checking batch...");

    const response = await fetch("/api/verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderId,
        decision: "APPROVED",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Approval failed");
      return;
    }

    setMessage("Batch approved successfully.");
    await loadOrders();
  }

  async function rejectOrder(orderId: number) {
    const reason = window.prompt("Enter rejection reason:");

    if (!reason?.trim()) {
      setMessage("Rejection reason is required.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    const response = await fetch("/api/verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderId,
        decision: "REJECTED",
        rejectionNote: reason,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Rejection failed");
      return;
    }

    setMessage("Batch rejected successfully.");
    await loadOrders();
  }

  function getStatusClass(status: string) {
    if (status === "GREEN") {
      return "bg-green-100 text-green-700";
    }

    if (status === "YELLOW") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
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
              Cutting Verification
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Verify cutting components before approval.
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
              Verification Queue
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Load batches waiting for verification.
            </p>

            <button
              onClick={loadOrders}
              className="mt-5 rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Load Verification Queue
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            Loading verification queue...
          </div>
        )}

        {loaded && !loading && orders.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              No batches pending verification
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              New cutting orders will appear here.
            </p>

            <button
              onClick={loadOrders}
              className="mt-5 rounded-xl border px-5 py-3 font-medium hover:bg-gray-100"
            >
              Refresh
            </button>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-6">
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

                  <div className="text-sm text-gray-600">
                    <p>
                      Target:{" "}
                      <span className="font-semibold">
                        {order.targetQty}
                      </span>
                    </p>

                    <p>
                      Fabric Roll:{" "}
                      <span className="font-semibold">
                        {order.fabricRollId}
                      </span>
                    </p>

                    <p>
                      Fabric Used:{" "}
                      <span className="font-semibold">
                        {order.actualFabricYds} yd
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b text-left text-sm text-gray-500">
                        <th className="pb-3">Component</th>
                        <th className="pb-3">Expected</th>
                        <th className="pb-3">Actual</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {order.verificationItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b last:border-0"
                        >
                          <td className="py-4 font-medium">
                            {item.component.componentName}
                          </td>

                          <td className="py-4">
                            {item.expectedQty}
                          </td>

                          <td className="py-4">
                            <input
                              type="number"
                              min="0"
                              value={item.actualQty}
                              onChange={(event) =>
                                updateQuantity(
                                  item.id,
                                  Number(event.target.value)
                                )
                              }
                              className="w-28 rounded-lg border p-2"
                            />
                          </td>

                          <td className="py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => approveOrder(order.id)}
                    className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    Approve Batch
                  </button>

                  <button
                    onClick={() => rejectOrder(order.id)}
                    className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
                  >
                    Reject Batch
                  </button>
                </div>
              </div>
            ))}
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

