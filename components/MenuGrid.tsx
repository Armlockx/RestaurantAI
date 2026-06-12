"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { formatPreco } from "@/lib/menu-data";
import { useCart } from "./CartProvider";
import { showToast } from "./ToastContainer";

export function MenuGrid({ items }: { items: MenuItem[] }) {
  const { addItem } = useCart();

  return (
    <section className="cardapio-grid" aria-label="Cardápio do restaurante">
      {items.map((item) => (
        <article key={item.id} className="card-item">
          <div className="card-thumb">
            <Image
              src={item.imagem_url}
              alt={item.nome}
              width={400}
              height={225}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div className="card-body">
            <span className="card-cat">
              {item.menu_categories?.nome ?? item.category_id}
            </span>
            <h3 className="card-name">{item.nome}</h3>
            <p className="card-desc">{item.descricao}</p>
            <div className="card-tags">
              {item.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            {item.ingredientes && (
              <p className="card-ingred">{item.ingredientes}</p>
            )}
            <div className="card-footer">
              {item.porcao && <span className="card-peso">{item.porcao}</span>}
              <strong className="card-preco">
                {formatPreco(item.preco_centavos)}
              </strong>
              <button
                type="button"
                className="card-add-btn"
                onClick={() => {
                  addItem(item, 1);
                  showToast(`${item.nome} adicionado ao carrinho`);
                }}
              >
                Adicionar
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
