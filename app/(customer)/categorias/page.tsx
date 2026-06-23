import Link from "next/link";
import { CategoriesGrid } from "@/components/categorias/CategoriesGrid";
import { getMenuCategories, getMenuItems } from "@/lib/menu";

export default async function CategoriasPage() {
  const menuItems = await getMenuItems();
  const categories = getMenuCategories(menuItems);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-text">
          Categorias
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Escolha uma categoria para ver todos os itens do cardápio.
        </p>
      </div>

      <CategoriesGrid categories={categories} />

      <p className="mt-8 text-center text-sm text-text-muted">
        <Link href="/" className="font-semibold text-text hover:underline">
          Voltar ao cardápio
        </Link>
      </p>
    </div>
  );
}
