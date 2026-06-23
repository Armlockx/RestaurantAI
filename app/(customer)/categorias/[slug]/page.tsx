import { notFound } from "next/navigation";
import { CategoryDetailClient } from "@/components/categorias/CategoryDetailClient";
import {
  getMenuCategoryBySlug,
  getMenuItems,
  getMenuItemsByCategory,
} from "@/lib/menu";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const menuItems = await getMenuItems();
  const category = getMenuCategoryBySlug(menuItems, slug);

  if (!category) notFound();

  const items = getMenuItemsByCategory(menuItems, category.id);

  return <CategoryDetailClient category={category} items={items} />;
}
