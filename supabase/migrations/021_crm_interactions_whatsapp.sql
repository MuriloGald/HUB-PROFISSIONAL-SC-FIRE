-- Adiciona 'whatsapp' aos tipos de interação do CRM — usado pelo fluxo de IA (n8n) pra
-- registrar automaticamente cada mensagem trocada com o lead, em vez de logar no Kommo.
-- Ver N8N/Fluxo de IA - Explicacao.md.

alter table public.crm_interactions drop constraint if exists crm_interactions_interaction_type_check;
alter table public.crm_interactions add constraint crm_interactions_interaction_type_check
  check (interaction_type in ('ligacao', 'email', 'reuniao', 'nota', 'proposta', 'whatsapp'));
