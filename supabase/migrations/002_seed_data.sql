-- ============================================================
-- Nicole & Mateus - Wedding Gift List - Seed Data
-- ============================================================
insert into public.gifts (name, description, image_path, quantity_mode, required_quantity, inventory_status, is_visible, display_order) values
  ('Jogo de Taças de Cristal', 'Taças elegantes para momentos especiais. Ideal para vinho tinto e branco.', null, 'fixed', 4, 'needed', true, 1),
  ('Conjunto de Panelas Antiaderentes', 'Kit completo com 5 peças de alta qualidade para o dia a dia da cozinha.', null, 'fixed', 1, 'needed', true, 2),
  ('Jogo de Cama King Size', 'Lençol, fronhas e cobre-leito em algodão egípcio. Para o quarto dos sonhos.', null, 'fixed', 2, 'needed', true, 3),
  ('Jogo de Toalhas de Banho', 'Toalhas macias e absorventes. O casal aceita receber mais de um conjunto!', null, 'unlimited', null, 'needed', true, 4),
  ('Cafeteira Expresso', 'Para começar os dias juntos com um café especial.', null, 'fixed', 1, 'needed', true, 5),
  ('Liquidificador de Alta Potência', 'Para smoothies, sopas e muito mais.', null, 'fixed', 1, 'needed', true, 6),
  ('Jogo de Pratos de Porcelana', 'Serviço completo para 12 pessoas, ideal para receber amigos e família.', null, 'fixed', 1, 'needed', true, 7),
  ('Panos de Prato Bordados', 'Panos artesanais com bordados delicados. Sempre bem-vindos!', null, 'unlimited', null, 'needed', true, 8),
  ('Espremedor de Frutas', 'Já temos um espremedor elétrico em casa.', null, 'fixed', 1, 'owned', true, 9),
  ('Batedeira Planetária', 'Para bolos, pães e sobremesas especiais.', null, 'fixed', 1, 'needed', true, 10),
  ('Aparelho de Jantar e Chá', 'Conjunto refinado para refeições em família.', null, 'fixed', 1, 'needed', true, 11),
  ('Faqueiro em Aço Inox', 'Faqueiro completo 101 peças em estojo de madeira.', null, 'fixed', 1, 'needed', true, 12);
