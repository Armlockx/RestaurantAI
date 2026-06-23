import { getAllOrders } from "@/lib/orders";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  return (
    <>
      <h1 className="mb-4 text-xl font-extrabold tracking-tight text-text">Pedidos</h1>
      <AdminOrdersClient initialOrders={orders} />
    </>
  );
}
