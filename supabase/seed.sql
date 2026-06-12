-- Seed menu from legacy HTML cardápio

insert into public.menu_categories (id, nome, ordem) values
  ('entrada', 'Entrada', 1),
  ('principal', 'Principal', 2),
  ('massa', 'Massa', 3),
  ('pizza', 'Pizza', 4),
  ('sobremesa', 'Sobremesa', 5),
  ('bebida', 'Bebida', 6),
  ('extra', 'Extra', 7)
on conflict (id) do nothing;

insert into public.menu_items (id, category_id, slug, nome, descricao, ingredientes, porcao, preco_centavos, tags, imagem_url) values
  ('bruschetta-classica', 'entrada', 'bruschetta-classica', 'Bruschetta Clássica', 'Pão rústico tostado com tomate, manjericão e azeite extravirgem.', 'Tomate italiano, alho, manjericão, azeite, sal, pimenta.', '4 un', 1890, '["vegetariano","contém glúten"]', '/img/itens/bruschetta.png'),
  ('bolinho-de-costela', 'entrada', 'bolinho-de-costela', 'Bolinho de Costela', 'Bolinho crocante recheado com costela desfiada e molho da casa.', 'Costela bovina, cebola, temperos, farinha, molho barbecue leve.', '6 un', 2650, '["carne","frito"]', '/img/itens/bolinho-de-costela.png'),
  ('ceviche-tropical', 'entrada', 'ceviche-tropical', 'Ceviche Tropical', 'Cubos de peixe no limão com manga, cebola roxa e coentro.', 'Peixe branco, limão, manga, pimenta dedo-de-moça, coentro.', '180 g', 3490, '["sem glúten","frutos do mar"]', '/img/itens/ceviche-tropical.png'),
  ('salada-caprese', 'entrada', 'salada-caprese', 'Salada Caprese', 'Mussarela fresca, tomate e pesto de manjericão.', 'Tomate, mussarela, manjericão, azeite, redução de balsâmico.', '220 g', 2900, '["vegetariano","sem glúten"]', '/img/itens/salada-caprese.png'),
  ('parmegiana-frango', 'principal', 'parmegiana-frango', 'Parmegiana de Frango', 'Filé empanado, molho de tomate, queijo gratinado e arroz.', 'Frango, farinha panko, muçarela, parmesão, molho sugo.', '350 g', 4490, '["contém lactose","contém glúten"]', '/img/itens/parmegiana-frango.png'),
  ('risoto-funghi', 'principal', 'risoto-funghi', 'Risoto de Funghi', 'Arroz arbóreo cremoso com cogumelos e toque de vinho branco.', 'Arroz arbóreo, funghi, manteiga, parmesão, vinho branco.', '320 g', 5200, '["vegetariano","contém lactose"]', '/img/itens/risoto-funghi.png'),
  ('hamburguer-artesanal', 'principal', 'hamburguer-artesanal', 'Hambúrguer Artesanal', 'Blend bovino 160g, cheddar, cebola caramelizada e batatas.', 'Pão brioche, blend bovino, cheddar, alface, tomate, maionese.', '1 un', 3990, '["carne","contém glúten"]', '/img/itens/hamburguer-artesanal.png'),
  ('salmao-grelhado', 'principal', 'salmao-grelhado', 'Salmão Grelhado', 'Salmão ao ponto com legumes salteados e purê de batata.', 'Salmão, limão siciliano, ervas, legumes, purê com manteiga.', '380 g', 7490, '["sem glúten","peixe"]', '/img/itens/salmao-grelhado.png'),
  ('nhoque-sugo', 'principal', 'nhoque-sugo', 'Nhoque ao Sugo', 'Nhoque de batata com molho sugo e manjericão fresco.', 'Batata, farinha, molho de tomate, parmesão opcional.', '340 g', 4600, '["vegetariano","contém glúten"]', '/img/itens/nhoque-sugo.png'),
  ('strogonoff-carne', 'principal', 'strogonoff-carne', 'Strogonoff de Carne', 'Clássico com creme, champignon, arroz branco e batata palha.', 'Carne, creme de leite, champignon, molho de tomate, temperos.', '360 g', 4990, '["carne","contém lactose"]', '/img/itens/strogonoff-carne.png'),
  ('bowl-vegano-proteico', 'principal', 'bowl-vegano-proteico', 'Bowl Vegano Proteico', 'Quinoa, grão-de-bico, legumes assados e molho tahine.', 'Quinoa, grão-de-bico, abobrinha, cenoura, tahine, limão.', '400 g', 4290, '["vegano","sem glúten"]', '/img/itens/bowl-vegano-proteico.png'),
  ('spaghetti-carbonara', 'massa', 'spaghetti-carbonara', 'Spaghetti Carbonara', 'Molho cremoso tradicional com bacon e parmesão.', 'Spaghetti, bacon, ovos, parmesão, pimenta-do-reino.', '330 g', 5590, '["contém glúten","contém lactose"]', '/img/itens/spaghetti-carbonara.png'),
  ('penne-pesto', 'massa', 'penne-pesto', 'Penne ao Pesto', 'Penne com pesto de manjericão e tomate-cereja confitado.', 'Penne, manjericão, azeite, castanhas, parmesão (opcional).', '320 g', 4890, '["vegetariano","contém glúten"]', '/img/itens/penne-pesto.png'),
  ('pizza-margherita', 'pizza', 'pizza-margherita', 'Margherita', 'Muçarela, tomate, manjericão e azeite.', 'Massa artesanal, muçarela, tomate, manjericão.', '30 cm', 5900, '["vegetariano","contém glúten"]', '/img/itens/pizza-margherita.png'),
  ('pizza-calabresa-especial', 'pizza', 'pizza-calabresa-especial', 'Calabresa Especial', 'Calabresa fatiada, cebola, azeitonas e orégano.', 'Calabresa, cebola, muçarela, azeitona, orégano.', '30 cm', 6400, '["carne","contém glúten"]', '/img/itens/pizza-calabresa-especial.png'),
  ('cheesecake-frutas-vermelhas', 'sobremesa', 'cheesecake-frutas-vermelhas', 'Cheesecake de Frutas Vermelhas', 'Base crocante, creme suave e calda de frutas vermelhas.', 'Cream cheese, biscoito, manteiga, calda de morango/amora.', '140 g', 2290, '["contém lactose","contém glúten"]', '/img/itens/cheesecake-frutas-vermelhas.png'),
  ('mousse-chocolate-70', 'sobremesa', 'mousse-chocolate-70', 'Mousse de Chocolate 70%', 'Textura aerada com chocolate intenso e raspas por cima.', 'Chocolate 70%, creme de leite, ovos, cacau.', '120 g', 1800, '["vegetariano","contém lactose"]', '/img/itens/mousse-chocolate-70.png'),
  ('frutas-da-estacao', 'sobremesa', 'frutas-da-estacao', 'Frutas da Estação', 'Seleção de frutas frescas (varia conforme disponibilidade).', 'Frutas diversas: melão, uva, abacaxi, mamão (exemplo).', '250 g', 1650, '["vegano","sem glúten"]', '/img/itens/frutas-da-estacao.png'),
  ('suco-natural-laranja', 'bebida', 'suco-natural-laranja', 'Suco Natural (Laranja)', 'Suco feito na hora, sem açúcar (adoçante opcional).', 'Laranja fresca espremida.', '500 ml', 1290, '["sem glúten","sem lactose"]', '/img/itens/suco-natural-laranja.png'),
  ('cha-gelado-limao', 'bebida', 'cha-gelado-limao', 'Chá Gelado (Limão)', 'Chá preto gelado com limão e hortelã.', 'Chá preto, limão, hortelã, açúcar opcional.', '400 ml', 1000, '["sem glúten"]', '/img/itens/cha-gelado-limao.png'),
  ('cafe-espresso', 'bebida', 'cafe-espresso', 'Café Espresso', 'Café curto, encorpado e aromático.', 'Grãos selecionados (torra média).', '60 ml', 650, '["sem glúten"]', '/img/itens/cafe-espresso.png'),
  ('refrigerante-lata', 'bebida', 'refrigerante-lata', 'Refrigerante Lata', 'Sabores variados (consulte disponibilidade).', 'Cola, guaraná, limão (exemplo).', '350 ml', 790, '["gelado"]', '/img/itens/refrigerante-lata.png'),
  ('batata-rustica', 'extra', 'batata-rustica', 'Batata Rústica', 'Batatas assadas com páprica e ervas, acompanha molho.', 'Batata, páprica, alecrim, sal, maionese da casa.', '250 g', 1990, '["vegetariano","sem glúten"]', '/img/itens/batata-rustica.png')
on conflict (id) do nothing;
