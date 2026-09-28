import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Wallet, 
  Calendar, 
  CreditCard,
  UserCheck,
  FileBarChart,
  Lock,
  Unlock,
  ArrowDownCircle,
  ArrowUpCircle,
  PieChart,
  Printer
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Badge } from '../components/common/Badge';
import { PrintFechamentoCaixaModal } from '../components/common/PrintFechamentoCaixaModal';

export const Financeiro: React.FC = () => {
  const { transacoes, funcionarios, adicionarTransacao, lojaAtiva } = useAuthAndTenant();

  const [abaAtiva, setAbaAtiva] = useState<'CAIXA' | 'PAGAR' | 'RECEBER' | 'DRE'>('CAIXA');
  const [caixaAberto, setCaixaAberto] = useState(true);
  const [saldoInicial, setSaldoInicial] = useState(250.00);
  const [isModalDespesaOpen, setIsModalDespesaOpen] = useState(false);
  const [isModalPrintCaixaOpen, setIsModalPrintCaixaOpen] = useState(false);

  // Modal Financeiro Flexível (Receita ou Despesa)
  const [tipoModal, setTipoModal] = useState<'RECEITA' | 'DESPESA'>('DESPESA');
  const [favorecido, setFavorecido] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [statusLancamento, setStatusLancamento] = useState<'PAGO' | 'PENDENTE'>('PAGO');

  // Estado local para títulos a receber com possibilidade de baixa imediata
  const [titulosReceber, setTitulosReceber] = useState([
    { id: 'REC-101', data_vencimento: '2026-10-10', cliente: 'Mariana Silveira Albuquerque', origem: 'O.S. #1042 (Zeiss)', parcela: '2 de 3', valor: 545.00, status: 'PENDENTE' },
    { id: 'REC-102', data_vencimento: '2026-10-15', cliente: 'Rodrigo Augusto Fontana', origem: 'O.S. #1043 (Varilux)', parcela: '2 de 6', valor: 450.00, status: 'PENDENTE' },
    { id: 'REC-103', data_vencimento: '2026-09-25', cliente: 'Carlos Eduardo Mendes', origem: 'O.S. #1039 (Hoya)', parcela: '1 de 2', valor: 380.00, status: 'PAGO' }
  ]);

  const abrirModal = (tipo: 'RECEITA' | 'DESPESA') => {
    setTipoModal(tipo);
    setCategoria(tipo === 'RECEITA' ? 'Venda Direta / Balcão' : 'Laboratório Terceirizado');
    setDesc('');
    setValor(0);
    setFavorecido('');
    setStatusLancamento(abaAtiva === 'PAGAR' || abaAtiva === 'RECEBER' ? 'PENDENTE' : 'PAGO');
    setIsModalDespesaOpen(true);
  };

  const handleDarBaixaRecebimento = (tituloId: string) => {
    const titulo = titulosReceber.find(t => t.id === tituloId);
    if (!titulo) return;

    // Atualiza status do título para PAGO
    setTitulosReceber(prev => prev.map(t => t.id === tituloId ? { ...t, status: 'PAGO' } : t));

    // Adiciona transação de receita ao fluxo de caixa
    adicionarTransacao({
      tipo: 'RECEITA',
      categoria: 'Crediário Próprio / Parcela O.S.',
      descricao: `Recebimento Parcela ${titulo.parcela} - ${titulo.cliente} (${titulo.origem})`,
      valor: titulo.valor,
      status: 'PAGO',
      forma_pagamento: 'Dinheiro / PIX',
      data_vencimento: titulo.data_vencimento,
      data_pagamento: new Date().toISOString()
    });

    alert(`✅ Recebimento de R$ ${titulo.valor.toFixed(2)} confirmado e lançado no Caixa com sucesso!`);
  };

  // Form novo lançamento
  const [desc, setDesc] = useState('');
  const [categoria, setCategoria] = useState('Laboratório Terceirizado');
  const [valor, setValor] = useState(0);
  const [vencimento, setVencimento] = useState(new Date().toISOString().split('T')[0]);

  // Cálculos de Totais
  const totalReceitas = transacoes
    .filter(t => t.tipo === 'RECEITA' && t.status === 'PAGO')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'DESPESA' && t.status === 'PAGO')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const contasPagarPendentes = transacoes
    .filter(t => t.tipo === 'DESPESA' && t.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const contasReceberPendentes = titulosReceber
    .filter(t => t.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  // DRE Cálculos
  const receitaBruta = totalReceitaHojeOuMes(totalReceitas);
  const deducoesImpostosTaxas = receitaBruta * 0.045; // 4.5% Simples Nacional + Taxas de Cartão
  const receitaLiquida = receitaBruta - deducoesImpostosTaxas;
  const cmvCustosVariaveis = receitaBruta * 0.32; // 32% Custo das Lentes + Armações vendidas
  const margemContribuicao = receitaLiquida - cmvCustosVariaveis;
  const despesasFixas = 3200.00; // Aluguel loja, Energia, Sistema SaaS
  const lucroLiquidoDRE = margemContribuicao - despesasFixas;

  function totalReceitaHojeOuMes(total: number) {
    return total > 0 ? total + 12500.00 : 18500.00;
  }

  const handleSalvarLancamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || valor <= 0) {
      alert('Informe a descrição e o valor válido.');
      return;
    }

    if (tipoModal === 'RECEITA' && abaAtiva === 'RECEBER' && statusLancamento === 'PENDENTE') {
      // Adiciona como título a receber
      const novoTitulo = {
        id: `REC-${Date.now().toString().slice(-4)}`,
        data_vencimento: vencimento,
        cliente: favorecido || 'Cliente Balcão',
        origem: 'Lançamento Manual',
        parcela: '1 de 1',
        valor,
        status: 'PENDENTE'
      };
      setTitulosReceber(prev => [novoTitulo, ...prev]);
    } else {
      adicionarTransacao({
        tipo: tipoModal,
        categoria,
        descricao: `${desc}${favorecido ? ` (${favorecido})` : ''}`,
        valor,
        status: statusLancamento,
        forma_pagamento: formaPagamento,
        data_vencimento: vencimento,
        data_pagamento: statusLancamento === 'PAGO' ? new Date().toISOString() : undefined,
        cliente_ou_fornecedor: favorecido
      });
    }

    setIsModalDespesaOpen(false);
    setDesc('');
    setValor(0);
    setFavorecido('');
  };

  return (
    <div className="space-y-4 max-w-6xl">
      
      {/* Header com Ações Contextuais à Aba Ativa */}
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Gestão Financeira & Caixa
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Fluxo de Caixa diário, Contas a Pagar, Contas a Receber e Relatório DRE de Resultados.
            </p>
          </div>
        </div>

        {/* Botões Dinâmicos e Contextuais */}
        <div className="flex flex-wrap items-center gap-2">
          {abaAtiva === 'CAIXA' && (
            <>
              <button
                onClick={() => abrirModal('RECEITA')}
                className="px-3 py-1.5 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> + Entrada / Suprimento
              </button>
              <button
                onClick={() => abrirModal('DESPESA')}
                className="px-3 py-1.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-900 flex items-center gap-1 transition-colors"
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" /> - Saída / Sangria
              </button>
            </>
          )}

          {abaAtiva === 'PAGAR' && (
            <button
              onClick={() => abrirModal('DESPESA')}
              className="px-3 py-1.5 rounded text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> + Lançar Conta a Pagar (Despesa)
            </button>
          )}

          {abaAtiva === 'RECEBER' && (
            <button
              onClick={() => abrirModal('RECEITA')}
              className="px-3 py-1.5 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> + Lançar Conta a Receber / Carnê
            </button>
          )}

          {abaAtiva === 'DRE' && (
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 flex items-center gap-1 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" /> Imprimir DRE
            </button>
          )}
        </div>
      </div>

      {/* Submenus em Abas Conforme Especificação */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setAbaAtiva('CAIXA')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'CAIXA'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" /> Fluxo de Caixa (Balcão)
        </button>

        <button
          onClick={() => setAbaAtiva('PAGAR')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'PAGAR'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5 text-rose-300" /> Contas a Pagar
        </button>

        <button
          onClick={() => setAbaAtiva('RECEBER')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'RECEBER'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-300" /> Contas a Receber
        </button>

        <button
          onClick={() => setAbaAtiva('DRE')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'DRE'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <FileBarChart className="w-3.5 h-3.5 text-amber-300" /> Relatório DRE (Resultados)
        </button>
      </div>

      {/* ABA 1: FLUXO DE CAIXA */}
      {abaAtiva === 'CAIXA' && (
        <div className="space-y-4">
          
          {/* Card de Status do Caixa Balcão */}
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded flex items-center justify-center font-bold ${caixaAberto ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {caixaAberto ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Caixa Operacional Balcão</span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  Status: {caixaAberto ? 'CAIXA ABERTO' : 'CAIXA FECHADO'}
                  <span className="text-[10px] font-mono font-normal text-slate-500">
                    Fundo de Troco: R$ {saldoInicial.toFixed(2)}
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsModalPrintCaixaOpen(true)}
                className="px-3 py-1.5 rounded text-xs font-bold bg-slate-800 dark:bg-zinc-700 text-white hover:bg-slate-900 dark:hover:bg-zinc-600 flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" /> Imprimir Fechamento de Caixa
              </button>

              <button
                onClick={() => setCaixaAberto(!caixaAberto)}
                className={`px-3 py-1.5 rounded text-xs font-bold ${
                  caixaAberto 
                    ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {caixaAberto ? 'Fechar Caixa (Cego)' : 'Abrir Caixa do Dia'}
              </button>
            </div>
          </div>

          {/* Cards Rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-3.5">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Entradas em Dinheiro / PIX</span>
              <strong className="text-lg font-mono font-bold text-emerald-600">R$ {totalReceitas.toFixed(2)}</strong>
            </div>
            <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-3.5">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Saídas / Sangrias do Caixa</span>
              <strong className="text-lg font-mono font-bold text-rose-600">R$ {totalDespesas.toFixed(2)}</strong>
            </div>
            <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-3.5">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Saldo Atual na Gaveta</span>
              <strong className="text-lg font-mono font-bold text-slate-900 dark:text-white">R$ {(saldoInicial + saldoLiquido).toFixed(2)}</strong>
            </div>
          </div>

          {/* Extrato do Caixa */}
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F1F5F9] dark:bg-zinc-900 text-slate-600 font-semibold border-b border-slate-200 dark:border-zinc-800">
                  <th className="py-2.5 px-4 text-[11px]">Data / Hora</th>
                  <th className="py-2.5 px-4 text-[11px]">Tipo</th>
                  <th className="py-2.5 px-4 text-[11px]">Categoria</th>
                  <th className="py-2.5 px-4 text-[11px]">Descrição</th>
                  <th className="py-2.5 px-4 text-[11px]">Forma Pgto</th>
                  <th className="py-2.5 px-4 text-right text-[11px]">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {transacoes.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{t.data_vencimento}</td>
                    <td className="py-3 px-4">
                      <Badge variant={t.tipo === 'RECEITA' ? 'success' : 'danger'}>{t.tipo}</Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-zinc-200">{t.categoria}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">{t.descricao}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{t.forma_pagamento || 'PIX / Cartão'}</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold text-[11px] ${t.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.tipo === 'RECEITA' ? '+ ' : '- '}R$ {t.valor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: CONTAS A PAGAR */}
      {abaAtiva === 'PAGAR' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-zinc-100">Contas a Pagar & Faturas de Laboratórios</h3>
              <p className="text-[11px] text-slate-500">Previsão de desembolso para fornecedores de lentes e armações.</p>
            </div>
            <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs">
              Pendente: R$ {contasPagarPendentes.toFixed(2)}
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F1F5F9] dark:bg-zinc-900 text-slate-600 font-semibold border-b border-slate-200 dark:border-zinc-800">
                <th className="py-2.5 px-4 text-[11px]">Vencimento</th>
                <th className="py-2.5 px-4 text-[11px]">Fornecedor / Favorecido</th>
                <th className="py-2.5 px-4 text-[11px]">Categoria</th>
                <th className="py-2.5 px-4 text-[11px]">Descrição</th>
                <th className="py-2.5 px-4 text-right text-[11px]">Valor (R$)</th>
                <th className="py-2.5 px-4 text-center text-[11px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {transacoes.filter(t => t.tipo === 'DESPESA').map(t => (
                <tr key={t.id}>
                  <td className="py-3 px-4 font-mono text-slate-500">{t.data_vencimento}</td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">{t.cliente_ou_fornecedor || 'Fornecedor'}</td>
                  <td className="py-3 px-4 text-slate-600">{t.categoria}</td>
                  <td className="py-3 px-4 text-slate-500">{t.descricao}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">R$ {t.valor.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={t.status === 'PAGO' ? 'success' : 'warning'}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ABA 3: CONTAS A RECEBER */}
      {abaAtiva === 'RECEBER' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-zinc-100">Contas a Receber (Crediário Próprio & Boletos)</h3>
              <p className="text-[11px] text-slate-500">Parcelas futuras e crediário de óculos completos comprados por clientes.</p>
            </div>
            <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">
              A Receber: R$ {contasReceberPendentes.toFixed(2)}
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F1F5F9] dark:bg-zinc-900 text-slate-600 font-semibold border-b border-slate-200 dark:border-zinc-800">
                <th className="py-2.5 px-4 text-[11px]">Vencimento</th>
                <th className="py-2.5 px-4 text-[11px]">Paciente / Cliente</th>
                <th className="py-2.5 px-4 text-[11px]">Origem (O.S. / PDV)</th>
                <th className="py-2.5 px-4 text-[11px]">Parcela</th>
                <th className="py-2.5 px-4 text-right text-[11px]">Valor Parcela</th>
                <th className="py-2.5 px-4 text-center text-[11px]">Status</th>
                <th className="py-2.5 px-4 text-center text-[11px]">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {titulosReceber.map(titulo => (
                <tr key={titulo.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                  <td className="py-3 px-4 font-mono text-slate-500">{titulo.data_vencimento}</td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">{titulo.cliente}</td>
                  <td className="py-3 px-4 font-mono text-blue-600">{titulo.origem}</td>
                  <td className="py-3 px-4 font-mono">{titulo.parcela}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">R$ {titulo.valor.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={titulo.status === 'PAGO' ? 'success' : 'warning'}>
                      {titulo.status === 'PAGO' ? 'RECEBIDO' : 'A VENCER'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {titulo.status === 'PENDENTE' ? (
                      <button
                        onClick={() => handleDarBaixaRecebimento(titulo.id)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-xs transition-colors"
                      >
                        Dar Baixa (Receber)
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">Liquidado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ABA 4: RELATÓRIO DRE (DEMONSTRATIVO DE RESULTADOS) */}
      {abaAtiva === 'DRE' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#0284C7]">Demonstrativo Contábil</span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                Relatório DRE Gerencial (Competência Mês Atual)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Unidade: {lojaAtiva.nome_fantasia}</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 bg-slate-50 dark:bg-zinc-900 rounded font-bold">
              <span>(+) RECEITA BRUTA DE VENDAS & SERVIÇOS (O.S. + PDV)</span>
              <span className="text-emerald-600">R$ {receitaBruta.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-2 pl-4 text-slate-600 dark:text-zinc-400">
              <span>(-) Deduções da Receita (Impostos Simples + Taxas Cartões)</span>
              <span className="text-rose-600">- R$ {deducoesImpostosTaxas.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-2 bg-slate-100 dark:bg-zinc-800 font-bold border-t border-slate-200">
              <span>(=) RECEITA OPERACIONAL LÍQUIDA</span>
              <span className="text-slate-900 dark:text-white">R$ {receitaLiquida.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-2 pl-4 text-slate-600 dark:text-zinc-400">
              <span>(-) Custos das Mercadorias Vendidas (CMV: Lentes de Lab + Armações)</span>
              <span className="text-rose-600">- R$ {cmvCustosVariaveis.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-2 bg-sky-50 dark:bg-sky-950 font-bold border-t border-sky-200 text-[#0284C7]">
              <span>(=) MARGEM DE CONTRIBUIÇÃO BRUTA (LUCRO BRUTO)</span>
              <span>R$ {margemContribuicao.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-2 pl-4 text-slate-600 dark:text-zinc-400">
              <span>(-) Despesas Fixas Operacionais (Aluguel, Energia, Salários, Internet & Sistemas)</span>
              <span className="text-rose-600">- R$ {despesasFixas.toFixed(2)}</span>
            </div>

            <div className="flex justify-between p-3 bg-slate-900 text-white rounded font-extrabold text-sm mt-3">
              <span>(=) LUCRO LÍQUIDO DO EXERCÍCIO (RESULTADO FINAL)</span>
              <span className="text-emerald-400 font-mono">R$ {lucroLiquidoDRE.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lançamento Financeiro (Receita / Despesa) */}
      {isModalDespesaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-lg shadow-2xl w-full max-w-md p-5 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {tipoModal === 'RECEITA' ? '💰 Lançar Recebimento / Entrada' : '💸 Lançar Despesa / Conta a Pagar'}
              </h3>
              
              {/* Alternador de Tipo no Modal */}
              <div className="flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded text-[11px]">
                <button
                  type="button"
                  onClick={() => { setTipoModal('RECEITA'); setCategoria('Venda Direta / Balcão'); }}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${tipoModal === 'RECEITA' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'}`}
                >
                  Receita
                </button>
                <button
                  type="button"
                  onClick={() => { setTipoModal('DESPESA'); setCategoria('Laboratório Terceirizado'); }}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${tipoModal === 'DESPESA' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'}`}
                >
                  Despesa
                </button>
              </div>
            </div>

            <form onSubmit={handleSalvarLancamento} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Categoria *</label>
                <select value={categoria} onChange={e => setCategoria(e.target.value)} className="neo-select">
                  {tipoModal === 'DESPESA' ? (
                    <>
                      <option value="Laboratório Terceirizado">Laboratório Terceirizado (Surfaçagem/Montagem)</option>
                      <option value="Fornecedor de Armações">Fornecedor de Armações / Grifes</option>
                      <option value="Aluguel & Contas Fixas">Aluguel & Contas Fixas (Energia/Internet)</option>
                      <option value="Comissão de Vendedores">Comissão de Consultores Ópticos</option>
                      <option value="Sangria de Caixa">Sangria / Retirada de Caixa</option>
                      <option value="Impostos & Tributos">Impostos (Simples Nacional) & Taxas</option>
                    </>
                  ) : (
                    <>
                      <option value="Venda Direta / Balcão">Venda Direta / PDV Balcão</option>
                      <option value="Crediário Próprio / Parcela O.S.">Crediário Próprio / Parcela de O.S.</option>
                      <option value="Suprimento de Caixa">Suprimento de Caixa (Aporte)</option>
                      <option value="Exame Optométrico">Exame Optométrico / Consulta da Visão</option>
                      <option value="Outras Receitas">Outras Receitas e Rendimentos</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{tipoModal === 'RECEITA' ? 'Cliente / Pagador' : 'Fornecedor / Favorecido'}</label>
                <input 
                  type="text" 
                  placeholder={tipoModal === 'RECEITA' ? "Ex: Mariana Silveira" : "Ex: Laboratório Zeiss / Enel"} 
                  value={favorecido} 
                  onChange={e => setFavorecido(e.target.value)} 
                  className="neo-input" 
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Descrição / Histórico *</label>
                <input 
                  type="text" 
                  required 
                  placeholder={tipoModal === 'RECEITA' ? "Ex: Pagamento parcela 2/3 O.S. #1042" : "Ex: Fatura quinzenal de blocos oftálmicos"} 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                  className="neo-input" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Valor (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={valor || ''} 
                    placeholder="0.00" 
                    onChange={e => setValor(parseFloat(e.target.value) || 0)} 
                    className="neo-input font-mono font-bold" 
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Data Vencimento *</label>
                  <input 
                    type="date" 
                    required 
                    value={vencimento} 
                    onChange={e => setVencimento(e.target.value)} 
                    className="neo-input" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Forma de Pagamento</label>
                  <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} className="neo-select">
                    <option value="PIX">PIX (Instantâneo)</option>
                    <option value="Dinheiro">Dinheiro em Espécie</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Boleto Bancário">Boleto Bancário</option>
                    <option value="Crediário / Carnê">Crediário / Carnê Próprio</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Situação / Status</label>
                  <select 
                    value={statusLancamento} 
                    onChange={e => setStatusLancamento(e.target.value as 'PAGO' | 'PENDENTE')} 
                    className="neo-select font-bold"
                  >
                    <option value="PAGO">Liquidado / Pago no Ato</option>
                    <option value="PENDENTE">Pendente / A Vencer</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button type="button" onClick={() => setIsModalDespesaOpen(false)} className="neo-button-secondary">Cancelar</button>
                <button 
                  type="submit" 
                  className={`px-4 py-1.5 rounded font-bold text-white shadow-xs ${tipoModal === 'RECEITA' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                  {tipoModal === 'RECEITA' ? 'Confirmar Receita' : 'Salvar Despesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fechamento de Caixa */}
      {isModalPrintCaixaOpen && (
        <PrintFechamentoCaixaModal
          transacoes={transacoes}
          saldoInicial={saldoInicial}
          onClose={() => setIsModalPrintCaixaOpen(false)}
        />
      )}

    </div>
  );
};
