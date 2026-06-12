import { getMenuItems } from "@/lib/menu";
import { AdminMenuClient } from "@/components/admin/AdminMenuClient";

export default async function AdminMenuPage() {
  const items = await getMenuItems();
  return (
    <>
      <h1>Cardápio</h1>
      <AdminMenuClient items={items} />
    </>
  );
}
