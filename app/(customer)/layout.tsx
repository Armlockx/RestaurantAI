import { CustomerShell } from "@/components/CustomerShell";
import { getMenuItems } from "@/lib/menu";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = await getMenuItems();

  return <CustomerShell menuItems={menuItems}>{children}</CustomerShell>;
}
