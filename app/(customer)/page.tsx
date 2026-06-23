import { HomeClient } from "@/components/HomeClient";
import { getMenuItems } from "@/lib/menu";

export default async function HomePage() {
  const menuItems = await getMenuItems();
  return <HomeClient menuItems={menuItems} />;
}
