const CARRINHO_BLOCK_RE = /\[CARRINHO\]\s*([\s\S]*?)\s*\[\/CARRINHO\]/gi;

export interface ParsedCartResponse {
  text: string;
  actions: Record<string, unknown>[];
}

export function parseCartBlocks(text: string): ParsedCartResponse {
  const actions: Record<string, unknown>[] = [];
  const cleaned = (text || "").replace(CARRINHO_BLOCK_RE, (_, jsonStr: string) => {
    try {
      actions.push(JSON.parse(jsonStr.trim()) as Record<string, unknown>);
    } catch {
      /* ignore invalid JSON */
    }
    return "";
  });
  return { text: cleaned.trim(), actions };
}

export const CART_INSTRUCTIONS = `
PEDIDOS E CARRINHO:
- Quando o usuário quiser fazer pedido, adicionar/remover itens, ver carrinho ou finalizar, ajude normalmente na mensagem visível.
- Se executar uma ação no carrinho, inclua NO FINAL da resposta (será removido automaticamente) um bloco:

[CARRINHO]
{"acao":"adicionar","itens":[{"nome":"Nome exato do cardápio","quantidade":1}]}
[/CARRINHO]

Ações: "adicionar", "remover", "limpar", "abrir_carrinho", "checkout".
- Use nomes EXATOS do cardápio no campo "nome".
- "checkout" abre o checkout quando o usuário quiser finalizar o pedido.
- Se o item não existir, explique e NÃO inclua bloco [CARRINHO].
- Para múltiplos itens, inclua todos no array "itens".`;

export function buildSystemPrompt(menuText: string, minimal = false): string {
  const base = minimal
    ? "Você é o assistente do cardápio. Use APENAS os itens abaixo (não invente pratos). Responda em português, de forma concisa."
    : "Você é um assistente que responde dúvidas sobre o cardápio do restaurante e ajuda o cliente a montar pedidos. Use APENAS as informações do cardápio abaixo. Responda em português, de forma objetiva e amigável. Seja conciso. Se a informação não estiver no cardápio, diga que não tem essa informação.";

  return `${base}
${CART_INSTRUCTIONS}

CARDÁPIO${minimal ? " (itens e preços)" : ""}:
${menuText}`;
}

export function normalizeNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function findMenuItemByName<
  T extends { nome: string; slug: string; id: string },
>(items: T[], nome: string): T | null {
  const alvo = normalizeNome(nome);
  if (!alvo) return null;

  for (const item of items) {
    if (normalizeNome(item.nome) === alvo) return item;
  }

  let best: T | null = null;
  let bestScore = 0;
  for (const item of items) {
    const n = normalizeNome(item.nome);
    if (n.includes(alvo) || alvo.includes(n)) {
      const score = Math.min(n.length, alvo.length);
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
  }
  return best;
}
