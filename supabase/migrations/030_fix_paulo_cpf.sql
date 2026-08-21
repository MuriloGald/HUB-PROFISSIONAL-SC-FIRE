-- O CPF do Paulo Roberto Ramos foi semeado errado na migration 026
-- ("07025632049") — o correto e "70256632049" (mesmo numero que ja estava
-- certo em registro_numero, o CFT dele). Corrige o registro existente em vez
-- de reeditar a migration 026, que ja rodou em producao.
update public.profissionais
set cpf = '70256632049'
where nome = 'PAULO ROBERTO RAMOS' and cpf = '07025632049';
