import type { LucideIcon } from "lucide-react";
import {
  CakeSlice,
  CupSoda,
  LayoutGrid,
  Pizza,
  Salad,
  Soup,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  entrada: Salad,
  principal: Utensils,
  massa: Soup,
  pizza: Pizza,
  sobremesa: CakeSlice,
  bebida: CupSoda,
  extra: UtensilsCrossed,
};

export function getCategoryIcon(categoryId: string): LucideIcon {
  return CATEGORY_ICONS[categoryId] ?? LayoutGrid;
}
