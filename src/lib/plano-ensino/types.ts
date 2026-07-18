/**
 * Snapshot do curso (public.trainings) embutido no plano de ensino no momento
 * da geracao — preserva os dados exibidos no PDF mesmo que o cadastro do curso
 * mude depois. Mesma logica de ClienteEventoSnapshot em lib/laudos/types.ts.
 */
export interface TrainingSnapshot {
  id: string;
  name: string;
  total_hours: number;
}

/** Uma linha do conteudo programatico — pre-carregada de training_subthemes, editavel no wizard. */
export interface SubtemaPlano {
  subtheme_id: string;
  nome: string;
  horas: number;
  sort_order: number;
}

/** Estado completo do wizard de Plano de Ensino — tambem e o que fica salvo em laudos.dados */
export interface PlanoEnsinoWizardState {
  step?: number;
  laudoId?: string;
  codigo?: string;

  training_id?: string;
  training?: TrainingSnapshot;
  turma_periodo?: string;
  instrutor_responsavel?: string;

  ementa?: string;
  objetivo_geral?: string;
  objetivos_especificos?: string[];

  conteudo_programatico?: SubtemaPlano[];
  metodologia?: string;
  recursos_didaticos?: string;

  criterios_avaliacao?: string;
  bibliografia_basica?: string[];
  bibliografia_complementar?: string[];

  data_emissao?: string;
}
