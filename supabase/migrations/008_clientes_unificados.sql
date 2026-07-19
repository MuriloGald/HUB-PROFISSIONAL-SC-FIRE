-- Unifica a base de clientes entre todos os modulos de documento. Antes, cada
-- modulo filtrava clientes.tipo pra fingir ter sua propria base (evento=Eventos,
-- imovel=Habite-se, condominio=SAVE23) -- um cliente cadastrado num modulo ficava
-- invisivel nos outros. 'evento'/'imovel' nunca foram categorias reais de negocio,
-- so existiam pra separar modulo, entao migram para 'outro' antes de sair do
-- constraint. Nenhuma linha e removida, nenhuma coluna e removida.
update public.clientes set tipo = 'outro' where tipo in ('evento', 'imovel');

alter table public.clientes drop constraint clientes_tipo_check;
alter table public.clientes add constraint clientes_tipo_check
  check (tipo in ('condominio', 'restaurante', 'deposito', 'comercial', 'outro'));
