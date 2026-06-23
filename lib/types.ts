export type UserRole = "customer" | "staff" | "admin";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export interface MenuItem {
  id: string;
  category_id: string;
  slug: string;
  nome: string;
  descricao: string;
  preco_centavos: number;
  tags: string[];
  ingredientes?: string;
  porcao?: string;
  imagem_url: string;
  ativo: boolean;
  menu_categories?: { nome: string; ordem: number };
}

export interface MenuCategory {
  id: string;
  nome: string;
  ordem: number;
  count: number;
}

export interface CartItem {
  id: string;
  menu_item_id: string;
  nome: string;
  preco_centavos: number;
  quantidade: number;
}

export interface CartAction {
  acao: string;
  itens?: { nome: string; quantidade?: number }[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  guest_session_id: string | null;
  status: OrderStatus;
  cliente_nome: string;
  cliente_telefone: string;
  entrega_tipo: string;
  endereco: string | null;
  pagamento: string;
  observacoes: string | null;
  total_centavos: number;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  nome_snapshot: string;
  preco_snapshot_centavos: number;
  quantidade: number;
}

export interface Conversation {
  id: string;
  user_id: string | null;
  guest_session_id: string | null;
  started_at: string;
}

export interface Profile {
  id: string;
  nome: string | null;
  telefone: string | null;
  role: UserRole;
}
