import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputGroup } from './components/InputGroup';
import { SignatureModal } from './components/SignatureModal';
import { INITIAL_REPORT_DATA, INITIAL_SIGNATURES } from './constants';
import { ReportData, SignatureRole, Signatures, SavedReport } from './types';
import { 
  FileText, ShieldCheck, Send, User, AlertCircle, 
  Upload, Paperclip, Activity, LogIn, ArrowLeft, Printer, 
  LayoutDashboard, ChevronRight, Users, BookOpen, Heart, Target, MapPin, Calendar
} from 'lucide-react';

function App() {
  // App Navigation State
  const [view, setView] = useState<'HOME' | 'FORM' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD' | 'REPORT_DETAIL'>('HOME');
  
  // Form State
  const [data, setData] = useState<ReportData>(INITIAL_REPORT_DATA);
  const [localSignatures, setLocalSignatures] = useState<Signatures>(INITIAL_SIGNATURES); // Only local responsibles
  
  // Admin/Data State - Initialize from LocalStorage to persist data on refresh
  const [savedReports, setSavedReports] = useState<SavedReport[]>(() => {
    try {
      const saved = localStorage.getItem('ieadpe_reports_db');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Erro ao carregar dados", e);
      return [];
    }
  });

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<SignatureRole>(SignatureRole.COORDINATOR);
  
  // Admin Login State
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');

  // --- Effects ---

  // Save to LocalStorage whenever reports change
  useEffect(() => {
    localStorage.setItem('ieadpe_reports_db', JSON.stringify(savedReports));
  }, [savedReports]);

  // --- Actions ---

  const updateData = (key: keyof ReportData, value: string | number | boolean) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setData(prev => ({ ...prev, attachmentName: file.name }));
  };

  const handleSubmitReport = () => {
    if (!data.congregacao || !data.area) {
        alert("Por favor, preencha pelo menos a Congregação e a Área.");
        return;
    }

    const newReport: SavedReport = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        data: { ...data },
        signatures: { ...localSignatures }, // Only local signatures initially
        status: 'PENDING',
        submissionDate: new Date().toISOString()
    };

    setSavedReports(prev => [newReport, ...prev]);
    alert(`✅ Relatório enviado com sucesso!\n\nOs dados foram registrados no sistema.\nNotificação de envio simulada para: alexsandroinformacoes@gmail.com`);
    
    // Reset form and go home
    setData(INITIAL_REPORT_DATA);
    setLocalSignatures(INITIAL_SIGNATURES);
    setView('HOME');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === 'admin123') { // Simple mock password
        setView('ADMIN_DASHBOARD');
        setAdminError('');
        setAdminPass('');
    } else {
        setAdminError('Senha inválida (Dica: admin123)');
    }
  };

  const openSignatureModal = (role: SignatureRole) => {
    setActiveRole(role);
    setModalOpen(true);
  };

  const handleSignatureSuccess = (name: string) => {
    if (!selectedReportId) return;

    const timestamp = new Date().toLocaleString('pt-BR');
    
    setSavedReports(prev => prev.map(report => {
        if (report.id === selectedReportId) {
            const updatedSignatures = { ...report.signatures };
            if (activeRole === SignatureRole.COORDINATOR) {
                updatedSignatures.coordenador_area = { name, signedAt: timestamp, isValid: true };
            } else {
                updatedSignatures.supervisao_cead = { name, signedAt: timestamp, isValid: true };
            }
            
            // Check if both are valid to update status
            const isFullyValidated = 
                (activeRole === SignatureRole.COORDINATOR ? true : updatedSignatures.coordenador_area.isValid) &&
                (activeRole === SignatureRole.SUPERVISOR ? true : updatedSignatures.supervisao_cead.isValid);

            return {
                ...report,
                signatures: updatedSignatures,
                status: isFullyValidated ? 'VALIDATED' : 'PENDING'
            };
        }
        return report;
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Computed Values for Dashboard ---
  const totalReports = savedReports.length;
  const pendingReports = savedReports.filter(r => r.status === 'PENDING').length;
  const totalBatismos = savedReports.reduce((acc, curr) => acc + curr.data.bencaos_batismos, 0);
  const totalConversoes = savedReports.reduce((acc, curr) => acc + curr.data.conversoes_total, 0);

  // --- View Components ---

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="text-center text-white space-y-2">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
                <FileText size={40} />
            </div>
            <h1 className="text-3xl font-bold">IEADPE Digital</h1>
            <p className="text-slate-400">Sistema de Controle de Atividades</p>
        </div>

        <div className="grid gap-4 w-full max-w-md">
            <button 
                onClick={() => setView('FORM')}
                className="bg-white hover:bg-blue-50 text-blue-900 p-6 rounded-xl shadow-xl flex items-center justify-between group transition-all"
            >
                <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4 text-blue-600">
                        <Send size={24} />
                    </div>
                    <div className="text-left">
                        <span className="block font-bold text-lg">Enviar Relatório</span>
                        <span className="text-sm text-gray-500">Preencher dados da congregação</span>
                    </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-blue-600" />
            </button>

            <button 
                onClick={() => setView('ADMIN_LOGIN')}
                className="bg-slate-700 hover:bg-slate-600 text-white p-6 rounded-xl shadow-xl flex items-center justify-between group transition-all border border-slate-600"
            >
                 <div className="flex items-center">
                    <div className="bg-slate-800 p-3 rounded-lg mr-4 text-yellow-500">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="text-left">
                        <span className="block font-bold text-lg">Painel Liderança</span>
                        <span className="text-sm text-slate-400">Validar e visualizar dashboard</span>
                    </div>
                </div>
                <ChevronRight className="text-gray-500 group-hover:text-yellow-500" />
            </button>
        </div>
        
        <div className="text-slate-500 text-xs absolute bottom-4">
            v1.2.0 • Dados salvos localmente
        </div>
    </div>
  );

  const renderForm = () => (
    <div className="bg-gray-50 min-h-screen pb-12">
        <div className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                <button onClick={() => setView('HOME')} className="text-gray-600 hover:text-blue-600 flex items-center font-medium">
                    <ArrowLeft size={20} className="mr-1" /> Voltar
                </button>
                <span className="font-bold text-gray-800">Novo Relatório</span>
                <div className="w-20"></div> 
            </div>
        </div>

        <div className="max-w-3xl mx-auto p-4 md:p-6 animate-fade-in">
            <Header />
            
            {/* Upload Section */}
            <div className="bg-blue-50 border-dashed border-2 border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center text-center mb-8">
                <Upload className="text-blue-500 w-8 h-8 mb-2" />
                <p className="text-sm text-blue-800 font-medium mb-3">Anexar foto ou PDF (Opcional)</p>
                <label className="cursor-pointer bg-white text-blue-600 font-bold py-2 px-4 rounded border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm flex items-center text-sm">
                    <Paperclip className="w-4 h-4 mr-2" />
                    {data.attachmentName ? 'Arquivo Selecionado' : 'Escolher Arquivo'}
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
                </label>
                {data.attachmentName && <span className="text-xs text-green-600 mt-2 font-bold">{data.attachmentName}</span>}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-8">
                
                {/* 1. Basic Info */}
                <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2"><FileText className="mr-2 text-blue-600" /> Informações Básicas</h3>
                    <div className="grid gap-4">
                        <InputGroup label="Congregação *" value={data.congregacao} onChange={v => updateData('congregacao', v)} type="text" />
                        <InputGroup label="Área *" value={data.area} onChange={v => updateData('area', v)} type="text" />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Mês *</label>
                                <select value={data.mes} onChange={e => updateData('mes', e.target.value)} className="w-full p-2 border rounded">
                                    <option value="">Selecione</option>
                                    {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <InputGroup label="Ano *" value={data.ano} onChange={v => updateData('ano', Number(v))} />
                        </div>
                        <InputGroup label="WhatsApp (Op.)" value={data.whatsapp} onChange={v => updateData('whatsapp', v)} type="text" />
                    </div>
                </section>

                {/* 2. Matriculados */}
                <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2"><Users className="mr-2 text-blue-600" /> Matriculados na CEAD</h3>
                    <InputGroup label="Total Geral de Matriculados" value={data.cead_matriculados_total} onChange={v => updateData('cead_matriculados_total', Number(v))} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                         <InputGroup label="Dirigente" value={data.cead_dirigente} onChange={v => updateData('cead_dirigente', Number(v))} />
                         <InputGroup label="Vice Dirigente" value={data.cead_vice_dirigente} onChange={v => updateData('cead_vice_dirigente', Number(v))} />
                         <InputGroup label="Secretária" value={data.cead_secretaria} onChange={v => updateData('cead_secretaria', Number(v))} />
                         <InputGroup label="Vice Secretária" value={data.cead_vice_secretaria} onChange={v => updateData('cead_vice_secretaria', Number(v))} />
                         <InputGroup label="Adultos" value={data.cead_adultos} onChange={v => updateData('cead_adultos', Number(v))} />
                         <InputGroup label="Jovens" value={data.cead_jovens} onChange={v => updateData('cead_jovens', Number(v))} />
                         <InputGroup label="Adolescentes" value={data.cead_adolescentes} onChange={v => updateData('cead_adolescentes', Number(v))} />
                         <InputGroup label="Crianças" value={data.cead_criancas} onChange={v => updateData('cead_criancas', Number(v))} />
                    </div>
                </section>

                 {/* 3. Atividades Realizadas */}
                 <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2"><Activity className="mr-2 text-blue-600" /> Atividades Realizadas</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Evangelismo Pessoal" value={data.atividades_evangelismo_pessoal} onChange={v => updateData('atividades_evangelismo_pessoal', Number(v))} />
                        <InputGroup label="Evangelismo Trânsito" value={data.atividades_evangelismo_transito} onChange={v => updateData('atividades_evangelismo_transito', Number(v))} />
                        <InputGroup label="Evangelismo Infantil" value={data.atividades_evangelismo_infantil} onChange={v => updateData('atividades_evangelismo_infantil', Number(v))} />
                        <InputGroup label="Evangelismo Noturno" value={data.atividades_evangelismo_noturno} onChange={v => updateData('atividades_evangelismo_noturno', Number(v))} />
                        <InputGroup label="Evangelismo no Lar" value={data.atividades_evangelismo_lar} onChange={v => updateData('atividades_evangelismo_lar', Number(v))} />
                        <InputGroup label="Culto Relâmpago" value={data.atividades_culto_relampago} onChange={v => updateData('atividades_culto_relampago', Number(v))} />
                        <InputGroup label="Culto Mensal" value={data.atividades_culto_mensal} onChange={v => updateData('atividades_culto_mensal', Number(v))} />
                        <InputGroup label="Culto de Missões" value={data.atividades_culto_missoes} onChange={v => updateData('atividades_culto_missoes', Number(v))} />
                        
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Domingo</label>
                            <select value={data.atividades_domingo} onChange={e => updateData('atividades_domingo', e.target.value)} className="w-full p-2 border rounded shadow-sm">
                                <option value="">Selecione</option>
                                <option value="Manhã">Manhã</option>
                                <option value="Tarde">Tarde</option>
                                <option value="Noite">Noite</option>
                            </select>
                        </div>

                        <InputGroup label="Ponto de Pregação" value={data.atividades_ponto_pregacao} onChange={v => updateData('atividades_ponto_pregacao', Number(v))} />
                        <InputGroup label="Culto Rodízio" value={data.atividades_culto_rodizio} onChange={v => updateData('atividades_culto_rodizio', Number(v))} />
                        <InputGroup label="Consagração" value={data.atividades_consagracao} onChange={v => updateData('atividades_consagracao', Number(v))} />
                        <InputGroup label="Concentração Evang." value={data.atividades_concentracao_evangelica} onChange={v => updateData('atividades_concentracao_evangelica', Number(v))} />
                        <InputGroup label="Visita Enfermos" value={data.atividades_visita_enfermos} onChange={v => updateData('atividades_visita_enfermos', Number(v))} />
                        <InputGroup label="Visita Não Convertidos" value={data.atividades_visita_nao_convertidos} onChange={v => updateData('atividades_visita_nao_convertidos', Number(v))} />
                        <InputGroup label="Culto Jovem" value={data.atividades_culto_jovem} onChange={v => updateData('atividades_culto_jovem', Number(v))} />
                    </div>
                </section>

                {/* 4. Frequência Mocidade */}
                <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2"><Heart className="mr-2 text-blue-600" /> Frequência nas Orações da Mocidade</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InputGroup label="Dirigente" value={data.mocidade_dirigente} onChange={v => updateData('mocidade_dirigente', Number(v))} />
                        <InputGroup label="Vice Dirigente" value={data.mocidade_vice_dirigente} onChange={v => updateData('mocidade_vice_dirigente', Number(v))} />
                        <InputGroup label="Secretária" value={data.mocidade_secretaria} onChange={v => updateData('mocidade_secretaria', Number(v))} />
                        <InputGroup label="Vice Secretária" value={data.mocidade_vice_secretaria} onChange={v => updateData('mocidade_vice_secretaria', Number(v))} />
                        <InputGroup label="Adultos" value={data.mocidade_adultos} onChange={v => updateData('mocidade_adultos', Number(v))} />
                        <InputGroup label="Jovens" value={data.mocidade_jovens} onChange={v => updateData('mocidade_jovens', Number(v))} />
                        <InputGroup label="Adolescentes" value={data.mocidade_adolescentes} onChange={v => updateData('mocidade_adolescentes', Number(v))} />
                        <InputGroup label="Crianças" value={data.mocidade_criancas} onChange={v => updateData('mocidade_criancas', Number(v))} />
                    </div>
                </section>

                {/* 5. Conversões e Bençãos */}
                <section className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2"><Target className="mr-2 text-blue-600" /> Conversões / Bençãos</h3>
                        <InputGroup label="Total de Conversões" value={data.conversoes_total} onChange={v => updateData('conversoes_total', Number(v))} />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <InputGroup label="Batismos" value={data.bencaos_batismos} onChange={v => updateData('bencaos_batismos', Number(v))} />
                            <InputGroup label="Renovos" value={data.bencaos_renovos} onChange={v => updateData('bencaos_renovos', Number(v))} />
                            <InputGroup label="Curas Divinas" value={data.bencaos_curas} onChange={v => updateData('bencaos_curas', Number(v))} />
                            <InputGroup label="Outros" value={data.bencaos_outros} onChange={v => updateData('bencaos_outros', Number(v))} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2"><MapPin className="mr-2 text-blue-600" /> Área / Literatura</h3>
                        <InputGroup label="Literatura Distribuída" value={data.literatura_quantidade} onChange={v => updateData('literatura_quantidade', Number(v))} />
                        <div className="mt-4 space-y-2">
                             <p className="font-bold text-gray-700 text-sm mb-2">Atividades Nível Área</p>
                             <InputGroup label="Conf. Missionária" value={data.area_conferencia} onChange={v => updateData('area_conferencia', Number(v))} />
                             <InputGroup label="Pré-Congresso" value={data.area_pre_congresso} onChange={v => updateData('area_pre_congresso', Number(v))} />
                             <InputGroup label="Formatura Discip." value={data.area_formatura} onChange={v => updateData('area_formatura', Number(v))} />
                             <InputGroup label="Culto Jovens Unif." value={data.area_culto_jovens} onChange={v => updateData('area_culto_jovens', Number(v))} />
                             <InputGroup label="Cruzada Evangelística" value={data.area_cruzada} onChange={v => updateData('area_cruzada', Number(v))} />
                             <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Sábado</label>
                                <select value={data.area_sabado} onChange={e => updateData('area_sabado', e.target.value)} className="w-full p-2 border rounded shadow-sm">
                                    <option value="">Selecione</option>
                                    <option value="Livre">Livre</option>
                                    <option value="Ocupado">Ocupado</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. Discipulado */}
                <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2"><BookOpen className="mr-2 text-blue-600" /> Discipulado</h3>
                    
                    <div className="bg-gray-50 p-4 rounded mb-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2 uppercase">1. Turmas Ativas</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <InputGroup label="Básico" value={data.discipulado_turmas_basico} onChange={v => updateData('discipulado_turmas_basico', Number(v))} />
                            <InputGroup label="Intermed." value={data.discipulado_turmas_intermediario} onChange={v => updateData('discipulado_turmas_intermediario', Number(v))} />
                            <InputGroup label="Avançado" value={data.discipulado_turmas_avancado} onChange={v => updateData('discipulado_turmas_avancado', Number(v))} />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded mb-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2 uppercase">2. Professores</h4>
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={data.discipulado_possui_responsavel} onChange={e => updateData('discipulado_possui_responsavel', e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Congregação possui Responsável?</span>
                            </label>
                        </div>
                        <InputGroup label="Total Professores" value={data.discipulado_total_professores} onChange={v => updateData('discipulado_total_professores', Number(v))} />
                    </div>

                    <div className="bg-gray-50 p-4 rounded mb-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2 uppercase">3. Alunos Matriculados por Ciclo</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <InputGroup label="Básico" value={data.discipulado_alunos_basico} onChange={v => updateData('discipulado_alunos_basico', Number(v))} />
                            <InputGroup label="Intermed." value={data.discipulado_alunos_intermediario} onChange={v => updateData('discipulado_alunos_intermediario', Number(v))} />
                            <InputGroup label="Avançado" value={data.discipulado_alunos_avancado} onChange={v => updateData('discipulado_alunos_avancado', Number(v))} />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded mb-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2 uppercase">4. Alunos Por Faixa Etária</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <InputGroup label="Adolescentes" value={data.discipulado_faixa_adolescentes} onChange={v => updateData('discipulado_faixa_adolescentes', Number(v))} />
                            <InputGroup label="Jovens" value={data.discipulado_faixa_jovens} onChange={v => updateData('discipulado_faixa_jovens', Number(v))} />
                            <InputGroup label="Adultos" value={data.discipulado_faixa_adultos} onChange={v => updateData('discipulado_faixa_adultos', Number(v))} />
                            <InputGroup label="Idosos" value={data.discipulado_faixa_idosos} onChange={v => updateData('discipulado_faixa_idosos', Number(v))} />
                            <InputGroup label="PcD" value={data.discipulado_faixa_pcd} onChange={v => updateData('discipulado_faixa_pcd', Number(v))} />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded mb-4">
                        <h4 className="font-bold text-sm text-gray-700 mb-2 uppercase">5. Presenças / Ausências (Mês)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Total Presenças" value={data.discipulado_presencas} onChange={v => updateData('discipulado_presencas', Number(v))} />
                            <InputGroup label="Total Ausências" value={data.discipulado_ausencias} onChange={v => updateData('discipulado_ausencias', Number(v))} />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-bold text-sm text-gray-700 mb-2 uppercase">6. Outros Dados Discipulado</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <InputGroup label="Novos Alunos (Mês)" value={data.discipulado_novos_alunos} onChange={v => updateData('discipulado_novos_alunos', Number(v))} />
                             <InputGroup label="Aguardando Batismo" value={data.discipulado_aguardando_batismo} onChange={v => updateData('discipulado_aguardando_batismo', Number(v))} />
                             <InputGroup label="Visitas a Novos Convertidos" value={data.discipulado_visitas_novos} onChange={v => updateData('discipulado_visitas_novos', Number(v))} />
                             <InputGroup label="Aconselhamento Individual" value={data.discipulado_aconselhamento} onChange={v => updateData('discipulado_aconselhamento', Number(v))} />
                             <InputGroup label="Visitas Ministeriais" value={data.discipulado_visitas_ministeriais} onChange={v => updateData('discipulado_visitas_ministeriais', Number(v))} />
                             <InputGroup label="Visitas Apoio Área" value={data.discipulado_visitas_apoio} onChange={v => updateData('discipulado_visitas_apoio', Number(v))} />
                             <InputGroup label="Dias Discip. formou em Cultos" value={data.discipulado_dias_culto} onChange={v => updateData('discipulado_dias_culto', Number(v))} />
                        </div>
                    </div>
                </section>

                {/* Responsáveis (Local) */}
                <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-bold text-blue-800 uppercase mb-4">Assinaturas Locais (Quem preencheu)</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-blue-700 mb-1">Dirigente CEAD</label>
                            <input type="text" className="w-full border border-blue-300 rounded p-2 focus:ring-2 focus:ring-blue-500" placeholder="Nome completo" value={localSignatures.dirigente_cead} onChange={e => setLocalSignatures({...localSignatures, dirigente_cead: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-700 mb-1">Responsável Congregação</label>
                            <input type="text" className="w-full border border-blue-300 rounded p-2 focus:ring-2 focus:ring-blue-500" placeholder="Nome completo" value={localSignatures.responsavel_congregacao} onChange={e => setLocalSignatures({...localSignatures, responsavel_congregacao: e.target.value})} />
                        </div>
                    </div>
                </section>

                <div className="pt-4">
                    <div className="flex items-center justify-center text-sm text-gray-500 mb-4 bg-yellow-50 p-3 rounded border border-yellow-100">
                        <AlertCircle size={16} className="text-yellow-600 mr-2" />
                        <span className="text-center">Ao enviar, os dados serão processados e enviados para validação da supervisão. Confirmação será enviada para <strong>alexsandroinformacoes@gmail.com</strong></span>
                    </div>
                    <button onClick={handleSubmitReport} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-lg flex justify-center items-center transform transition hover:scale-[1.01]">
                        <Send className="mr-2" /> Enviar Relatório
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="flex min-h-screen bg-slate-100">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 text-white hidden md:flex flex-col p-4">
            <div className="mb-8 flex items-center">
                <ShieldCheck className="text-yellow-400 mr-2" />
                <span className="font-bold text-lg">Painel Liderança</span>
            </div>
            <nav className="space-y-2">
                <button className="w-full flex items-center bg-slate-700 p-3 rounded text-left">
                    <LayoutDashboard size={18} className="mr-3" /> Dashboard
                </button>
            </nav>
            <div className="mt-auto">
                <button onClick={() => setView('HOME')} className="text-slate-400 hover:text-white text-sm flex items-center">
                    <ArrowLeft size={16} className="mr-2" /> Sair
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Visão Geral da Área</h2>
                <div className="text-sm text-slate-500">
                    Logado como: <strong>Coordenação/Supervisão</strong>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Total Relatórios</p>
                            <h3 className="text-3xl font-bold text-slate-800">{totalReports}</h3>
                        </div>
                        <div className="bg-blue-50 p-2 rounded text-blue-600"><FileText size={20} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Pendentes</p>
                            <h3 className="text-3xl font-bold text-orange-600">{pendingReports}</h3>
                        </div>
                        <div className="bg-orange-50 p-2 rounded text-orange-600"><AlertCircle size={20} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Total Batismos</p>
                            <h3 className="text-3xl font-bold text-green-600">{totalBatismos}</h3>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-green-600"><User size={20} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Conversões</p>
                            <h3 className="text-3xl font-bold text-purple-600">{totalConversoes}</h3>
                        </div>
                        <div className="bg-purple-50 p-2 rounded text-purple-600"><Activity size={20} /></div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Relatórios Recebidos</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Data Envio</th>
                                <th className="p-4">Congregação</th>
                                <th className="p-4">Mês/Ano</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {savedReports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">Nenhum relatório recebido ainda.</td>
                                </tr>
                            ) : (
                                savedReports.map(report => (
                                    <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">{new Date(report.submissionDate).toLocaleDateString('pt-BR')}</td>
                                        <td className="p-4 font-medium text-slate-900">{report.data.congregacao}</td>
                                        <td className="p-4">{report.data.mes}/{report.data.ano}</td>
                                        <td className="p-4">
                                            {report.status === 'PENDING' ? (
                                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Pendente</span>
                                            ) : (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Validado</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => {
                                                    setSelectedReportId(report.id);
                                                    setView('REPORT_DETAIL');
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end ml-auto"
                                            >
                                                Ver / Validar <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );

  const renderReportDetail = () => {
    const report = savedReports.find(r => r.id === selectedReportId);
    if (!report) return null;

    const d = report.data;
    const discipuladoTurmasTotal = d.discipulado_turmas_basico + d.discipulado_turmas_intermediario + d.discipulado_turmas_avancado;
    const discipuladoAlunosTotal = d.discipulado_alunos_basico + d.discipulado_alunos_intermediario + d.discipulado_alunos_avancado;

    const ReportRow = ({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) => (
        <div className={`flex justify-between border-b border-dotted border-gray-300 py-1 ${highlight ? 'font-bold bg-gray-50' : ''}`}>
            <span className="text-gray-600">{label}:</span>
            <span className="text-gray-900">{value}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Toolbar (Hidden when printing) */}
            <div className="bg-slate-800 text-white p-4 sticky top-0 z-20 shadow-md print:hidden">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <button onClick={() => setView('ADMIN_DASHBOARD')} className="flex items-center text-slate-300 hover:text-white">
                        <ArrowLeft size={20} className="mr-2" /> Voltar ao Painel
                    </button>
                    <div className="flex space-x-3">
                        <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center font-bold shadow-lg">
                            <Printer size={18} className="mr-2" /> IMPRIMIR / SALVAR PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[210mm] mx-auto p-8 print:p-0 print:w-full print:max-w-none">
                {/* DOCUMENTO ESTILO PAPEL */}
                <div className="bg-white shadow-2xl print:shadow-none p-8 md:p-12 min-h-[297mm] relative text-sm">
                    
                    {/* Header do Relatório */}
                    <div className="bg-blue-900 text-white p-6 mb-6 rounded-t-lg print:rounded-none print:bg-blue-900 print:text-white">
                        <h1 className="text-2xl font-bold uppercase text-center mb-2">Igreja Evangélica Assembleia de Deus em Pernambuco</h1>
                        <div className="text-center text-blue-100 text-xs space-y-1">
                            <p>Pastor Presidente: Pr. Ailton José Alves | Pastor Setorial: Pr. Sergio Correia</p>
                            <p className="uppercase tracking-wider font-bold mt-2">Sistema de Controle e Acompanhamento de Atividades</p>
                        </div>
                    </div>

                    <div className="flex justify-between bg-gray-100 p-3 mb-6 border rounded print:border-gray-300">
                         <div><strong>Congregação:</strong> {d.congregacao}</div>
                         <div><strong>Área:</strong> {d.area}</div>
                         <div><strong>Referência:</strong> {d.mes}/{d.ano}</div>
                    </div>

                    {/* Corpo do Relatório - Grid Denso */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        
                        {/* Bloco 1: Matriculados */}
                        <div className="border rounded p-3 break-inside-avoid">
                            <h4 className="font-bold text-blue-800 border-b-2 border-blue-100 mb-2 flex items-center"><Users size={14} className="mr-1"/> Matriculados na CEAD</h4>
                            <ReportRow label="Total de Matriculados" value={d.cead_matriculados_total} highlight />
                            <div className="grid grid-cols-2 gap-x-4">
                                <ReportRow label="Dirigente" value={d.cead_dirigente} />
                                <ReportRow label="Vice Dirigente" value={d.cead_vice_dirigente} />
                                <ReportRow label="Secretária" value={d.cead_secretaria} />
                                <ReportRow label="Vice Secretária" value={d.cead_vice_secretaria} />
                                <ReportRow label="Adultos" value={d.cead_adultos} />
                                <ReportRow label="Jovens" value={d.cead_jovens} />
                                <ReportRow label="Adolescentes" value={d.cead_adolescentes} />
                                <ReportRow label="Crianças" value={d.cead_criancas} />
                            </div>
                        </div>

                        {/* Bloco 2: Frequência Mocidade */}
                         <div className="border rounded p-3 break-inside-avoid">
                            <h4 className="font-bold text-blue-800 border-b-2 border-blue-100 mb-2 flex items-center"><Heart size={14} className="mr-1"/> Freq. Orações Mocidade</h4>
                            <div className="grid grid-cols-2 gap-x-4">
                                <ReportRow label="Dirigente" value={d.mocidade_dirigente} />
                                <ReportRow label="Vice Dirigente" value={d.mocidade_vice_dirigente} />
                                <ReportRow label="Secretária" value={d.mocidade_secretaria} />
                                <ReportRow label="Vice Secretária" value={d.mocidade_vice_secretaria} />
                                <ReportRow label="Adultos" value={d.mocidade_adultos} />
                                <ReportRow label="Jovens" value={d.mocidade_jovens} />
                                <ReportRow label="Adolescentes" value={d.mocidade_adolescentes} />
                                <ReportRow label="Crianças" value={d.mocidade_criancas} />
                            </div>
                        </div>

                        {/* Bloco 3: Atividades Realizadas */}
                        <div className="col-span-2 border rounded p-3 break-inside-avoid">
                            <h4 className="font-bold text-blue-800 border-b-2 border-blue-100 mb-2 flex items-center"><Activity size={14} className="mr-1"/> Atividades Realizadas</h4>
                            <div className="grid grid-cols-4 gap-x-6 gap-y-1">
                                <ReportRow label="Evang. Pessoal" value={d.atividades_evangelismo_pessoal} />
                                <ReportRow label="Evang. Trânsito" value={d.atividades_evangelismo_transito} />
                                <ReportRow label="Evang. Infantil" value={d.atividades_evangelismo_infantil} />
                                <ReportRow label="Evang. Noturno" value={d.atividades_evangelismo_noturno} />
                                <ReportRow label="Evang. Lar" value={d.atividades_evangelismo_lar} />
                                <ReportRow label="Culto Relâmpago" value={d.atividades_culto_relampago} />
                                <ReportRow label="Culto Mensal" value={d.atividades_culto_mensal} />
                                <ReportRow label="Culto Missões" value={d.atividades_culto_missoes} />
                                <ReportRow label="Domingo" value={d.atividades_domingo || '-'} />
                                <ReportRow label="Ponto Pregação" value={d.atividades_ponto_pregacao} />
                                <ReportRow label="Culto Rodízio" value={d.atividades_culto_rodizio} />
                                <ReportRow label="Consagração" value={d.atividades_consagracao} />
                                <ReportRow label="Conc. Evang." value={d.atividades_concentracao_evangelica} />
                                <ReportRow label="Vis. Enfermos" value={d.atividades_visita_enfermos} />
                                <ReportRow label="Vis. N. Convert." value={d.atividades_visita_nao_convertidos} />
                                <ReportRow label="Culto Jovem" value={d.atividades_culto_jovem} />
                            </div>
                        </div>

                        {/* Bloco 4: Estatísticas e Área */}
                        <div className="border rounded p-3 break-inside-avoid">
                            <h4 className="font-bold text-blue-800 border-b-2 border-blue-100 mb-2 flex items-center"><Target size={14} className="mr-1"/> Resultados e Bençãos</h4>
                            <ReportRow label="Total Conversões" value={d.conversoes_total} highlight/>
                            <ReportRow label="Batismos" value={d.bencaos_batismos} />
                            <ReportRow label="Renovos" value={d.bencaos_renovos} />
                            <ReportRow label="Curas Divinas" value={d.bencaos_curas} />
                            <ReportRow label="Outros" value={d.bencaos_outros} />
                        </div>

                        <div className="border rounded p-3 break-inside-avoid">
                            <h4 className="font-bold text-blue-800 border-b-2 border-blue-100 mb-2 flex items-center"><MapPin size={14} className="mr-1"/> Área e Literatura</h4>
                            <ReportRow label="Lit. Distribuída" value={d.literatura_quantidade} />
                            <ReportRow label="Conf. Missionária" value={d.area_conferencia} />
                            <ReportRow label="Pré-Congresso" value={d.area_pre_congresso} />
                            <ReportRow label="Form. Discipulado" value={d.area_formatura} />
                            <ReportRow label="Cruzada" value={d.area_cruzada} />
                            <ReportRow label="Sábado" value={d.area_sabado || '-'} />
                        </div>

                        {/* Bloco 5: Discipulado (Completo) */}
                        <div className="col-span-2 border rounded p-3 break-inside-avoid bg-slate-50 print:bg-white">
                            <h4 className="font-bold text-blue-800 border-b-2 border-blue-100 mb-2 flex items-center"><BookOpen size={14} className="mr-1"/> Departamento de Discipulado</h4>
                            
                            <div className="grid grid-cols-3 gap-8">
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">1. Turmas Ativas</p>
                                    <ReportRow label="Básico" value={d.discipulado_turmas_basico} />
                                    <ReportRow label="Intermediário" value={d.discipulado_turmas_intermediario} />
                                    <ReportRow label="Avançado" value={d.discipulado_turmas_avancado} />
                                    <ReportRow label="Total Turmas" value={discipuladoTurmasTotal} highlight />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">2. Professores</p>
                                    <ReportRow label="Total Prof." value={d.discipulado_total_professores} highlight />
                                    <ReportRow label="Possui Resp.?" value={d.discipulado_possui_responsavel ? 'Sim' : 'Não'} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">3. Alunos Matriculados</p>
                                    <ReportRow label="Básico" value={d.discipulado_alunos_basico} />
                                    <ReportRow label="Intermediário" value={d.discipulado_alunos_intermediario} />
                                    <ReportRow label="Avançado" value={d.discipulado_alunos_avancado} />
                                    <ReportRow label="Total Alunos" value={discipuladoAlunosTotal} highlight />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mt-4 border-t border-gray-200 pt-4">
                                 <div>
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">4. Alunos por Faixa</p>
                                    <div className="grid grid-cols-2 gap-x-4">
                                        <ReportRow label="Adolescentes" value={d.discipulado_faixa_adolescentes} />
                                        <ReportRow label="Jovens" value={d.discipulado_faixa_jovens} />
                                        <ReportRow label="Adultos" value={d.discipulado_faixa_adultos} />
                                        <ReportRow label="Idosos" value={d.discipulado_faixa_idosos} />
                                        <ReportRow label="PcD" value={d.discipulado_faixa_pcd} />
                                    </div>
                                </div>
                                <div>
                                     <p className="text-xs font-bold uppercase text-gray-500 mb-1">5. Frequência e Outros</p>
                                     <div className="grid grid-cols-2 gap-x-4">
                                        <ReportRow label="Presenças" value={d.discipulado_presencas} />
                                        <ReportRow label="Ausências" value={d.discipulado_ausencias} />
                                        <ReportRow label="Novos Alunos" value={d.discipulado_novos_alunos} />
                                        <ReportRow label="Aguard. Batismo" value={d.discipulado_aguardando_batismo} />
                                     </div>
                                </div>
                            </div>
                             <div className="mt-4 border-t border-gray-200 pt-2 grid grid-cols-4 gap-2 text-xs text-gray-600 text-center">
                                <div className="bg-white p-1 rounded border">Visitas N. Convertidos: <strong>{d.discipulado_visitas_novos}</strong></div>
                                <div className="bg-white p-1 rounded border">Aconselhamento: <strong>{d.discipulado_aconselhamento}</strong></div>
                                <div className="bg-white p-1 rounded border">Visitas Ministeriais: <strong>{d.discipulado_visitas_ministeriais}</strong></div>
                                <div className="bg-white p-1 rounded border">Dias Culto: <strong>{d.discipulado_dias_culto}</strong></div>
                             </div>
                        </div>
                    </div>

                    {/* Assinaturas Locais (Impressão) */}
                    <div className="mt-8 grid grid-cols-2 gap-8 text-center print:mt-4">
                        <div>
                            <div className="border-b border-black mb-1 font-script text-lg">{report.signatures.dirigente_cead || '_________________'}</div>
                            <p className="text-xs uppercase font-bold">Dirigente CEAD</p>
                        </div>
                        <div>
                             <div className="border-b border-black mb-1 font-script text-lg">{report.signatures.responsavel_congregacao || '_________________'}</div>
                            <p className="text-xs uppercase font-bold">Responsável Congregação</p>
                        </div>
                    </div>

                    {/* Área de Assinaturas (Validação) */}
                    <div className="mt-8 pt-4 border-t-2 border-blue-900 break-inside-avoid">
                        <h3 className="text-center font-bold text-gray-800 uppercase mb-6 text-sm bg-gray-100 py-1">Validação da Liderança</h3>
                        
                        <div className="grid grid-cols-2 gap-12">
                            {/* Assinatura Coordenador */}
                            <div className="text-center">
                                <div className="h-12 flex items-end justify-center mb-1">
                                    {report.signatures.coordenador_area.isValid ? (
                                        <div className="text-green-700 flex flex-col items-center">
                                            <span className="font-script text-xl">{report.signatures.coordenador_area.name}</span>
                                            <span className="text-[9px] uppercase tracking-widest mt-0">Validado em {report.signatures.coordenador_area.signedAt}</span>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => openSignatureModal(SignatureRole.COORDINATOR)}
                                            className="text-red-500 border border-red-300 bg-red-50 px-4 py-2 rounded text-xs font-bold hover:bg-red-100 print:hidden"
                                        >
                                            <ShieldCheck size={12} className="inline mr-1"/> Validar (Senha)
                                        </button>
                                    )}
                                </div>
                                <p className="border-t border-gray-400 pt-1 text-xs font-bold text-gray-700">Coordenador da Área</p>
                            </div>

                            {/* Assinatura Supervisão */}
                            <div className="text-center">
                                <div className="h-12 flex items-end justify-center mb-1">
                                    {report.signatures.supervisao_cead.isValid ? (
                                        <div className="text-green-700 flex flex-col items-center">
                                            <span className="font-script text-xl">{report.signatures.supervisao_cead.name}</span>
                                            <span className="text-[9px] uppercase tracking-widest mt-0">Validado em {report.signatures.supervisao_cead.signedAt}</span>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => openSignatureModal(SignatureRole.SUPERVISOR)}
                                            className="text-red-500 border border-red-300 bg-red-50 px-4 py-2 rounded text-xs font-bold hover:bg-red-100 print:hidden"
                                        >
                                            <ShieldCheck size={12} className="inline mr-1"/> Validar (Senha)
                                        </button>
                                    )}
                                </div>
                                <p className="border-t border-gray-400 pt-1 text-xs font-bold text-gray-700">Supervisão CEAD</p>
                            </div>
                        </div>
                        
                        <div className="mt-4 text-center text-[10px] text-gray-400 print:block hidden">
                            Relatório gerado via IEADPE Digital. ID Único: {report.id} | {new Date().toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="font-sans text-gray-900">
        {view === 'HOME' && renderHome()}
        {view === 'FORM' && renderForm()}
        
        {view === 'ADMIN_LOGIN' && (
            <div className="min-h-screen flex items-center justify-center bg-slate-800 px-4">
                <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl">
                    <div className="text-center mb-6">
                        <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="text-yellow-600" size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Acesso Restrito</h2>
                        <p className="text-sm text-gray-500">Área de Coordenação e Supervisão</p>
                    </div>
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Senha de Acesso</label>
                            <input 
                                type="password" 
                                value={adminPass}
                                onChange={e => setAdminPass(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••••"
                            />
                        </div>
                        {adminError && <p className="text-red-500 text-sm text-center">{adminError}</p>}
                        <button type="submit" className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors">
                            Entrar no Painel
                        </button>
                        <button type="button" onClick={() => setView('HOME')} className="w-full text-gray-500 text-sm py-2 hover:text-gray-800">
                            Voltar
                        </button>
                    </form>
                </div>
            </div>
        )}

        {view === 'ADMIN_DASHBOARD' && renderAdminDashboard()}
        {view === 'REPORT_DETAIL' && renderReportDetail()}

        {/* Shared Components */}
        <SignatureModal 
            isOpen={modalOpen}
            role={activeRole}
            onClose={() => setModalOpen(false)}
            onSuccess={handleSignatureSuccess}
        />
    </div>
  );
}

export default App;