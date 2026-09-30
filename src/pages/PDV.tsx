import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  QrCode, 
  DollarSign, 
  CheckCircle, 
  User, 
  Tag,
  Glasses,
  Printer,
  FileText,
  Boxes,
  ArrowRight,
  Wallet,
  Lock,
  Unlock,
  ArrowDownCircle,
  ArrowUpCircle,
  Gift,
  AlertTriangle,
  History,
  Check
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Produto, VendaPDV } from '../types';
import { PrintVendaModal } from '../components/common/PrintVendaModal';

export const PDV: React.FC = () => {
  const { 
    lojaAtiva,
    produtos, 
    clientes, 
    usuarioAtual, 
    realizarVendaPDV,
    turnoCaixaAtivo,
    abrirTurnoCaixa,
    fecharTurnoCaixa,
    realizarSangria,
    realizarSuprimento,
    utilizarValeCredito,
    trocasDevolucoes
  } = useAuthAndTenant();

  const [abaMobile, setAbaMobile] = useState<'CATALOGO' | 'CARRINHO'>('CATALOGO');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODOS');
  const [carrinho, setCarrinho] = useState<{
    produto: Produto;
    quantidade: number;
    desconto: number;
  }[]>([]);

  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'CREDIARIO_PROPRIO'>('PIX');
  const [parcelas, setParcelas] = useState<number>(1);
  const [vendaConcluida, setVendaConcluida] = useState<VendaPDV | null>(null);

  // Vale Crédito aplicado
  const [codigoValeInput, setCodigoValeInput] = useState('');
  const [descontoValeCredito, setDescontoValeCredito] = useState(0);
  const [valeAplicadoCodigo, setValeAplicadoCodigo] = useState<string | null>(null);

  // Modais de Gestão de Caixa
  const [modalAbrirCaixa, setModalAbrirCaixa] = useState(false);
  const [valorAberturaInput, setValorAberturaInput] = useState('100.00');
  
  const [modalSangria, setModalSangria] = useState(false);
  const [valorSangriaInput, setValorSangriaInput] = useState('');
  const [motivoSangriaInput, setMotivoSangriaInput] = useState('');

  const [modalSuprimento, setModalSuprimento] = useState(false);
  const [valorSuprimentoInput, setValorSuprimentoInput] = useState('');
  const [motivoSuprimentoInput, setMotivoSuprimentoInput] = useState('');

  const [modalFecharCaixa, setModalFecharCaixa] = useState(false);
  const [contagemDinheiro, setContagemDinheiro] = useState('');
  const [contagemPix, setContagemPix] = useState('');
  const [contagemDebito, setContagemDebito] = useState('');
  const [contagemCredito, setContagemCredito] = useState('');
  const [obsFechamento, setObsFechamento] = useState('');
  const [fechamentoResumo, setFechamentoResumo] = useState<{
    diferenca: number;
    totalInformado: number;
    totalSistema: number;
  } | null>(null);

  const [modalValeCredito, setModalValeCredito] = useState(false);

  // Filtro de produtos
  const produtosFiltrados = produtos.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) ||
                       p.codigo_barras.includes(buscaProduto) ||
                       p.codigo_referencia.toLowerCase().includes(buscaProduto.toLowerCase());
    const matchCat = categoriaFiltro === 'TODOS' || p.tipo === categoriaFiltro;
    return matchBusca && matchCat && p.ativo;
  });

  const adicionarAoCarrinho = (prod: Produto) => {
    setCarrinho(prev => {
      const existe = prev.find(item => item.produto.id === prod.id);
      if (existe) {
        return prev.map(item => 
          item.produto.id === prod.id 
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { produto: prod, quantidade: 1, desconto: 0 }];
    });
  };

  const alterarQtd = (prodId: string, delta: number) => {
    setCarrinho(prev => prev.map(item => {
      if (item.produto.id === prodId) {
        const novaQtd = item.quantidade + delta;
        return novaQtd > 0 ? { ...item, quantidade: novaQtd } : item;
      }
      return item;
    }));
  };

  const removerDoCarrinho = (prodId: string) => {
    setCarrinho(prev => prev.filter(item => item.produto.id !== prodId));
  };

  const subtotal = carrinho.reduce((acc, item) => acc + (item.produto.preco_venda * item.quantidade), 0);
  const totalDescontosItens = carrinho.reduce((acc, item) => acc + (item.desconto * item.quantidade), 0);
  const totalDescontos = totalDescontosItens + descontoValeCredito;
  const totalFinal = Math.max(0, subtotal - totalDescontos);

  const handleValidarValeCredito = () => {
    if (!codigoValeInput.trim()) return;
    const vale = utilizarValeCredito(codigoValeInput.trim());
    if (vale) {
      setDescontoValeCredito(vale.valor_credito);
      setValeAplicadoCodigo(vale.codigo_vale);
      setModalValeCredito(false);
      setCodigoValeInput('');
      alert(`Vale-Crédito ${vale.codigo_vale} de R$ ${vale.valor_credito.toFixed(2)} aplicado com sucesso!`);
    } else {
      alert('Vale-Crédito não encontrado ou já utilizado.');
    }
  };

  const handleAbrirCaixa = () => {
    const val = parseFloat(valorAberturaInput) || 0;
    abrirTurnoCaixa(val);
    setModalAbrirCaixa(false);
  };

  const handleConfirmarSangria = () => {
    const val = parseFloat(valorSangriaInput) || 0;
    if (val <= 0) {
      alert('Informe um valor válido para sangria.');
      return;
    }
    realizarSangria(val, motivoSangriaInput || 'Sangria de Caixa');
    setModalSangria(false);
    setValorSangriaInput('');
    setMotivoSangriaInput('');
  };

  const handleConfirmarSuprimento = () => {
    const val = parseFloat(valorSuprimentoInput) || 0;
    if (val <= 0) {
      alert('Informe um valor válido para suprimento.');
      return;
    }
    realizarSuprimento(val, motivoSuprimentoInput || 'Suprimento de Caixa');
    setModalSuprimento(false);
    setValorSuprimentoInput('');
    setMotivoSuprimentoInput('');
  };

  const handleCalcularFechamentoCego = () => {
    if (!turnoCaixaAtivo) return;
    const din = parseFloat(contagemDinheiro) || 0;
    const pix = parseFloat(contagemPix) || 0;
    const deb = parseFloat(contagemDebito) || 0;
    const cred = parseFloat(contagemCredito) || 0;

    const totalInformado = din + pix + deb + cred;
    const totalSistema = turnoCaixaAtivo.total_dinheiro_sistema + 
      turnoCaixaAtivo.total_pix_sistema + 
      turnoCaixaAtivo.total_cartao_debito_sistema + 
      turnoCaixaAtivo.total_cartao_credito_sistema;
    const diferenca = totalInformado - totalSistema;

    setFechamentoResumo({ diferenca, totalInformado, totalSistema });
  };

  const handleConcluirFechamento = () => {
    const din = parseFloat(contagemDinheiro) || 0;
    const pix = parseFloat(contagemPix) || 0;
    const deb = parseFloat(contagemDebito) || 0;
    const cred = parseFloat(contagemCredito) || 0;

    fecharTurnoCaixa({
      dinheiroInformado: din,
      pixInformado: pix,
      cartaoDebitoInformado: deb,
      cartaoCreditoInformado: cred,
      observacoes: obsFechamento
    });

    setModalFecharCaixa(false);
    setFechamentoResumo(null);
    setContagemDinheiro('');
    setContagemPix('');
    setContagemDebito('');
    setContagemCredito('');
    setObsFechamento('');
    alert('Turno de caixa fechado com sucesso!');
  };

  const handleFinalizarVenda = () => {
    if (carrinho.length === 0) {
      alert('O carrinho está vazio!');
      return;
    }

    const cli = clientes.find(c => c.id === clienteSelecionadoId);

    const novaVenda = realizarVendaPDV({
      cliente_id: cli?.id,
      cliente_nome: cli?.nome || 'Cliente Balcão Avulso',
      vendedor_id: usuarioAtual?.id || 'func-01',
      vendedor_nome: usuarioAtual?.nome || 'Consultor Óptico',
      itens: carrinho.map(item => ({
        produto_id: item.produto.id,
        nome: item.produto.nome,
        quantidade: item.quantidade,
        preco_unitario: item.produto.preco_venda,
        desconto: item.desconto,
        subtotal: (item.produto.preco_venda - item.desconto) * item.quantidade
      })),
      subtotal,
      desconto_total: totalDescontos,
      valor_final: totalFinal,
      forma_pagamento: formaPagamento,
      parcelas: formaPagamento === 'CARTAO_CREDITO' ? parcelas : 1,
      status: 'CONCLUIDA'
    });

    setVendaConcluida(novaVenda);
    setCarrinho([]);
    setDescontoValeCredito(0);
    setValeAplicadoCodigo(null);
    setAbaMobile('CATALOGO');
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* Header Responsivo & Caixa Status Bar */}
      <div className="bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950 text-[#0284C7] flex items-center justify-center font-bold shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Ponto de Venda & Caixa Operacional
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  turnoCaixaAtivo 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                }`}>
                  {turnoCaixaAtivo ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {turnoCaixaAtivo ? 'CAIXA ABERTO' : 'CAIXA FECHADO'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400">
                Vendas, emissão de cupons térmicos, controle de sangrias e suprimentos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {!turnoCaixaAtivo ? (
              <button
                onClick={() => setModalAbrirCaixa(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" /> Abrir Caixa
              </button>
            ) : (
              <>
                <button
                  onClick={() => setModalSuprimento(true)}
                  className="bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 font-semibold text-xs px-3 py-1.5 rounded-lg border border-sky-200 dark:border-sky-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" /> Suprimento
                </button>
                <button
                  onClick={() => setModalSangria(true)}
                  className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-semibold text-xs px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5" /> Sangria
                </button>
                <button
                  onClick={() => setModalFecharCaixa(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" /> Fechar Caixa
                </button>
              </>
            )}

            <button
              onClick={() => setModalValeCredito(true)}
              className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-semibold text-xs px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 flex items-center gap-1 cursor-pointer ml-auto sm:ml-0"
            >
              <Gift className="w-3.5 h-3.5" /> Vale-Crédito
            </button>
          </div>
        </div>

        {/* Resumo do Caixa Ativo */}
        {turnoCaixaAtivo && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] font-mono">
            <div className="bg-slate-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-400 block text-[10px]">Fundo Abertura:</span>
              <strong className="text-slate-800 dark:text-zinc-200">R$ {turnoCaixaAtivo.valor_abertura.toFixed(2)}</strong>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-400 block text-[10px]">Dinheiro em Gaveta:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">R$ {turnoCaixaAtivo.total_dinheiro_sistema.toFixed(2)}</strong>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-400 block text-[10px]">Entradas PIX:</span>
              <strong className="text-sky-600 dark:text-sky-400">R$ {turnoCaixaAtivo.total_pix_sistema.toFixed(2)}</strong>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-400 block text-[10px]">Cartões (Déb+Créd):</span>
              <strong className="text-indigo-600 dark:text-indigo-400">
                R$ {(turnoCaixaAtivo.total_cartao_debito_sistema + turnoCaixaAtivo.total_cartao_credito_sistema).toFixed(2)}
              </strong>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-slate-200 dark:border-zinc-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[10px]">Total Sangrias:</span>
              <strong className="text-amber-600 dark:text-amber-400">R$ {turnoCaixaAtivo.total_sangrias.toFixed(2)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Switcher de Abas no Mobile / Tablet (< lg) */}
      <div className="lg:hidden flex bg-slate-200/80 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-bold gap-1">
        <button
          onClick={() => setAbaMobile('CATALOGO')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            abaMobile === 'CATALOGO'
              ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Produtos ({produtosFiltrados.length})</span>
        </button>

        <button
          onClick={() => setAbaMobile('CARRINHO')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            abaMobile === 'CARRINHO'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Carrinho ({carrinho.length})</span>
          {carrinho.length > 0 && (
            <span className="ml-1 bg-white/20 px-1.5 py-0.2 rounded-full font-mono text-[10px]">
              R$ {totalFinal.toFixed(0)}
            </span>
          )}
        </button>
      </div>

      {/* Grid Principal do PDV */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Coluna 1 & 2: Catálogo de Produtos da Ótica */}
        <div className={`lg:col-span-2 bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4 ${
          abaMobile === 'CARRINHO' ? 'hidden lg:block' : 'block'
        }`}>
          
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Código de barras, ref ou modelo da armação..."
                value={buscaProduto}
                onChange={e => setBuscaProduto(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            {/* Categorias Rápidas */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {[
                { id: 'TODOS', label: 'Todos' },
                { id: 'ARMACAO_GRAU', label: 'Armações' },
                { id: 'SOLAR', label: 'Solares' },
                { id: 'LENTE_OFTALMICA', label: 'Lentes' },
                { id: 'ACESSORIO', label: 'Acessórios' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaFiltro(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all touch-manipulation ${
                    categoriaFiltro === cat.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Cards de Produtos Responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3 max-h-[550px] overflow-y-auto pr-1">
            {produtosFiltrados.map(prod => (
              <div
                key={prod.id}
                onClick={() => adicionarAoCarrinho(prod)}
                className="p-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 hover:border-[#0284C7] rounded-xl cursor-pointer transition-all flex flex-col justify-between space-y-2 group active:scale-[0.98] touch-manipulation shadow-2xs"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase truncate max-w-[120px]">{prod.marca}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.2 rounded text-slate-600 dark:text-zinc-300">
                      Est: {prod.estoque_atual}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 line-clamp-2 mt-1 group-hover:text-[#0284C7] transition-colors">
                    {prod.nome}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Ref: {prod.codigo_referencia}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 dark:border-zinc-800/80 pt-2 font-mono">
                  <span className="font-black text-sm text-slate-900 dark:text-zinc-100">
                    R$ {prod.preco_venda.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-[#0284C7] dark:text-sky-400 group-hover:underline">
                    + Adicionar
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Barra Flutuante de Atalho para o Carrinho no Mobile */}
          {carrinho.length > 0 && (
            <div className="lg:hidden pt-2">
              <button
                onClick={() => setAbaMobile('CARRINHO')}
                className="w-full bg-[#0284C7] hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center justify-between text-xs transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Ver Carrinho ({carrinho.length} itens)</span>
                </div>
                <div className="flex items-center gap-1 font-mono font-black">
                  <span>R$ {totalFinal.toFixed(2)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          )}

        </div>

        {/* Coluna 3: Cupom / Carrinho de Compras */}
        <div className={`bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 ${
          abaMobile === 'CATALOGO' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          <div className="space-y-3">
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#0284C7]" /> Carrinho de Venda
              </h3>
              <span className="text-xs font-mono bg-sky-100 dark:bg-sky-950 text-[#0284C7] dark:text-sky-300 px-2 py-0.5 rounded-full font-bold">
                {carrinho.length} itens
              </span>
            </div>

            {/* Seleção do Cliente */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                Cliente / Paciente:
              </label>
              <select
                value={clienteSelecionadoId}
                onChange={e => setClienteSelecionadoId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-zinc-200 outline-none focus:border-[#0284C7]"
              >
                <option value="">Cliente Balcão Avulso</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Itens do Carrinho */}
            <div className="space-y-2 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
              {carrinho.map(item => (
                <div key={item.produto.id} className="p-2.5 bg-slate-50 dark:bg-zinc-900/80 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate text-[11px]">
                      {item.produto.nome}
                    </span>
                    <button
                      onClick={() => removerDoCarrinho(item.produto.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center font-mono pt-1">
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-2 py-1 rounded-md border border-slate-200 dark:border-zinc-700">
                      <button onClick={() => alterarQtd(item.produto.id, -1)} className="p-0.5 hover:text-[#0284C7] touch-manipulation">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs min-w-[16px] text-center">{item.quantidade}</span>
                      <button onClick={() => alterarQtd(item.produto.id, 1)} className="p-0.5 hover:text-[#0284C7] touch-manipulation">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs">
                      R$ {(item.produto.preco_venda * item.quantidade).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {carrinho.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs italic">
                  Nenhum item adicionado ao carrinho.
                </div>
              )}
            </div>

            {/* Vale-Crédito Ativo */}
            {valeAplicadoCodigo && (
              <div className="bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 p-2 rounded-lg flex justify-between items-center text-xs">
                <span className="text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> Vale {valeAplicadoCodigo}:
                </span>
                <span className="text-purple-700 dark:text-purple-300 font-mono font-black">
                  - R$ {descontoValeCredito.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Formas de Pagamento e Checkout */}
          <div className="border-t border-slate-200 dark:border-zinc-800 pt-3 space-y-3">
            
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                Forma de Pagamento:
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                <button
                  onClick={() => setFormaPagamento('PIX')}
                  className={`py-2 rounded-lg border flex items-center justify-center gap-1 transition-all touch-manipulation ${
                    formaPagamento === 'PIX' ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-xs font-bold' : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" /> PIX
                </button>
                <button
                  onClick={() => setFormaPagamento('CARTAO_CREDITO')}
                  className={`py-2 rounded-lg border flex items-center justify-center gap-1 transition-all touch-manipulation ${
                    formaPagamento === 'CARTAO_CREDITO' ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-xs font-bold' : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Cartão
                </button>
                <button
                  onClick={() => setFormaPagamento('DINHEIRO')}
                  className={`py-2 rounded-lg border flex items-center justify-center gap-1 transition-all touch-manipulation ${
                    formaPagamento === 'DINHEIRO' ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-xs font-bold' : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Dinheiro
                </button>
              </div>
            </div>

            {formaPagamento === 'CARTAO_CREDITO' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Parcelamento Cartão:</label>
                <select
                  value={parcelas}
                  onChange={e => setParcelas(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                >
                  <option value="1">1x de R$ {totalFinal.toFixed(2)} à vista</option>
                  <option value="2">2x de R$ {(totalFinal / 2).toFixed(2)}</option>
                  <option value="3">3x de R$ {(totalFinal / 3).toFixed(2)}</option>
                  <option value="6">6x de R$ {(totalFinal / 6).toFixed(2)}</option>
                  <option value="10">10x de R$ {(totalFinal / 10).toFixed(2)}</option>
                  <option value="12">12x de R$ {(totalFinal / 12).toFixed(2)}</option>
                </select>
              </div>
            )}

            {/* Totalizador */}
            <div className="bg-slate-100 dark:bg-zinc-900/90 p-3 rounded-xl font-mono space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {totalDescontos > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Descontos / Vales:</span>
                  <span>- R$ {totalDescontos.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white border-t border-slate-300 dark:border-zinc-700 pt-1">
                <span>TOTAL:</span>
                <span className="text-[#0284C7] dark:text-sky-400">R$ {totalFinal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleFinalizarVenda}
              disabled={carrinho.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm tracking-wide shadow-md transition-all active:scale-[0.99] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {lojaAtiva.plano === 'pro_nf' 
                  ? 'Finalizar Venda & Emitir NFC-e' 
                  : 'Finalizar Venda & Emitir Cupom'}
              </span>
            </button>

            {lojaAtiva.plano === 'pro' && (
              <span className="text-[10px] text-slate-400 text-center block">
                Comprovante térmico de balcão • Emissão NFC-e SEFAZ exclusiva do <strong>Plano Pro + NF</strong>
              </span>
            )}

          </div>

        </div>

      </div>

      {/* Modal Abertura de Caixa */}
      {modalAbrirCaixa && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#151518] rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Abertura de Caixa</h3>
                <p className="text-xs text-slate-500">Informe o valor inicial de fundo de troco</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Fundo de Troco (R$):
              </label>
              <input
                type="number"
                step="0.01"
                value={valorAberturaInput}
                onChange={e => setValorAberturaInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl p-2.5 text-sm font-bold font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalAbrirCaixa(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAbrirCaixa}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
              >
                Confirmar Abertura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sangria */}
      {modalSangria && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#151518] rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                <ArrowDownCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Sangria de Caixa</h3>
                <p className="text-xs text-slate-500">Retirada justificada de dinheiro em gaveta</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Valor da Retirada (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={valorSangriaInput}
                  onChange={e => setValorSangriaInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl p-2.5 text-sm font-bold font-mono focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Motivo / Justificativa:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pagamento de motoboy, recolhimento cofre..."
                  value={motivoSangriaInput}
                  onChange={e => setMotivoSangriaInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl p-2 text-xs focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalSangria(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarSangria}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-md hover:bg-amber-700"
              >
                Registrar Sangria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suprimento */}
      {modalSuprimento && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#151518] rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Suprimento de Caixa</h3>
                <p className="text-xs text-slate-500">Aporte extra de troco em dinheiro</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Valor do Aporte (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={valorSuprimentoInput}
                  onChange={e => setValorSuprimentoInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl p-2.5 text-sm font-bold font-mono focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Motivo / Observação:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Moedas para troco..."
                  value={motivoSuprimentoInput}
                  onChange={e => setMotivoSuprimentoInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl p-2 text-xs focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalSuprimento(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarSuprimento}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white shadow-md hover:bg-sky-700"
              >
                Registrar Suprimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fechamento Cego de Caixa */}
      {modalFecharCaixa && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#151518] rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Fechamento Cego de Caixa</h3>
                <p className="text-xs text-slate-500">Conte os valores reais para apuração de diferenças</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Dinheiro Físico (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={contagemDinheiro}
                  onChange={e => setContagemDinheiro(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Comprovantes PIX (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={contagemPix}
                  onChange={e => setContagemPix(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Cartão Débito (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={contagemDebito}
                  onChange={e => setContagemDebito(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Cartão Crédito (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={contagemCredito}
                  onChange={e => setContagemCredito(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Observações de Fechamento:
              </label>
              <input
                type="text"
                placeholder="Ex: Diferença de centavos em troco..."
                value={obsFechamento}
                onChange={e => setObsFechamento(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg p-2 text-xs"
              />
            </div>

            {fechamentoResumo && (
              <div className={`p-3 rounded-xl border font-mono text-xs space-y-1 ${
                fechamentoResumo.diferenca === 0 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300' 
                  : fechamentoResumo.diferenca > 0
                  ? 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-300'
                  : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300'
              }`}>
                <div className="flex justify-between">
                  <span>Total Contado:</span>
                  <strong>R$ {fechamentoResumo.totalInformado.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total no Sistema:</span>
                  <strong>R$ {fechamentoResumo.totalSistema.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Resultado:</span>
                  <span>
                    {fechamentoResumo.diferenca === 0 
                      ? 'Caixa 100% Batido (R$ 0,00)' 
                      : fechamentoResumo.diferenca > 0 
                      ? `SOBRA DE CAIXA: +R$ ${fechamentoResumo.diferenca.toFixed(2)}` 
                      : `FALTA DE CAIXA: -R$ ${Math.abs(fechamentoResumo.diferenca).toFixed(2)}`}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalFecharCaixa(false)}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
              >
                Voltar
              </button>
              {!fechamentoResumo ? (
                <button
                  onClick={handleCalcularFechamentoCego}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                >
                  Conferir Valores
                </button>
              ) : (
                <button
                  onClick={handleConcluirFechamento}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md hover:bg-rose-700"
                >
                  Confirmar e Encerrar Turno
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Resgatar Vale Crédito */}
      {modalValeCredito && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#151518] rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Resgatar Vale-Crédito</h3>
                <p className="text-xs text-slate-500">Aplique o crédito de trocas ou devoluções</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Código do Vale (ex: VALE-123456):
              </label>
              <input
                type="text"
                placeholder="VALE-XXXXXX"
                value={codigoValeInput}
                onChange={e => setCodigoValeInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl p-2.5 text-sm font-bold font-mono focus:border-purple-500 outline-none uppercase"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalValeCredito(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleValidarValeCredito}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-md hover:bg-purple-700"
              >
                Aplicar Vale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impressão e Conclusão de Venda (Cupom Térmico / Carnê / Recibo) */}
      {vendaConcluida && (
        <PrintVendaModal
          venda={vendaConcluida}
          onClose={() => setVendaConcluida(null)}
        />
      )}

    </div>
  );
};

