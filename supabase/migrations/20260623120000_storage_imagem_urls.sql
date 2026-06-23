-- Point menu item images to Supabase Storage (RestaurantAI bucket)
update public.menu_items
set imagem_url = 'https://bzvnpjcndorizmldfigv.supabase.co/storage/v1/object/public/RestaurantAI/itens/' ||
  regexp_replace(imagem_url, '^/img/itens/', '')
where imagem_url like '/img/itens/%';
