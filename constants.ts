import { ReportData, Signatures } from "./types";

// In a real app, these would be handled securely via backend authentication
export const MOCK_PASSWORDS = {
  COORDINATOR: "coord123",
  SUPERVISOR: "super123"
};

export const INITIAL_REPORT_DATA: ReportData = {
  // Informações Básicas
  congregacao: "",
  area: "",
  mes: "",
  ano: 2025,
  whatsapp: "",

  // Matriculados CEAD
  cead_matriculados_total: 0,
  cead_dirigente: 0,
  cead_vice_dirigente: 0,
  cead_secretaria: 0,
  cead_vice_secretaria: 0,
  cead_adultos: 0,
  cead_jovens: 0,
  cead_adolescentes: 0,
  cead_criancas: 0,

  // Atividades Realizadas
  atividades_evangelismo_pessoal: 0,
  atividades_evangelismo_transito: 0,
  atividades_evangelismo_infantil: 0,
  atividades_evangelismo_noturno: 0,
  atividades_evangelismo_lar: 0,
  atividades_culto_relampago: 0,
  atividades_culto_mensal: 0,
  atividades_culto_missoes: 0,
  atividades_domingo: "",
  atividades_ponto_pregacao: 0,
  atividades_culto_rodizio: 0,
  atividades_consagracao: 0,
  atividades_concentracao_evangelica: 0,
  atividades_visita_enfermos: 0,
  atividades_visita_nao_convertidos: 0,
  atividades_culto_jovem: 0,

  // Existing fields
  mocidade_dirigente: 0,
  mocidade_vice_dirigente: 0,
  mocidade_secretaria: 0,
  mocidade_vice_secretaria: 0,
  mocidade_adultos: 0,
  mocidade_jovens: 0,
  mocidade_adolescentes: 0,
  mocidade_criancas: 0,
  conversoes_total: 0,
  bencaos_batismos: 0,
  bencaos_renovos: 0,
  bencaos_curas: 0,
  bencaos_outros: 0,
  literatura_quantidade: 0,
  area_conferencia: 0,
  area_pre_congresso: 0,
  area_formatura: 0,
  area_culto_jovens: 0,
  area_sabado: "",
  area_cruzada: 0,
  discipulado_turmas_basico: 0,
  discipulado_turmas_intermediario: 0,
  discipulado_turmas_avancado: 0,
  discipulado_total_professores: 0,
  discipulado_possui_responsavel: false,
  discipulado_alunos_basico: 0,
  discipulado_alunos_intermediario: 0,
  discipulado_alunos_avancado: 0,
  discipulado_faixa_adolescentes: 0,
  discipulado_faixa_jovens: 0,
  discipulado_faixa_adultos: 0,
  discipulado_faixa_idosos: 0,
  discipulado_faixa_pcd: 0,
  discipulado_presencas: 0,
  discipulado_ausencias: 0,
  discipulado_novos_alunos: 0,
  discipulado_aguardando_batismo: 0,
  discipulado_visitas_novos: 0,
  discipulado_aconselhamento: 0,
  discipulado_visitas_ministeriais: 0,
  discipulado_visitas_apoio: 0,
  discipulado_dias_culto: 0,
  attachmentName: null,
};

export const INITIAL_SIGNATURES: Signatures = {
  dirigente_cead: "",
  responsavel_congregacao: "",
  coordenador_area: { name: "", signedAt: null, isValid: false },
  supervisao_cead: { name: "", signedAt: null, isValid: false },
};