export interface ReportData {
  // Informações Básicas
  congregacao: string;
  area: string;
  mes: string;
  ano: number;
  whatsapp: string;

  // Matriculados na CEAD
  cead_matriculados_total: number;
  cead_dirigente: number;
  cead_vice_dirigente: number;
  cead_secretaria: number;
  cead_vice_secretaria: number;
  cead_adultos: number;
  cead_jovens: number;
  cead_adolescentes: number;
  cead_criancas: number;

  // Atividades Realizadas
  atividades_evangelismo_pessoal: number;
  atividades_evangelismo_transito: number;
  atividades_evangelismo_infantil: number;
  atividades_evangelismo_noturno: number;
  atividades_evangelismo_lar: number;
  atividades_culto_relampago: number;
  atividades_culto_mensal: number;
  atividades_culto_missoes: number;
  atividades_domingo: string;
  atividades_ponto_pregacao: number;
  atividades_culto_rodizio: number;
  atividades_consagracao: number;
  atividades_concentracao_evangelica: number;
  atividades_visita_enfermos: number;
  atividades_visita_nao_convertidos: number;
  atividades_culto_jovem: number;

  // Frequência nas Orações da Mocidade
  mocidade_dirigente: number;
  mocidade_vice_dirigente: number;
  mocidade_secretaria: number;
  mocidade_vice_secretaria: number;
  mocidade_adultos: number;
  mocidade_jovens: number;
  mocidade_adolescentes: number;
  mocidade_criancas: number;

  // Conversões
  conversoes_total: number;

  // Bençãos Agradecidas
  bencaos_batismos: number;
  bencaos_renovos: number;
  bencaos_curas: number;
  bencaos_outros: number;

  // Literatura
  literatura_quantidade: number;

  // Atividades a Nível de Área
  area_conferencia: number;
  area_pre_congresso: number;
  area_formatura: number;
  area_culto_jovens: number;
  area_sabado: string;
  area_cruzada: number;

  // Discipulado - Turmas Ativas
  discipulado_turmas_basico: number;
  discipulado_turmas_intermediario: number;
  discipulado_turmas_avancado: number;
  
  // Discipulado - Professores
  discipulado_total_professores: number;
  discipulado_possui_responsavel: boolean;

  // Discipulado - Alunos Matriculados
  discipulado_alunos_basico: number;
  discipulado_alunos_intermediario: number;
  discipulado_alunos_avancado: number;

  // Discipulado - Alunos Por Faixa
  discipulado_faixa_adolescentes: number;
  discipulado_faixa_jovens: number;
  discipulado_faixa_adultos: number;
  discipulado_faixa_idosos: number;
  discipulado_faixa_pcd: number;

  // Discipulado - Presenças
  discipulado_presencas: number;
  discipulado_ausencias: number;

  // Discipulado - Outros Dados
  discipulado_novos_alunos: number;
  discipulado_aguardando_batismo: number;
  discipulado_visitas_novos: number;
  discipulado_aconselhamento: number;
  discipulado_visitas_ministeriais: number;
  discipulado_visitas_apoio: number;
  discipulado_dias_culto: number;

  // Anexo
  attachmentName: string | null;
}

export interface Signatures {
  dirigente_cead: string; // Name
  responsavel_congregacao: string; // Name
  coordenador_area: {
    name: string;
    signedAt: string | null;
    isValid: boolean;
  };
  supervisao_cead: {
    name: string;
    signedAt: string | null;
    isValid: boolean;
  };
}

export enum SignatureRole {
  COORDINATOR = 'COORDINATOR',
  SUPERVISOR = 'SUPERVISOR'
}

export type ReportStatus = 'PENDING' | 'VALIDATED';

export interface SavedReport {
  id: string;
  data: ReportData;
  signatures: Signatures;
  status: ReportStatus;
  submissionDate: string;
}