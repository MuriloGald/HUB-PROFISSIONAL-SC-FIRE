-- Adiciona o tipo 'evento' para clientes organizadores de eventos temporarios (modulo IN 24)
alter table public.clientes drop constraint clientes_tipo_check;
alter table public.clientes add constraint clientes_tipo_check
  check (tipo in ('condominio', 'restaurante', 'deposito', 'comercial', 'evento', 'outro'));

-- Endereco estruturado (necessario para os modelos de laudo/termo do IN 24, que exigem
-- logradouro, numero, bairro e complemento em campos separados). "endereco" continua
-- disponivel para exibicao resumida.
alter table public.clientes add column if not exists logradouro text;
alter table public.clientes add column if not exists numero text;
alter table public.clientes add column if not exists bairro text;
alter table public.clientes add column if not exists complemento text;
