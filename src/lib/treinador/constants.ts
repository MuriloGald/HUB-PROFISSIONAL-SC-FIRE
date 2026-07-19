// Espelha as check constraints de public.subthemes (ver supabase/migrations/009 e 011).
// Só lista os valores realmente usados pelo currículo novo — os valores legados
// (Bronze/Prata/Ouro, Combate a Incêndio, SIPAT) continuam aceitos no banco por
// compatibilidade, mas não aparecem nos seletores da UI.
export const NIVEIS_CURSO = ["Básico", "Intermediário", "Avançado", "Reciclagem"] as const;

export const CATEGORIAS_SUBTEMA = ["Abertura do Curso", "Noções de Extinção", "Primeiros Socorros", "Sistemas Preventivos"] as const;
