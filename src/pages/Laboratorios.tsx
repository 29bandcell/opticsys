import React from 'react';
import { FlaskConical, Phone, Mail, Clock, FileSpreadsheet, Package } from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Badge } from '../components/common/Badge';

export const Laboratorios: React.FC = () => {
  const { laboratorios, ordensServico } = useAuthAndTenant();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 p-6 rounded-lg shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-purple-600" /> Laboratórios de Surfaçagem & Montagem
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Monitoramento de pedidos enviados para laboratórios parceiros (Essilor, Zeiss, Hoya e Labs locais).
        </p>
      </div>

      {/* Grid de Laboratórios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {laboratorios.map(lab => {
          const pedidosAtivos = ordensServico.filter(
            os => os.laboratorio_id === lab.id && os.status !== 'ENTREGUE' && os.status !== 'CANCELADA'
          );

          return (
            <div
              key={lab.id}
              className="bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4 hover:border-purple-500 transition-all"
            >
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                    {lab.nome}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">Contato: {lab.contato}</span>
                </div>
                <Badge variant="purple">
                  {pedidosAtivos.length} em produção
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  <span>{lab.telefone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span>{lab.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Prazo Médio: <strong>{lab.prazo_medio_dias} dias úteis</strong></span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900 p-2.5 rounded border border-slate-200 dark:border-zinc-800 text-[11px]">
                <strong className="block text-slate-700 dark:text-zinc-300 mb-1">Tabela de Lentes Suportadas:</strong>
                <p className="text-slate-500">{lab.tabela_precos_resumo}</p>
              </div>

              <div className="border-t border-slate-100 dark:border-zinc-800 pt-3">
                <h4 className="text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300 mb-2">
                  Pedidos Recentes Neste Laboratório:
                </h4>
                <div className="space-y-1.5">
                  {pedidosAtivos.slice(0, 3).map(os => (
                    <div key={os.id} className="flex justify-between items-center text-[11px] font-mono p-1.5 bg-purple-50/50 dark:bg-purple-950/30 rounded">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">O.S. #{os.numero_os}</span>
                      <span className="text-purple-700 dark:text-purple-300 font-semibold">{os.status}</span>
                    </div>
                  ))}
                  {pedidosAtivos.length === 0 && (
                    <span className="text-slate-400 text-[11px] italic">Nenhum pedido em aberto.</span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
