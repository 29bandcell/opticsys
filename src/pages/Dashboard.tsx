import React from 'react';
import { 
  ClipboardList, 
  FlaskConical, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Eye, 
  ArrowUpRight,
  Clock,
  Package
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Badge } from '../components/common/Badge';
import { OnboardingTrialBanner } from '../components/dashboard/OnboardingTrialBanner';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenNovaOS: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenNovaOS }) => {
  const { 
    lojaAtiva, 
    ordensServico, 
    receitas, 
    transacoes, 
    produtos 
  } = useAuthAndTenant();

  const osAtivas = ordensServico.filter(o => o.status !== 'ENTREGUE' && o.status !== 'CANCELADA');
  const osNoLab = ordensServico.filter(o => o.status === 'AGUARDANDO_LABORATORIO' || o.status === 'EM_SURFACAGEM');
  const osProntas = ordensServico.filter(o => o.status === 'PRONTO_RETIRADA');
  
  const totalReceita = transacoes
    .filter(t => t.tipo === 'RECEITA' && t.status === 'PAGO')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const produtosEstoqueBaixo = produtos.filter(p => p.estoque_atual <= p.estoque_minimo);

  return (
    <div className="space-y-4">
      
      {/* Banner de Onboarding Gamificado dos 7 Dias de Teste */}
      <OnboardingTrialBanner onNavigate={onNavigate} onOpenNovaOS={onOpenNovaOS} />

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 p-4 rounded shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Painel Operacional
            </h1>
            <span className="text-[11px] bg-sky-50 text-[#0284C7] dark:bg-sky-950 dark:text-sky-300 font-bold px-2 py-0.5 rounded border border-sky-200 dark:border-sky-900">
              {lojaAtiva.nome_fantasia}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Bancada técnica, laboratórios terceirizados e fluxo financeiro em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNovaOS}
            className="neo-button-primary !py-1.5 text-xs"
          >
            + Nova O.S.
          </button>
          <button
            onClick={() => onNavigate('pdv')}
            className="neo-button-secondary !py-1.5 text-xs"
          >
            PDV Balcão
          </button>
        </div>
      </div>

      {/* Grid de KPIs Compactos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1 */}
        <div 
          onClick={() => onNavigate('os')}
          className="neo-card cursor-pointer hover:border-[#0284C7] transition-all group p-3.5"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>O.S. EM ANDAMENTO</span>
            <div className="p-1 rounded bg-sky-50 dark:bg-sky-950 text-[#0284C7]">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-zinc-100">
              {osAtivas.length}
            </span>
            <span className="text-[10px] font-semibold text-[#0284C7] group-hover:underline flex items-center">
              Ver Kanban <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
            {osProntas.length} prontas para retirada
          </p>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => onNavigate('laboratorios')}
          className="neo-card cursor-pointer hover:border-purple-500 transition-all group p-3.5"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>NO LABORATÓRIO (SURFAÇAGEM)</span>
            <div className="p-1 rounded bg-purple-50 dark:bg-purple-950 text-purple-600">
              <FlaskConical className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-mono text-purple-700 dark:text-purple-400">
              {osNoLab.length}
            </span>
            <span className="text-[10px] font-semibold text-purple-600 group-hover:underline flex items-center">
              Ver Labs <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {osNoLab.length > 0 ? 'Surfaçagem em andamento' : 'Nenhum pedido no lab'}
          </p>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => onNavigate('receitas')}
          className="neo-card cursor-pointer hover:border-amber-500 transition-all group p-3.5"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>RECEITAS A VENCER (30D)</span>
            <div className="p-1 rounded bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-mono text-amber-700 dark:text-amber-400">
              {receitas.length} {receitas.length === 1 ? 'Paciente' : 'Pacientes'}
            </span>
            <span className="text-[10px] font-semibold text-amber-600 group-hover:underline flex items-center">
              Avisar Zap <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Retorno anual preventivo
          </p>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => onNavigate('financeiro')}
          className="neo-card cursor-pointer hover:border-emerald-500 transition-all group p-3.5"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>FATURAMENTO REALIZADO</span>
            <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
              R$ {totalReceita.toFixed(2)}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 group-hover:underline flex items-center">
              Financeiro <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Vendas + Ordens de Serviço
          </p>
        </div>

      </div>

      {/* Grid Central: Tabela O.S. & Estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Tabela O.S. Recentes */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#0284C7]" />
              <h3 className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                Ordens de Serviço na Bancada
              </h3>
            </div>
            <button
              onClick={() => onNavigate('os')}
              className="text-[11px] font-semibold text-[#0284C7] hover:underline"
            >
              Ver todas ({ordensServico.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F5F9] dark:bg-zinc-900 text-slate-600 font-semibold border-y border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2 px-3 font-semibold text-[11px]">O.S. #</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Paciente</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Armação & Lentes</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Previsão</th>
                  <th className="py-2 px-3 font-semibold text-[11px]">Status</th>
                  <th className="py-2 px-3 text-right font-semibold text-[11px]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {ordensServico.slice(0, 4).map(os => (
                  <tr key={os.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0284C7]">
                      #{os.numero_os}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-zinc-200">
                      {os.cliente_nome}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="truncate font-medium text-slate-700 dark:text-zinc-300 text-[11px]">{os.armacao_descricao}</div>
                      <div className="text-[10px] text-slate-400 truncate">{os.lente_descricao}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {new Date(os.data_prometida).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={os.status === 'PRONTO_RETIRADA' ? 'success' : 'info'}>
                        {os.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-zinc-100">
                      R$ {os.valor_total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card Alerta Estoque */}
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-zinc-100">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Estoque de Armações</span>
            </div>
            <button
              onClick={() => onNavigate('produtos')}
              className="text-[10px] font-semibold text-[#0284C7] hover:underline"
            >
              Catálogo
            </button>
          </div>

          <div className="space-y-2">
            {produtosEstoqueBaixo.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                <div className="truncate max-w-[170px]">
                  <div className="font-semibold text-slate-800 dark:text-zinc-200 truncate text-[11px]">{p.nome}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Ref: {p.codigo_referencia}</div>
                </div>
                <span className="font-mono font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded text-[10px]">
                  {p.estoque_atual} un
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
