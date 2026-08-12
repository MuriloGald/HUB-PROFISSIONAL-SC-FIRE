-- Suporte a Provas em 2 Fases (Combate a Incêndio e Primeiros Socorros) no AVA do Aluno.

alter table public.avaliacao_respostas add column if not exists fase text not null default 'incendio';

-- Atualiza a chave única para aceitar (class_id, student_id, fase)
alter table public.avaliacao_respostas drop constraint if exists avaliacao_respostas_class_id_student_id_key;
alter table public.avaliacao_respostas drop constraint if exists avaliacao_respostas_class_id_student_id_fase_key;

alter table public.avaliacao_respostas add constraint avaliacao_respostas_class_id_student_id_fase_key unique (class_id, student_id, fase);
