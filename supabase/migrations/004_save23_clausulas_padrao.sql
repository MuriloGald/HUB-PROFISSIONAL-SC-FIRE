-- Biblioteca de clausulas padrao do Capitulo 2 do Laudo Tecnico SAVE 23 (IN 23).
-- No app legado (Apps Script) essa lista vivia numa aba de planilha editavel pelo RT sem
-- mexer em codigo; aqui vira uma tabela para manter a mesma autonomia de edicao.
create table public.save23_clausulas_padrao (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  texto text not null,
  ordem integer not null default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.save23_clausulas_padrao enable row level security;

create policy "Leitura pública de clausulas SAVE23" on public.save23_clausulas_padrao for select using (true);
create policy "Inserção por usuários autenticados" on public.save23_clausulas_padrao for insert to authenticated with check (true);
create policy "Atualização por usuários autenticados" on public.save23_clausulas_padrao for update to authenticated using (true) with check (true);
create policy "Exclusão por usuários autenticados" on public.save23_clausulas_padrao for delete to authenticated using (true);

insert into public.save23_clausulas_padrao (titulo, texto, ordem) values
('Quadro Geral SAVE (QG-SAVE)',
 'A edificação deve instalar um quadro elétrico centralizado e exclusivo para o sistema de recarga, totalmente independente das demais cargas do condomínio. Este quadro deve possuir um sistema de proteção que permita o desligamento total de emergência de todos os pontos de abastecimento de forma simultânea.',
 1),
('Viabilidade Técnica e Estudo de Carga',
 'Antes da execução, é indispensável a realização de um estudo de carga por profissional habilitado para confirmar se a subestação e os barramentos existentes suportam a nova demanda sem comprometer a estabilidade elétrica das áreas comuns e unidades privativas.',
 2),
('Projeto Elétrico e ART (Obrigatório)',
 'É obrigatória a entrega do Projeto Elétrico Executivo (diagramas unifilares e dimensionamento de proteções) acompanhado das respectivas ARTs (Anotação de Responsabilidade Técnica) de Projeto e de Execução. Estes documentos são fundamentais para a emissão do Relatório de Regularização (Anexo B) exigido pelo CBMSC.',
 3),
('Pontos de Desligamento e Botões de Emergência',
 'Devem ser instalados dispositivos manuais de corte (botões tipo "soco") em cada pavimento de garagem. Estes botões devem estar situados a, no máximo, 5,00 metros do acesso às rotas de fuga, como portas de escadas ou saídas de emergência.',
 4),
('Sinalização de Emergência Padronizada',
 'Todos os componentes devem ser sinalizados com placas fotoluminescentes de fundo vermelho e texto branco, seguindo os modelos oficiais da IN 23: Modelo 01 (Singular) "VEÍCULOS ELÉTRICOS – EMERGÊNCIA – DESLIGUE O CARREGAMENTO" (instalado em cada ponto de recarga individual); Modelo 02 (Plural com Pictograma) "EMERGÊNCIA – VEÍCULOS ELÉTRICOS – DESLIGUE OS CARREGADORES" (instalado no QG-SAVE e nos botões de desligamento geral).',
 5),
('Interface com Segurança Ativa (Sugestão)',
 'Como sugestão de melhoria, recomenda-se que o QG-SAVE possua interface de seccionamento automático integrada ao sistema de alarme de incêndio: ao detectar fumaça, a central de alarme aciona o desligamento (trip) do disjuntor do quadro, cortando automaticamente a alimentação elétrica do sistema de recarga. Adicionalmente, sugere-se que os pontos de desligamento e o quadro geral possuam iluminação de emergência dedicada para operação em caso de falta de energia.',
 6),
('Integridade Estrutural e Térmica',
 'O projeto deve prever que a instalação de eletrodutos e suportes não fragilize elementos estruturais (vigas e lajes). Considerando que incêndios em baterias de lítio podem atingir temperaturas superiores a 800°C, os materiais de suporte devem ter resistência térmica avaliada para evitar a propagação vertical do calor ou o colapso de infraestruturas críticas.',
 7);
