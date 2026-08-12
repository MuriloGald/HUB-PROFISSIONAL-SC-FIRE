-- Curso Intermediario "Brigada de Incendio Intermediaria (primeiros socorros)" +
-- subtema pratico de extincao de principio de incendio ("Pratica de Extintores", 1h30).
-- Idempotente por nome: se o curso ja tiver sido cadastrado pela UI (Treinamentos >
-- Cursos), reaproveita o id em vez de duplicar; mesma logica para o subtema e para o
-- vinculo training_subthemes. Segue o mesmo padrao de povoamento da migration 009
-- (Curso Basico), mas aqui o template de ensino (ementa/objetivos/etc, colunas da
-- migration 012) ja vai preenchido, para o Plano de Ensino nao nascer em branco.
do $$
declare
  v_curso_id uuid;
  v_subtema_id uuid;
  v_next_sort integer;
begin
  select id into v_curso_id
  from public.trainings
  where name = 'Brigada de Incêndio Intermediária (primeiros socorros)'
  limit 1;

  if v_curso_id is null then
    insert into public.trainings (
      name, description, base_price, total_hours, combo_type, active,
      ementa, objetivo_geral, objetivos_especificos, metodologia,
      recursos_didaticos, criterios_avaliacao, bibliografia_basica, bibliografia_complementar
    ) values (
      'Brigada de Incêndio Intermediária (primeiros socorros)',
      'Capacitacao de brigadistas em suporte basico de vida e atendimento inicial a vitimas, complementando a formacao basica de combate a principio de incendio e abandono de area, conforme NBR 14276 e exigencias do CBMSC.',
      0, 8, 'intermediaria', true,
      'Conceitos fundamentais de primeiros socorros e cadeia de sobrevivencia. Avaliacao da cena e biosseguranca. Avaliacao primaria e secundaria da vitima. Suporte Basico de Vida (SBV) e uso do Desfibrilador Externo Automatico (DEA). Obstrucao de vias aereas por corpo estranho (engasgo) em adultos, criancas e bebes. Controle de hemorragias e uso de torniquete. Queimaduras: classificacao e condutas. Fraturas, entorses e luxacoes: tecnicas de imobilizacao. Estado de choque e mal subito (convulsao, desmaio, crise hipoglicemica). Acionamento da cadeia de socorro (SAMU/Bombeiros) e transporte inicial da vitima. Integracao das acoes de primeiros socorros com o plano de abandono e a brigada de incendio.',
      'Capacitar os brigadistas a reconhecer situacoes de emergencia com vitimas e prestar atendimento inicial de primeiros socorros de forma segura, tecnica e organizada, reduzindo agravos e preservando a vida ate a chegada do socorro especializado.',
      array[
        'Identificar riscos na cena da emergencia e adotar medidas de biosseguranca antes de qualquer atendimento',
        'Realizar avaliacao primaria e secundaria de vitimas conscientes e inconscientes',
        'Executar manobras de Suporte Basico de Vida (SBV), incluindo compressoes toracicas e uso do DEA',
        'Aplicar tecnicas de desobstrucao de vias aereas (manobra de Heimlich) em diferentes faixas etarias',
        'Controlar hemorragias externas por meio de compressao direta e uso correto de torniquete',
        'Reconhecer e classificar queimaduras, aplicando a conduta adequada para cada grau',
        'Imobilizar fraturas, entorses e luxacoes com materiais disponiveis no local',
        'Identificar sinais de estado de choque e de mal subito, prestando o atendimento inicial adequado',
        'Acionar corretamente os servicos de emergencia (SAMU 192, Bombeiros 193) e transmitir informacoes objetivas',
        'Integrar as acoes de primeiros socorros ao plano de abandono e a atuacao geral da brigada de incendio'
      ],
      'O curso sera ministrado por meio de aulas expositivas dialogadas, com apoio de recursos audiovisuais, seguidas de atividades praticas simuladas em ambiente controlado, utilizando manequins de RCP, DEA de treinamento e materiais de imobilizacao. Serao aplicadas tecnicas de simulacao realistica (cenarios de emergencia) para consolidar a tomada de decisao sob pressao, com feedback imediato do instrutor. A carga pratica correspondera a, no minimo, 60% da carga horaria total, conforme diretrizes da NBR 14276 para treinamentos de brigada de incendio.',
      'Apostila tecnica e slides de apoio; manequins de treinamento para RCP (adulto, crianca e bebe); Desfibrilador Externo Automatico (DEA) de treinamento; kit de primeiros socorros (ataduras, talas, torniquete, luvas, mascaras de bolso); materiais para simulacao de ferimentos (moulage) e imobilizacao improvisada; projetor multimidia e recursos audiovisuais; extintores e equipamentos de combate a incendio para integracao com o modulo pratico de brigada; ficha de avaliacao pratica individual.',
      'A avaliacao do brigadista e composta por: avaliacao teorica (peso 40%) com aproveitamento minimo de 70%; avaliacao pratica (peso 60%) por observacao direta do desempenho nas simulacoes de RCP, uso do DEA, controle de hemorragia e imobilizacao, conforme checklist tecnico do instrutor; frequencia minima de 100% da carga horaria como pre-requisito para certificacao; segunda oportunidade de avaliacao pratica para quem nao atingir o desempenho minimo, a criterio do instrutor.',
      array[
        'ASSOCIACAO BRASILEIRA DE NORMAS TECNICAS. NBR 14276: Brigada de incendio — Requisitos. Rio de Janeiro: ABNT, 2020.',
        'AMERICAN HEART ASSOCIATION. Destaques da Atualizacao das Diretrizes de RCP e ACE. Dallas: AHA, edicao vigente.',
        'CORPO DE BOMBEIROS MILITAR DE SANTA CATARINA. Instrucao Normativa sobre Brigada de Incendio. Florianopolis: CBMSC, edicao vigente.',
        'MINISTERIO DA SAUDE. Primeiros Socorros: Manual de Bolso. Brasilia: Ministerio da Saude, edicao vigente.'
      ],
      array[
        'BRASIL. Ministerio do Trabalho e Emprego. NR-23: Protecao contra incendios. Brasilia: MTE, edicao vigente.',
        'CRUZ VERMELHA BRASILEIRA. Manual de Primeiros Socorros. Rio de Janeiro: Cruz Vermelha, edicao vigente.',
        'NATIONAL SAFETY COUNCIL. First Aid, CPR and AED. Burlington: Jones & Bartlett Learning, edicao vigente.',
        'CORPO DE BOMBEIROS MILITAR. Manual de Atendimento Pre-Hospitalar. edicao vigente.',
        'ASSOCIACAO BRASILEIRA DE NORMAS TECNICAS. NBR 15219: Plano de emergencia contra incendio — Requisitos. Rio de Janeiro: ABNT, edicao vigente.'
      ]
    )
    returning id into v_curso_id;
  end if;

  select id into v_subtema_id
  from public.subthemes
  where name = 'Prática de Extintores'
  limit 1;

  if v_subtema_id is null then
    insert into public.subthemes (name, category, level, hours, price, description, active)
    values (
      'Prática de Extintores',
      'Noções de Extinção',
      'Intermediário',
      1.5,
      0,
      'Extincao de principio de incendio: manuseio pratico de extintores portateis (agua pressurizada, po quimico ABC, CO2 e espuma mecanica) sobre fogo real controlado, tecnica de abordagem, distancia de seguranca e escolha do agente extintor por classe de fogo. NBR 12693 | NBR 14276 Anexo B.',
      true
    )
    returning id into v_subtema_id;
  end if;

  if not exists (
    select 1 from public.training_subthemes
    where training_id = v_curso_id and subtheme_id = v_subtema_id
  ) then
    select coalesce(max(sort_order) + 1, 0) into v_next_sort
    from public.training_subthemes
    where training_id = v_curso_id;

    insert into public.training_subthemes (training_id, subtheme_id, sort_order, is_mandatory)
    values (v_curso_id, v_subtema_id, v_next_sort, true);
  end if;
end $$;
