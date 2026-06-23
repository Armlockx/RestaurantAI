import { menuItemImageUrl } from "./constants";
import type { MenuItem } from "./types";

function item(
  slug: string,
  cat: string,
  catId: string,
  nome: string,
  desc: string,
  centavos: number,
  tags: string[],
  img: string,
  ingredientes?: string,
  porcao?: string
): MenuItem {
  return {
    id: slug,
    category_id: catId,
    slug,
    nome,
    descricao: desc,
    preco_centavos: centavos,
    tags,
    ingredientes,
    porcao,
    imagem_url: menuItemImageUrl(img),
    ativo: true,
    menu_categories: { nome: cat, ordem: 0 },
  };
}

export const MENU_CATEGORIES = [
  { id: "entrada", nome: "Entrada", ordem: 1 },
  { id: "principal", nome: "Principal", ordem: 2 },
  { id: "massa", nome: "Massa", ordem: 3 },
  { id: "pizza", nome: "Pizza", ordem: 4 },
  { id: "sobremesa", nome: "Sobremesa", ordem: 5 },
  { id: "bebida", nome: "Bebida", ordem: 6 },
  { id: "extra", nome: "Extra", ordem: 7 },
];

export const FALLBACK_MENU: MenuItem[] = [
  item("bruschetta-classica", "Entrada", "entrada", "Bruschetta Clássica", "Pão rústico tostado com tomate, manjericão e azeite extravirgem.", 1890, ["vegetariano", "contém glúten"], "bruschetta.png", "Tomate italiano, alho, manjericão, azeite, sal, pimenta.", "4 un"),
  item("bolinho-de-costela", "Entrada", "entrada", "Bolinho de Costela", "Bolinho crocante recheado com costela desfiada e molho da casa.", 2650, ["carne", "frito"], "bolinho-de-costela.png", "Costela bovina, cebola, temperos, farinha, molho barbecue leve.", "6 un"),
  item("ceviche-tropical", "Entrada", "entrada", "Ceviche Tropical", "Cubos de peixe no limão com manga, cebola roxa e coentro.", 3490, ["sem glúten", "frutos do mar"], "ceviche-tropical.png", "Peixe branco, limão, manga, pimenta dedo-de-moça, coentro.", "180 g"),
  item("salada-caprese", "Entrada", "entrada", "Salada Caprese", "Mussarela fresca, tomate e pesto de manjericão.", 2900, ["vegetariano", "sem glúten"], "salada-caprese.png", "Tomate, mussarela, manjericão, azeite, redução de balsâmico.", "220 g"),
  item("parmegiana-frango", "Principal", "principal", "Parmegiana de Frango", "Filé empanado, molho de tomate, queijo gratinado e arroz.", 4490, ["contém lactose", "contém glúten"], "parmegiana-frango.png", "Frango, farinha panko, muçarela, parmesão, molho sugo.", "350 g"),
  item("risoto-funghi", "Principal", "principal", "Risoto de Funghi", "Arroz arbóreo cremoso com cogumelos e toque de vinho branco.", 5200, ["vegetariano", "contém lactose"], "risoto-funghi.png", "Arroz arbóreo, funghi, manteiga, parmesão, vinho branco.", "320 g"),
  item("hamburguer-artesanal", "Principal", "principal", "Hambúrguer Artesanal", "Blend bovino 160g, cheddar, cebola caramelizada e batatas.", 3990, ["carne", "contém glúten"], "hamburguer-artesanal.png", "Pão brioche, blend bovino, cheddar, alface, tomate, maionese.", "1 un"),
  item("salmao-grelhado", "Principal", "principal", "Salmão Grelhado", "Salmão ao ponto com legumes salteados e purê de batata.", 7490, ["sem glúten", "peixe"], "salmao-grelhado.png", "Salmão, limão siciliano, ervas, legumes, purê com manteiga.", "380 g"),
  item("nhoque-sugo", "Principal", "principal", "Nhoque ao Sugo", "Nhoque de batata com molho sugo e manjericão fresco.", 4600, ["vegetariano", "contém glúten"], "nhoque-sugo.png", "Batata, farinha, molho de tomate, parmesão opcional.", "340 g"),
  item("strogonoff-carne", "Principal", "principal", "Strogonoff de Carne", "Clássico com creme, champignon, arroz branco e batata palha.", 4990, ["carne", "contém lactose"], "strogonoff-carne.png", "Carne, creme de leite, champignon, molho de tomate, temperos.", "360 g"),
  item("bowl-vegano-proteico", "Principal", "principal", "Bowl Vegano Proteico", "Quinoa, grão-de-bico, legumes assados e molho tahine.", 4290, ["vegano", "sem glúten"], "bowl-vegano-proteico.png", "Quinoa, grão-de-bico, abobrinha, cenoura, tahine, limão.", "400 g"),
  item("spaghetti-carbonara", "Massa", "massa", "Spaghetti Carbonara", "Molho cremoso tradicional com bacon e parmesão.", 5590, ["contém glúten", "contém lactose"], "spaghetti-carbonara.png", "Spaghetti, bacon, ovos, parmesão, pimenta-do-reino.", "330 g"),
  item("penne-pesto", "Massa", "massa", "Penne ao Pesto", "Penne com pesto de manjericão e tomate-cereja confitado.", 4890, ["vegetariano", "contém glúten"], "penne-pesto.png", "Penne, manjericão, azeite, castanhas, parmesão (opcional).", "320 g"),
  item("pizza-margherita", "Pizza", "pizza", "Margherita", "Muçarela, tomate, manjericão e azeite.", 5900, ["vegetariano", "contém glúten"], "pizza-margherita.png", "Massa artesanal, muçarela, tomate, manjericão.", "30 cm"),
  item("pizza-calabresa-especial", "Pizza", "pizza", "Calabresa Especial", "Calabresa fatiada, cebola, azeitonas e orégano.", 6400, ["carne", "contém glúten"], "pizza-calabresa-especial.png", "Calabresa, cebola, muçarela, azeitona, orégano.", "30 cm"),
  item("cheesecake-frutas-vermelhas", "Sobremesa", "sobremesa", "Cheesecake de Frutas Vermelhas", "Base crocante, creme suave e calda de frutas vermelhas.", 2290, ["contém lactose", "contém glúten"], "cheesecake-frutas-vermelhas.png", "Cream cheese, biscoito, manteiga, calda de morango/amora.", "140 g"),
  item("mousse-chocolate-70", "Sobremesa", "sobremesa", "Mousse de Chocolate 70%", "Textura aerada com chocolate intenso e raspas por cima.", 1800, ["vegetariano", "contém lactose"], "mousse-chocolate-70.png", "Chocolate 70%, creme de leite, ovos, cacau.", "120 g"),
  item("frutas-da-estacao", "Sobremesa", "sobremesa", "Frutas da Estação", "Seleção de frutas frescas (varia conforme disponibilidade).", 1650, ["vegano", "sem glúten"], "frutas-da-estacao.png", "Frutas diversas: melão, uva, abacaxi, mamão (exemplo).", "250 g"),
  item("suco-natural-laranja", "Bebida", "bebida", "Suco Natural (Laranja)", "Suco feito na hora, sem açúcar (adoçante opcional).", 1290, ["sem glúten", "sem lactose"], "suco-natural-laranja.png", "Laranja fresca espremida.", "500 ml"),
  item("cha-gelado-limao", "Bebida", "bebida", "Chá Gelado (Limão)", "Chá preto gelado com limão e hortelã.", 1000, ["sem glúten"], "cha-gelado-limao.png", "Chá preto, limão, hortelã, açúcar opcional.", "400 ml"),
  item("cafe-espresso", "Bebida", "bebida", "Café Espresso", "Café curto, encorpado e aromático.", 650, ["sem glúten"], "cafe-espresso.png", "Grãos selecionados (torra média).", "60 ml"),
  item("refrigerante-lata", "Bebida", "bebida", "Refrigerante Lata", "Sabores variados (consulte disponibilidade).", 790, ["gelado"], "refrigerante-lata.png", "Cola, guaraná, limão (exemplo).", "350 ml"),
  item("batata-rustica", "Extra", "extra", "Batata Rústica", "Batatas assadas com páprica e ervas, acompanha molho.", 1990, ["vegetariano", "sem glúten"], "batata-rustica.png", "Batata, páprica, alecrim, sal, maionese da casa.", "250 g"),
];

export function formatPreco(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function menuToPromptText(items: MenuItem[], minimal = false): string {
  return items
    .filter((i) => i.ativo)
    .map((i) => {
      const cat = i.menu_categories?.nome ?? "";
      const preco = formatPreco(i.preco_centavos);
      if (minimal) return `[${cat}] ${i.nome} | ${preco}`;
      const desc =
        i.descricao.length > 56
          ? i.descricao.slice(0, 53) + "..."
          : i.descricao;
      const tags = i.tags.join(", ") || "-";
      return `[${cat}] ${i.nome} | ${preco} | ${tags} | ${desc}`;
    })
    .join("\n");
}
