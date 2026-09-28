import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  Clock, 
  FlaskConical, 
  ChevronRight, 
  Eye, 
  Send,
  Layers,
  LayoutGrid,
  List,
  User,
  Calendar,
  Camera,
  Upload,
  Trash2,
  Minus,
  FileText,
  Glasses,
  Sparkles,
  Paperclip,
  Check,
  X
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { OrdemServicoOptica, StatusOSOptica, ItemProdutoServicoOS } from '../types';
import { Badge } from '../components/common/Badge';
import { PrintOSModal } from '../components/optica/PrintOSModal';

interface OrdensServicoProps {
  isNovaOSOpen: boolean;
  setIsNovaOSOpen: (open: boolean) => void;
}

export const OrdensServico: React.FC<OrdensServicoProps> = ({
  isNovaOSOpen,
  setIsNovaOSOpen
}) => {
  const { 
    ordensServico, 
    clientes, 
    receitas, 
    produtos, 
    laboratorios, 
    lojaAtiva, 
    usuarioAtual,
    funcionarios,
    criarOrdemServico, 
    atualizarStatusOS 
  } = useAuthAndTenant();

  const [viewMode, setViewMode] = useState<'KANBAN' | 'LISTA'>('KANBAN');
  const [busca, setBusca] = useState('');
  const [osParaImprimir, setOsParaImprimir] = useState<OrdemServicoOptica | null>(null);

  // =========================================================================
  // ESTADOS DO FORMULÁRIO COMPLETO DE NOVA ORDEM DE SERVIÇO
  // =========================================================================

  // 1. Dados do Cabeçalho e Cliente
  const [clienteId, setClienteId] = useState(clientes[0]?.id || '');
  const [dataOS, setDataOS] = useState(() => new Date().toISOString().split('T')[0]);
  const [dataEntrega, setDataEntrega] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [funcionarioNome, setFuncionarioNome] = useState(usuarioAtual?.nome || 'Consultor Óptico');
  const [responsavelTecnico, setResponsavelTecnico] = useState('Dr. Roberto Vasconcelos - RT 4821');
  const [codReferencia, setCodReferencia] = useState('');

  // 2. Produtos e Serviços (Lista de Itens Dinâmicos)
  const [itemBuscaNome, setItemBuscaNome] = useState('');
  const [itemValorUnit, setItemValorUnit] = useState(0);
  const [itemQtd, setItemQtd] = useState(1);
  const [itensOS, setItensOS] = useState<ItemProdutoServicoOS[]>([]);

  // 3. Receita Médica e Grade Óptica
  const [clienteTemReceita, setClienteTemReceita] = useState<'SIM' | 'NAO'>('SIM');
  const [dataExame, setDataExame] = useState(() => new Date().toISOString().split('T')[0]);
  const [medicoPrescritor, setMedicoPrescritor] = useState('');
  const [fotoReceita, setFotoReceita] = useState<string | null>(null);

  // Grade Óptica - Longe
  const [esfOD, setEsfOD] = useState<number>(0.00);
  const [cilOD, setCilOD] = useState<number>(0.00);
  const [eixoOD, setEixoOD] = useState<number>(0);
  const [esfOE, setEsfOE] = useState<number>(0.00);
  const [cilOE, setCilOE] = useState<number>(0.00);
  const [eixoOE, setEixoOE] = useState<number>(0);

  // Grade Óptica - Perto & Adição
  const [esfPertoOD, setEsfPertoOD] = useState<number>(0.00);
  const [cilPertoOD, setCilPertoOD] = useState<number>(0.00);
  const [eixoPertoOD, setEixoPertoOD] = useState<number>(0);
  const [esfPertoOE, setEsfPertoOE] = useState<number>(0.00);
  const [cilPertoOE, setCilPertoOE] = useState<number>(0.00);
  const [eixoPertoOE, setEixoPertoOE] = useState<number>(0);
  const [adicao, setAdicao] = useState<number>(0.00);

  // 4. Pupilômetro & Medidas de Montagem
  const [altOD, setAltOD] = useState<number>(0);
  const [altOE, setAltOE] = useState<number>(0);
  const [dnpOD, setDnpOD] = useState<number>(0);
  const [dnpOE, setDnpOE] = useState<number>(0);
  const [dpTotal, setDpTotal] = useState<number>(0);
  const [aroHorizontal, setAroHorizontal] = useState<number>(0);
  const [aroVertical, setAroVertical] = useState<number>(0);
  const [ponte, setPonte] = useState<number>(0);
  const [diagonalMaior, setDiagonalMaior] = useState<number>(0);

  // 5. Lente & Laboratório
  const [tipoLenteFab, setTipoLenteFab] = useState<'PRONTA' | 'SURFACADA'>('PRONTA');
  const [materialLente, setMaterialLente] = useState<'RESINA_1.56' | 'POLICARBONATO_1.59' | 'TRIVEX_1.53' | 'ALTO_INDICE_1.67' | 'ALTO_INDICE_1.74' | 'CRISTAL'>('RESINA_1.56');
  const [coloracao, setColoracao] = useState('Incolor');
  const [tratamento, setTratamento] = useState('Antirreflexo');
  const [laboratorioId, setLaboratorioId] = useState(laboratorios[0]?.id || '');
  const [localMontagem, setLocalMontagem] = useState<'LOJA' | 'LABORATORIO'>('LOJA');

  // 6. Armação & Formato
  const [segueArmacao, setSegueArmacao] = useState<'SIM' | 'NAO'>('SIM');
  const [armacaoPropria, setArmacaoPropria] = useState<'SIM' | 'NAO'>('NAO');
  const [tipoArmacao, setTipoArmacao] = useState('Aro Total (Acetato / Metal)');
  const [formatoArmacao, setFormatoArmacao] = useState<string>('RECTANGLE');

  // 7. Fotos da O.S. (Galeria de até 5 fotos)
  const [fotosOS, setFotosOS] = useState<string[]>([]);

  // 8. Observações & Desconto
  const [observacao, setObservacao] = useState('');
  const [desconto, setDesconto] = useState(0);

  // Atualiza DP total automaticamente ao mudar DNP
  useEffect(() => {
    setDpTotal(Number((dnpOD + dnpOE).toFixed(1)));
  }, [dnpOD, dnpOE]);

  // Atualiza campo perto ao mudar adição
  useEffect(() => {
    if (adicao > 0) {
      setEsfPertoOD(Number((esfOD + adicao).toFixed(2)));
      setEsfPertoOE(Number((esfOE + adicao).toFixed(2)));
    }
  }, [esfOD, esfOE, adicao]);

  // Formatos Visuais com SVGs Profissionais
  const FORMATOS_ARMACAO = [
    { id: 'ROUND', label: 'Redondo', svg: (
      <svg className="w-8 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 40 24">
        <circle cx="11" cy="12" r="8" />
        <circle cx="29" cy="12" r="8" />
        <path d="M19 12h2" />
      </svg>
    )},
    { id: 'OVAL', label: 'Oval', svg: (
      <svg className="w-8 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 40 24">
        <ellipse cx="11" cy="12" rx="9" ry="7" />
        <ellipse cx="29" cy="12" rx="9" ry="7" />
        <path d="M20 12h0.5" />
      </svg>
    )},
    { id: 'SQUARE', label: 'Quadrado', svg: (
      <svg className="w-8 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 40 24">
        <rect x="3" y="5" width="15" height="14" rx="2" />
        <rect x="22" y="5" width="15" height="14" rx="2" />
        <path d="M18 10h4" />
      </svg>
    )},
    { id: 'RECTANGLE', label: 'Retangular', svg: (
      <svg className="w-8 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 40 24">
        <rect x="2" y="7" width="16" height="10" rx="1.5" />
        <rect x="22" y="7" width="16" height="10" rx="1.5" />
        <path d="M18 11h4" />
      </svg>
    )},
    { id: 'CAT_EYE', label: 'Gatinho', svg: (
      <svg className="w-8 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 40 24">
        <path d="M3 14c0 3 4 5 8 5s8-2 8-5c0-4-3-8-8-8-4 0-8 3-8 8z" />
        <path d="M21 14c0 3 4 5 8 5s8-2 8-5c0-4-3-8-8-8-4 0-8 3-8 8z" />
        <path d="M19 11h2" />
      </svg>
    )},
    { id: 'AVIATOR', label: 'Aviador', svg: (
      <svg className="w-8 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 40 24">
        <path d="M4 8c2-3 10-3 12 0 1 3 0 9-6 9-5 0-7-5-6-9z" />
        <path d="M24 8c2-3 10-3 12 0 1 3 0 9-6 9-5 0-7-5-6-9z" />
        <path d="M16 8h8M16 11h8" />
      </svg>
    )},
    { id: 'HEXAGONAL', label: 'Hexagonal', svg: (
      <svg className="w-8 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 40 24">
        <polygon points="10,5 16,8 16,16 10,19 4,16 4,8" />
        <polygon points="30,5 36,8 36,16 30,19 24,16 24,8" />
        <path d="M16 12h8" />
      </svg>
    )},
    { id: 'BUTTERFLY', label: 'Borboleta', svg: (
      <svg className="w-8 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 40 24">
        <path d="M3 6c4 1 8 0 8 4 0 5-5 9-8 7 0-4-1-8 0-11z" />
        <path d="M37 6c-4 1-8 0-8 4 0 5 5 9 8 7 0-4 1-8 0-11z" />
        <path d="M11 10h18" />
      </svg>
    )}
  ];

  // Inclusão de Produto / Serviço na tabela da O.S.
  const handleIncluirItem = () => {
    if (!itemBuscaNome || itemValorUnit <= 0) {
      alert('Informe a descrição e o valor unitário do item.');
      return;
    }

    const novoItem: ItemProdutoServicoOS = {
      id: Date.now().toString(),
      nome: itemBuscaNome,
      quantidade: itemQtd,
      valor_unitario: itemValorUnit,
      valor_total: itemValorUnit * itemQtd
    };

    setItensOS(prev => [...prev, novoItem]);
    setItemBuscaNome('');
    setItemValorUnit(0);
    setItemQtd(1);
  };

  const handleRemoverItem = (id: string) => {
    setItensOS(prev => prev.filter(i => i.id !== id));
  };

  // Puxa receita cadastrada do cliente
  const handleBuscarReceitaCliente = () => {
    const rec = receitas.find(r => r.cliente_id === clienteId) || receitas[0];
    if (rec) {
      setEsfOD(rec.longe_esferico_od || 0);
      setCilOD(rec.longe_cilindrico_od || 0);
      setEixoOD(rec.longe_eixo_od || 0);
      setEsfOE(rec.longe_esferico_oe || 0);
      setCilOE(rec.longe_cilindrico_oe || 0);
      setEixoOE(rec.longe_eixo_oe || 0);
      setAdicao(rec.adicao || 0);
      setMedicoPrescritor(rec.medico_prescritor || medicoPrescritor);
      setDataExame(rec.data_emissao ? rec.data_emissao.split('T')[0] : dataExame);
      setClienteTemReceita('SIM');
      alert(`✅ Receita de ${rec.cliente_nome} importada com sucesso!`);
    } else {
      alert('Nenhuma receita prévia encontrada para este cliente.');
    }
  };

  // Totais Calculados
  const subtotalItens = itensOS.reduce((acc, curr) => acc + curr.valor_total, 0);
  const totalFinalOS = Math.max(0, subtotalItens - desconto);

  // Criação da O.S.
  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    const cliente = clientes.find(c => c.id === clienteId);
    const lab = laboratorios.find(l => l.id === laboratorioId);

    if (!cliente) {
      alert('Selecione um cliente para abrir a O.S.');
      return;
    }

    const novaOS = criarOrdemServico({
      cliente_id: cliente.id,
      cliente_nome: cliente.nome,
      cliente_telefone: cliente.telefone,
      atendente_id: usuarioAtual?.id || '1',
      atendente_nome: funcionarioNome,
      responsavel_tecnico: responsavelTecnico,
      codigo_referencia: codReferencia || undefined,
      laboratorio_id: lab?.id,
      laboratorio_nome: lab?.nome,
      status: 'AGUARDANDO_LABORATORIO',
      
      // Itens
      itens: itensOS,

      // Receita
      tem_receita: clienteTemReceita === 'SIM',
      data_exame: dataExame,
      medico_prescritor: medicoPrescritor,
      grade_esferico_od: esfOD,
      grade_cilindrico_od: cilOD,
      grade_eixo_od: eixoOD,
      grade_esferico_oe: esfOE,
      grade_cilindrico_oe: cilOE,
      grade_eixo_oe: eixoOE,
      grade_perto_esferico_od: esfPertoOD,
      grade_perto_cilindrico_od: cilPertoOD,
      grade_perto_eixo_od: eixoPertoOD,
      grade_perto_esferico_oe: esfPertoOE,
      grade_perto_cilindrico_oe: cilPertoOE,
      grade_perto_eixo_oe: eixoPertoOE,
      grade_adicao: adicao,
      foto_receita_url: fotoReceita || undefined,

      // Pupilômetro & Medidas
      altura_od: altOD,
      altura_oe: altOE,
      dnp_od: dnpOD,
      dnp_oe: dnpOE,
      dp_total: dpTotal,
      aro_horizontal_mm: aroHorizontal,
      aro_vertical_mm: aroVertical,
      ponte_mm: ponte,
      maior_diagonal_mm: diagonalMaior,

      // Lente & Laboratório
      tipo_lente_fabricacao: tipoLenteFab,
      lente_descricao: `Lente ${materialLente} (${tipoLenteFab}) - ${tratamento}`,
      lente_material: materialLente,
      lente_coloracao: coloracao,
      lente_design: adicao > 0 ? 'MULTIFOCAL_PROGRESSIVA' : 'MONOFOCAL',
      tratamentos: [tratamento],
      local_montagem: localMontagem,

      // Armação & Formato
      segue_armacao: segueArmacao === 'SIM',
      armacao_propria: armacaoPropria === 'SIM',
      tipo_armacao: tipoArmacao,
      formato_armacao: formatoArmacao,
      armacao_descricao: itensOS[0]?.nome || 'Armação Receituário',
      fotos_os: fotosOS,

      // Valores
      valor_armacao: itensOS[0]?.valor_total || 0,
      valor_lentes: itensOS[1]?.valor_total || 0,
      valor_tratamentos: 0,
      valor_servicos_montagem: itensOS[2]?.valor_total || 0,
      custo_laboratorio_estimado: subtotalItens * 0.35,
      valor_desconto: desconto,
      valor_total: totalFinalOS,
      data_abertura: `${dataOS}T12:00:00Z`,
      data_prometida: `${dataEntrega}T18:00:00Z`,
      observacoes_internas: observacao
    });

    setIsNovaOSOpen(false);
    setOsParaImprimir(novaOS);
  };

  const colunasKanban: { status: StatusOSOptica; title: string; color: string }[] = [
    { status: 'AGUARDANDO_LABORATORIO', title: 'Aguardando Lab', color: 'border-amber-500' },
    { status: 'EM_SURFACAGEM', title: 'Em Surfaçagem', color: 'border-purple-500' },
    { status: 'EM_MONTAGEM', title: 'Montagem Bancada', color: 'border-blue-500' },
    { status: 'CONTROLE_QUALIDADE', title: 'Controle Qualidade', color: 'border-cyan-500' },
    { status: 'PRONTO_RETIRADA', title: 'Pronto p/ Retirada', color: 'border-emerald-500' },
    { status: 'ENTREGUE', title: 'Entregue / Concluído', color: 'border-slate-500' },
  ];

  const osFiltradas = ordensServico.filter(o => 
    o.cliente_nome.toLowerCase().includes(busca.toLowerCase()) ||
    o.numero_os.toString().includes(busca) ||
    o.armacao_descricao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl">
      
      {/* Topo do Módulo de O.S. */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0284C7]" /> Ordens de Serviço Ópticas (O.S.)
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Gestão completa de montagem, prescrições OD/OE, pupilometria e envelopes de laboratório.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded border border-slate-200 dark:border-zinc-700 text-xs">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'KANBAN' 
                  ? 'bg-white dark:bg-zinc-900 text-[#0284C7] shadow-xs' 
                  : 'text-slate-500'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('LISTA')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'LISTA' 
                  ? 'bg-white dark:bg-zinc-900 text-[#0284C7] shadow-xs' 
                  : 'text-slate-500'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Lista
            </button>
          </div>

          <button
            onClick={() => setIsNovaOSOpen(true)}
            className="neo-button-primary !py-1.5 text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Nova O.S.
          </button>
        </div>
      </div>

      {/* Barra de Busca Rápida */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por O.S. #, paciente, armação ou código..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="neo-input !pl-9 text-xs"
        />
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 overflow-x-auto pb-4 items-start">
          {colunasKanban.map(col => {
            const osNestaColuna = osFiltradas.filter(o => o.status === col.status);

            return (
              <div
                key={col.status}
                className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-lg p-2.5 space-y-2.5 min-w-[220px]"
              >
                <div className={`border-t-2 ${col.color} pt-1.5 flex items-center justify-between`}>
                  <span className="font-bold text-[11px] text-slate-800 dark:text-zinc-200 uppercase tracking-tight">
                    {col.title}
                  </span>
                  <span className="font-mono text-[10px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.2 rounded font-bold">
                    {osNestaColuna.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-0.5">
                  {osNestaColuna.map(os => (
                    <div
                      key={os.id}
                      className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-3 shadow-2xs space-y-2 hover:border-[#0284C7] transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono font-bold text-xs text-[#0284C7]">
                          O.S. #{os.numero_os}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(os.data_prometida).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 truncate">
                          {os.cliente_nome}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {os.armacao_descricao}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-2 flex justify-between items-center text-[10px]">
                        <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                          R$ {os.valor_total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => setOsParaImprimir(os)}
                          className="text-[#0284C7] hover:underline flex items-center gap-0.5 font-semibold"
                        >
                          <Printer className="w-3 h-3" /> Imprimir
                        </button>
                      </div>
                    </div>
                  ))}
                  {osNestaColuna.length === 0 && (
                    <div className="py-6 text-center text-[10px] text-slate-400 italic">
                      Nenhuma O.S.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LISTA VIEW */
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 font-semibold border-b border-slate-200 dark:border-zinc-800">
                <th className="py-2.5 px-3">O.S. #</th>
                <th className="py-2.5 px-3">Paciente / Cliente</th>
                <th className="py-2.5 px-3">Armação & Lente</th>
                <th className="py-2.5 px-3">Laboratório</th>
                <th className="py-2.5 px-3">Data Entrega</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Valor</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {osFiltradas.map(os => (
                <tr key={os.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                  <td className="py-3 px-3 font-mono font-bold text-[#0284C7]">#{os.numero_os}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-zinc-100">{os.cliente_nome}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-zinc-400">{os.armacao_descricao}</td>
                  <td className="py-3 px-3 text-slate-500">{os.laboratorio_nome || 'Bancada Loja'}</td>
                  <td className="py-3 px-3 font-mono">{new Date(os.data_prometida).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-3">
                    <Badge variant={os.status === 'PRONTO_RETIRADA' ? 'success' : 'info'}>{os.status}</Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">R$ {os.valor_total.toFixed(2)}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setOsParaImprimir(os)}
                      className="p-1 text-slate-500 hover:text-[#0284C7]"
                      title="Imprimir Envelope de O.S."
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL COMPLETO DE NOVA ORDEM DE SERVIÇO (PADRÃO TEKÓTICA EXPANDIDO)       */}
      {/* ========================================================================= */}
      {isNovaOSOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#101014] border border-slate-300 dark:border-zinc-700 rounded-xl shadow-2xl w-full max-w-5xl my-4 text-xs overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Cabeçalho do Modal */}
            <div className="bg-slate-50 dark:bg-zinc-900 px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#0284C7] text-white flex items-center justify-center font-bold shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    Nova Ordem de Serviço (O.S.)
                    <span className="font-mono text-xs text-[#0284C7] bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded border border-sky-200">
                      O.S. #{ordensServico.length + 1045}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500">Preencha os dados do paciente, itens vendidos, prescrição médica e medições.</p>
                </div>
              </div>
              <button
                onClick={() => setIsNovaOSOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Rolável do Formulário */}
            <form onSubmit={handleCreateOS} className="overflow-y-auto p-5 space-y-5 flex-1 font-sans">
              
              {/* 1. SEÇÃO: DADOS DO CLIENTE & CABEÇALHO */}
              <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <User className="w-3.5 h-3.5 text-[#0284C7]" /> Dados do Cliente & Identificação da O.S.
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1 text-[11px]">
                      Pesquisar Cliente / Paciente *
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        value={clienteId}
                        onChange={e => setClienteId(e.target.value)}
                        className="neo-select flex-1 text-xs"
                        required
                      >
                        {clientes.map(c => (
                          <option key={c.id} value={c.id}>{c.nome} - CPF: {c.cpf || 'Não inf.'} ({c.telefone})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => alert('Para cadastrar novo cliente, acesse o menu Clientes & Pacientes.')}
                        className="neo-button-secondary !px-2.5"
                        title="Cadastrar Novo Cliente"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1 text-[11px]">Data O.S. *</label>
                    <input
                      type="date"
                      value={dataOS}
                      onChange={e => setDataOS(e.target.value)}
                      className="neo-input font-mono text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1 text-[11px]">Data Entrega Prometida *</label>
                    <input
                      type="date"
                      value={dataEntrega}
                      onChange={e => setDataEntrega(e.target.value)}
                      className="neo-input font-mono text-xs font-bold text-[#0284C7]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1 text-[11px]">Funcionário / Atendente *</label>
                    <input
                      type="text"
                      value={funcionarioNome}
                      onChange={e => setFuncionarioNome(e.target.value)}
                      className="neo-input text-xs"
                      placeholder="Nome do consultor"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1 text-[11px]">Responsável Técnico (Óptico)</label>
                    <input
                      type="text"
                      value={responsavelTecnico}
                      onChange={e => setResponsavelTecnico(e.target.value)}
                      className="neo-input text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1 text-[11px]">Cód. Referência Interna (Tala/Envelope)</label>
                    <input
                      type="text"
                      value={codReferencia}
                      onChange={e => setCodReferencia(e.target.value)}
                      placeholder="Ex: ENV-2026-B9"
                      className="neo-input font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2. SEÇÃO: PRODUTOS & SERVIÇOS (COM INCLUSÃO RÁPIDA E TABELA) */}
              <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#0284C7]" /> Produtos / Serviços da O.S.
                  </h4>
                  <span className="font-mono text-xs font-bold text-[#0284C7]">
                    Subtotal: R$ {subtotalItens.toFixed(2)}
                  </span>
                </div>

                {/* Linha de Inclusão de Item */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                  <div className="sm:col-span-6">
                    <label className="block font-bold mb-1 text-[10px] text-slate-500 uppercase">Pesquisar Produto / Serviço *</label>
                    <input
                      type="text"
                      value={itemBuscaNome}
                      onChange={e => setItemBuscaNome(e.target.value)}
                      placeholder="Ex: Armação Ray-Ban, Lente Hoya, Ajuste de Aro..."
                      className="neo-input text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1 text-[10px] text-slate-500 uppercase">Valor Unit. (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemValorUnit || ''}
                      placeholder="0.00"
                      onChange={e => setItemValorUnit(parseFloat(e.target.value) || 0)}
                      className="neo-input font-mono font-bold text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1 text-[10px] text-slate-500 uppercase text-center">Qtd</label>
                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded px-1 py-1">
                      <button
                        type="button"
                        onClick={() => setItemQtd(Math.max(1, itemQtd - 1))}
                        className="p-0.5 text-slate-500 hover:text-slate-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={itemQtd}
                        onChange={e => setItemQtd(parseInt(e.target.value) || 1)}
                        className="w-full text-center font-mono font-bold text-xs bg-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setItemQtd(itemQtd + 1)}
                        className="p-0.5 text-slate-500 hover:text-slate-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleIncluirItem}
                      className="w-full bg-[#0284C7] hover:bg-sky-700 text-white font-bold py-2 rounded text-xs transition-colors flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Incluir Item
                    </button>
                  </div>
                </div>

                {/* Tabela de Itens Adicionados */}
                <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold border-b border-slate-200 dark:border-zinc-700">
                        <th className="py-2 px-3">Item / Descrição</th>
                        <th className="py-2 px-3 text-center">Qtd</th>
                        <th className="py-2 px-3 text-right">Valor Unit.</th>
                        <th className="py-2 px-3 text-right">Total</th>
                        <th className="py-2 px-3 text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {itensOS.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                          <td className="py-2 px-3 font-medium text-slate-900 dark:text-zinc-100">{item.nome}</td>
                          <td className="py-2 px-3 text-center font-mono">{item.quantidade}</td>
                          <td className="py-2 px-3 text-right font-mono">R$ {item.valor_unitario.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#0284C7]">R$ {item.valor_total.toFixed(2)}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoverItem(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Remover Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {itensOS.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                            Nenhum produto ou serviço incluído na O.S.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. SEÇÃO: RECEITA MÉDICA & GRADE ÓPTICA */}
              <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Glasses className="w-3.5 h-3.5 text-[#0284C7]" /> Prescrição / Receita Médica (OD & OE)
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleBuscarReceitaCliente}
                      className="px-2.5 py-1 rounded text-[11px] font-bold bg-sky-50 dark:bg-sky-950 text-[#0284C7] border border-sky-200 hover:bg-sky-100 flex items-center gap-1 transition-all"
                    >
                      <Search className="w-3 h-3" /> Buscar Receita Cadastrada
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Data do Exame</label>
                    <input
                      type="date"
                      value={dataExame}
                      onChange={e => setDataExame(e.target.value)}
                      className="neo-input text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Oftalmo / Optometrista</label>
                    <input
                      type="text"
                      value={medicoPrescritor}
                      onChange={e => setMedicoPrescritor(e.target.value)}
                      className="neo-input text-xs"
                      placeholder="Ex: Dr. Lucas Medeiros"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Cliente Possui Receita?</label>
                    <div className="flex gap-4 pt-1.5 text-xs font-semibold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="tem_rec"
                          checked={clienteTemReceita === 'SIM'}
                          onChange={() => setClienteTemReceita('SIM')}
                          className="text-[#0284C7]"
                        />
                        <span>Sim</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="tem_rec"
                          checked={clienteTemReceita === 'NAO'}
                          onChange={() => setClienteTemReceita('NAO')}
                          className="text-[#0284C7]"
                        />
                        <span>Não (Sem Grau / Plano)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Grade Óptica Visual Longe e Perto */}
                <div className="overflow-x-auto border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 bg-slate-50 dark:bg-zinc-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Grade Longe */}
                    <div className="space-y-1.5">
                      <span className="font-bold text-[11px] text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                        🔵 Visão de Longe
                      </span>
                      <table className="w-full text-center text-xs font-mono">
                        <thead>
                          <tr className="bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[10px] font-bold">
                            <th className="py-1 px-1">Olho</th>
                            <th className="py-1 px-1">Esférico</th>
                            <th className="py-1 px-1">Cilíndrico</th>
                            <th className="py-1 px-1">Eixo (°)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-zinc-700 bg-white dark:bg-zinc-900">
                          <tr>
                            <td className="py-1 px-1 font-bold text-sky-600">OD</td>
                            <td className="p-0.5">
                              <input type="number" step="0.25" value={esfOD} onChange={e => setEsfOD(parseFloat(e.target.value) || 0)} className="w-full text-center py-1 font-bold text-xs bg-transparent outline-none" />
                            </td>
                            <td className="p-0.5">
                              <input type="number" step="0.25" value={cilOD} onChange={e => setCilOD(parseFloat(e.target.value) || 0)} className="w-full text-center py-1 text-xs bg-transparent outline-none" />
                            </td>
                            <td className="p-0.5">
                              <input type="number" min="0" max="180" value={eixoOD} onChange={e => setEixoOD(parseInt(e.target.value) || 0)} className="w-full text-center py-1 text-xs bg-transparent outline-none" />
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 px-1 font-bold text-sky-600">OE</td>
                            <td className="p-0.5">
                              <input type="number" step="0.25" value={esfOE} onChange={e => setEsfOE(parseFloat(e.target.value) || 0)} className="w-full text-center py-1 font-bold text-xs bg-transparent outline-none" />
                            </td>
                            <td className="p-0.5">
                              <input type="number" step="0.25" value={cilOE} onChange={e => setCilOE(parseFloat(e.target.value) || 0)} className="w-full text-center py-1 text-xs bg-transparent outline-none" />
                            </td>
                            <td className="p-0.5">
                              <input type="number" min="0" max="180" value={eixoOE} onChange={e => setEixoOE(parseInt(e.target.value) || 0)} className="w-full text-center py-1 text-xs bg-transparent outline-none" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Grade Perto & Adição */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[11px] text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                          🔴 Visão de Perto
                        </span>
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] font-bold text-emerald-600 uppercase">Adição (+):</label>
                          <input
                            type="number"
                            step="0.25"
                            value={adicao}
                            onChange={e => setAdicao(parseFloat(e.target.value) || 0)}
                            className="w-16 text-center font-mono font-bold text-xs bg-white dark:bg-zinc-800 border border-emerald-300 rounded px-1 py-0.5 text-emerald-700"
                          />
                        </div>
                      </div>

                      <table className="w-full text-center text-xs font-mono">
                        <thead>
                          <tr className="bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[10px] font-bold">
                            <th className="py-1 px-1">Olho</th>
                            <th className="py-1 px-1">Esférico</th>
                            <th className="py-1 px-1">Cilíndrico</th>
                            <th className="py-1 px-1">Eixo (°)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-zinc-700 bg-white dark:bg-zinc-900">
                          <tr>
                            <td className="py-1 px-1 font-bold text-rose-600">OD</td>
                            <td className="p-0.5">
                              <input type="number" step="0.25" value={esfPertoOD} onChange={e => setEsfPertoOD(parseFloat(e.target.value) || 0)} className="w-full text-center py-1 font-bold text-xs bg-transparent outline-none" />
                            </td>
                            <td className="p-0.5">
                              <input type="number" step="0.25" value={cilPertoOD} onChange={e => setCilPertoOD(parseFloat(e.target.value) || 0)} className="w-full text-center py-1 text-xs bg-transparent outline-none" />
                            </td>
                            <td className="p-0.5">
                              <input type="number" min="0" max="180" value={eixoPertoOD} onChange={e => setEixoPertoOD(parseInt(e.target.value) || 0)} className="w-full text-center py-1 text-xs bg-transparent outline-none" />
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 px-1 font-bold text-rose-600">OE</td>
                            <td className="p-0.5">
                              <input type="number" step="0.25" value={esfPertoOE} onChange={e => setEsfPertoOE(parseFloat(e.target.value) || 0)} className="w-full text-center py-1 font-bold text-xs bg-transparent outline-none" />
                            </td>
                            <td className="p-0.5">
                              <input type="number" step="0.25" value={cilPertoOE} onChange={e => setCilPertoOE(parseFloat(e.target.value) || 0)} className="w-full text-center py-1 text-xs bg-transparent outline-none" />
                            </td>
                            <td className="p-0.5">
                              <input type="number" min="0" max="180" value={eixoPertoOE} onChange={e => setEixoPertoOE(parseInt(e.target.value) || 0)} className="w-full text-center py-1 text-xs bg-transparent outline-none" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>
              </div>

              {/* 4. SEÇÃO: PUPILÔMETRO & MEDIDAS DE MONTAGEM */}
              <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" /> Pupilômetro & Medições Ópticas (mm)
                  </h4>
                  <button
                    type="button"
                    onClick={() => alert('Pupilômetro Digital Integrado: Posicione o paciente de frente para a câmera.')}
                    className="px-2.5 py-1 rounded text-[11px] font-bold bg-[#0284C7] hover:bg-sky-600 text-white flex items-center gap-1 shadow-xs transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" /> Abrir Pupilômetro Digital
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-9 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-2 rounded border border-slate-200 dark:border-zinc-700">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Altura OD</label>
                    <input type="number" step="0.5" value={altOD} onChange={e => setAltOD(parseFloat(e.target.value) || 0)} className="w-full text-center font-bold text-xs bg-white dark:bg-zinc-900 rounded py-1 border border-slate-300 dark:border-zinc-600" />
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-2 rounded border border-slate-200 dark:border-zinc-700">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Altura OE</label>
                    <input type="number" step="0.5" value={altOE} onChange={e => setAltOE(parseFloat(e.target.value) || 0)} className="w-full text-center font-bold text-xs bg-white dark:bg-zinc-900 rounded py-1 border border-slate-300 dark:border-zinc-600" />
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-2 rounded border border-slate-200 dark:border-zinc-700">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">DNP OD</label>
                    <input type="number" step="0.5" value={dnpOD} onChange={e => setDnpOD(parseFloat(e.target.value) || 0)} className="w-full text-center font-bold text-xs bg-white dark:bg-zinc-900 rounded py-1 border border-slate-300 dark:border-zinc-600 text-sky-600" />
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-2 rounded border border-slate-200 dark:border-zinc-700">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">DNP OE</label>
                    <input type="number" step="0.5" value={dnpOE} onChange={e => setDnpOE(parseFloat(e.target.value) || 0)} className="w-full text-center font-bold text-xs bg-white dark:bg-zinc-900 rounded py-1 border border-slate-300 dark:border-zinc-600 text-sky-600" />
                  </div>

                  <div className="bg-sky-50 dark:bg-sky-950/60 p-2 rounded border border-sky-300 dark:border-sky-800">
                    <label className="block text-[10px] text-sky-700 dark:text-sky-300 font-bold mb-1">DP Total</label>
                    <input type="number" step="0.5" value={dpTotal} onChange={e => setDpTotal(parseFloat(e.target.value) || 0)} className="w-full text-center font-black text-xs bg-white dark:bg-zinc-900 rounded py-1 border border-sky-300 text-[#0284C7]" />
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-2 rounded border border-slate-200 dark:border-zinc-700">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Aro (H)</label>
                    <input type="number" value={aroHorizontal} onChange={e => setAroHorizontal(parseFloat(e.target.value) || 0)} className="w-full text-center font-bold text-xs bg-white dark:bg-zinc-900 rounded py-1 border border-slate-300 dark:border-zinc-600" />
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-2 rounded border border-slate-200 dark:border-zinc-700">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Vertical (V)</label>
                    <input type="number" value={aroVertical} onChange={e => setAroVertical(parseFloat(e.target.value) || 0)} className="w-full text-center font-bold text-xs bg-white dark:bg-zinc-900 rounded py-1 border border-slate-300 dark:border-zinc-600" />
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-2 rounded border border-slate-200 dark:border-zinc-700">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Ponte</label>
                    <input type="number" value={ponte} onChange={e => setPonte(parseFloat(e.target.value) || 0)} className="w-full text-center font-bold text-xs bg-white dark:bg-zinc-900 rounded py-1 border border-slate-300 dark:border-zinc-600" />
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-2 rounded border border-slate-200 dark:border-zinc-700">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Diagonal</label>
                    <input type="number" value={diagonalMaior} onChange={e => setDiagonalMaior(parseFloat(e.target.value) || 0)} className="w-full text-center font-bold text-xs bg-white dark:bg-zinc-900 rounded py-1 border border-slate-300 dark:border-zinc-600" />
                  </div>
                </div>
              </div>

              {/* 5. SEÇÃO: LENTES & LABORATÓRIO */}
              <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <FlaskConical className="w-3.5 h-3.5 text-[#0284C7]" /> Lentes Oftálmicas & Laboratório
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Tipo da Lente</label>
                    <div className="flex gap-4 pt-1 text-xs font-semibold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="tipo_lente" checked={tipoLenteFab === 'PRONTA'} onChange={() => setTipoLenteFab('PRONTA')} className="text-[#0284C7]" />
                        <span>Pronta (Estoque)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="tipo_lente" checked={tipoLenteFab === 'SURFACADA'} onChange={() => setTipoLenteFab('SURFACADA')} className="text-[#0284C7]" />
                        <span>Surfaçada (FreeForm)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Material da Lente</label>
                    <select
                      value={materialLente}
                      onChange={e => setMaterialLente(e.target.value as any)}
                      className="neo-select text-xs"
                    >
                      <option value="RESINA_1.56">CR-39 / Resina Orgânica 1.50 / 1.56</option>
                      <option value="POLICARBONATO_1.59">Policarbonato 1.59 (Airwear / Resistente)</option>
                      <option value="TRIVEX_1.53">Trivex 1.53 (Ultra Resistente Parafuso)</option>
                      <option value="ALTO_INDICE_1.67">Resina Alto Índice 1.67 (Fina)</option>
                      <option value="ALTO_INDICE_1.74">Resina Ultra Alto Índice 1.74 (Extra Fina)</option>
                      <option value="CRISTAL">Cristal Mineral / Vidro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Coloração</label>
                    <input
                      type="text"
                      value={coloracao}
                      onChange={e => setColoracao(e.target.value)}
                      placeholder="Ex: Incolor, G-15, Cinza Degradê..."
                      className="neo-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Tratamento da Lente</label>
                    <input
                      type="text"
                      value={tratamento}
                      onChange={e => setTratamento(e.target.value)}
                      placeholder="Ex: Antirreflexo Crizal, Filtro Azul, Transitions"
                      className="neo-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Laboratório Parceiro</label>
                    <select
                      value={laboratorioId}
                      onChange={e => setLaboratorioId(e.target.value)}
                      className="neo-select text-xs"
                    >
                      {laboratorios.map(l => (
                        <option key={l.id} value={l.id}>{l.nome} ({l.cidade || 'Lab'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Local da Montagem</label>
                    <div className="flex gap-4 pt-1 text-xs font-semibold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="local_mont" checked={localMontagem === 'LOJA'} onChange={() => setLocalMontagem('LOJA')} className="text-[#0284C7]" />
                        <span>Loja (Bancada)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="local_mont" checked={localMontagem === 'LABORATORIO'} onChange={() => setLocalMontagem('LABORATORIO')} className="text-[#0284C7]" />
                        <span>Laboratório</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. SEÇÃO: ARMAÇÃO & FORMATO VISUAL */}
              <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <Glasses className="w-3.5 h-3.5 text-[#0284C7]" /> Dados da Armação & Formato
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Segue Armação?</label>
                    <div className="flex gap-4 pt-1 text-xs font-semibold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="segue_arm" checked={segueArmacao === 'SIM'} onChange={() => setSegueArmacao('SIM')} className="text-[#0284C7]" />
                        <span>Sim (Com a O.S.)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="segue_arm" checked={segueArmacao === 'NAO'} onChange={() => setSegueArmacao('NAO')} className="text-[#0284C7]" />
                        <span>Não (Vai depois)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Armação Própria do Cliente?</label>
                    <div className="flex gap-4 pt-1 text-xs font-semibold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="arm_prop" checked={armacaoPropria === 'SIM'} onChange={() => setArmacaoPropria('SIM')} className="text-[#0284C7]" />
                        <span>Sim</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="arm_prop" checked={armacaoPropria === 'NAO'} onChange={() => setArmacaoPropria('NAO')} className="text-[#0284C7]" />
                        <span>Não (Nova da Loja)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[11px]">Tipo da Armação</label>
                    <select
                      value={tipoArmacao}
                      onChange={e => setTipoArmacao(e.target.value)}
                      className="neo-select text-xs"
                    >
                      <option value="Aro Total (Acetato)">Aro Total - Acetato</option>
                      <option value="Aro Total (Metal)">Aro Total - Metal</option>
                      <option value="Fio de Nylon (Semi-Aro)">Fio de Nylon (Semi-Aro)</option>
                      <option value="Três Peças / Parafuso (Balgriff)">Três Peças / Parafuso (Balgriff)</option>
                      <option value="Clip-On Solar Magnético">Clip-On Solar Magnético</option>
                      <option value="Óculos Solar">Óculos Solar</option>
                    </select>
                  </div>
                </div>

                {/* Seletor Visual de Formatos */}
                <div>
                  <label className="block font-bold mb-2 text-[11px] text-slate-700 dark:text-zinc-300">
                    Formato da Armação (Selecione o modelo):
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {FORMATOS_ARMACAO.map(fmt => (
                      <button
                        type="button"
                        key={fmt.id}
                        onClick={() => setFormatoArmacao(fmt.id)}
                        className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                          formatoArmacao === fmt.id
                            ? 'bg-sky-50 dark:bg-sky-950 border-[#0284C7] text-[#0284C7] shadow-xs scale-105 font-bold'
                            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                        }`}
                      >
                        {fmt.svg}
                        <span className="text-[10px] leading-none">{fmt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 7. SEÇÃO: IMAGENS DA ORDEM DE SERVIÇO (ATÉ 5 FOTOS) */}
              <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#0284C7]" /> Imagens da Ordem de Serviço ({fotosOS.length}/5 fotos)
                  </h4>
                  <span className="text-[10px] text-slate-400">Adicione fotos da armação, receita médica ou paciente</span>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  {fotosOS.map((foto, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-2xs">
                      <img src={foto} alt={`Foto O.S. ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFotosOS(fotosOS.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  ))}

                  {fotosOS.length < 5 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-[#0284C7] flex flex-col items-center justify-center text-slate-400 hover:text-[#0284C7] cursor-pointer transition-colors bg-slate-50 dark:bg-zinc-800/40">
                      <Upload className="w-5 h-5" />
                      <span className="text-[9px] font-bold mt-1">+ Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setFotosOS([...fotosOS, url]);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* 8. SEÇÃO: OBSERVAÇÕES & RESUMO FINANCEIRO */}
              <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <FileText className="w-3.5 h-3.5 text-[#0284C7]" /> Observações Técnicas & Fechamento Financeiro
                </h4>

                <div>
                  <label className="block font-bold mb-1 text-[11px]">Observações para o Laboratório / Bancada</label>
                  <textarea
                    rows={2}
                    value={observacao}
                    onChange={e => setObservacao(e.target.value)}
                    placeholder="Instruções de montagem, tipo de bizel, espessura mínima, detalhes da armação..."
                    className="neo-input text-xs"
                  />
                </div>

                {/* Resumo Financeiro */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-100 dark:bg-zinc-900 p-3 rounded-lg font-mono">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Subtotal Itens:</span>
                      <strong className="text-slate-800 dark:text-zinc-200">R$ {subtotalItens.toFixed(2)}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">Desconto (R$):</span>
                      <input
                        type="number"
                        step="0.01"
                        value={desconto || ''}
                        onChange={e => setDesconto(parseFloat(e.target.value) || 0)}
                        className="w-20 text-right bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2 py-0.5 font-mono text-xs font-bold text-rose-600"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Valor Total da O.S.</span>
                    <strong className="text-base font-black text-[#0284C7] dark:text-sky-400">
                      R$ {totalFinalOS.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNovaOSOpen(false)}
                  className="neo-button-secondary !py-2 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="neo-button-primary !py-2 text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" /> Salvar O.S. & Gerar Envelope
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal de Impressão do Envelope da O.S. */}
      {osParaImprimir && (
        <PrintOSModal
          os={osParaImprimir}
          loja={lojaAtiva}
          receita={receitas.find(r => r.id === osParaImprimir.receita_id)}
          onClose={() => setOsParaImprimir(null)}
        />
      )}

    </div>
  );
};
