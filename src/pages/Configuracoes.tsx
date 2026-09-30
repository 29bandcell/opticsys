import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Percent, 
  CreditCard, 
  Landmark, 
  Layers, 
  Key, 
  Printer, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Receipt,
  Zap,
  ExternalLink,
  Download,
  Upload,
  Database,
  FileSpreadsheet
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';

export const Configuracoes: React.FC = () => {
  const { 
    lojaAtiva,
    importarClientesEmLote,
    importarProdutosEmLote,
    exportarBackupCompleto
  } = useAuthAndTenant();

  const [abaAtiva, setAbaAtiva] = useState<'LOJA' | 'COMISSOES' | 'PAGAMENTOS' | 'CONTAS' | 'CATEGORIAS' | 'ASAAS' | 'FOCUSNFE' | 'IMPRESSAO' | 'MIGRACAO'>('LOJA');
  const [salvoSucesso, setSalvoSucesso] = useState(false);
  
  // Estado da Migração
  const [textoClientesCSV, setTextoClientesCSV] = useState('');
  const [textoProdutosCSV, setTextoProdutosCSV] = useState('');
  const [resultadoImportacao, setResultadoImportacao] = useState<string | null>(null);

  // Formas de Pagamento com taxas
  const [formasPgto, setFormasPgto] = useState([
    { id: 'fp-1', nome: 'Dinheiro (Espécie)', tipo: 'DINHEIRO', taxa: 0.0, dias: 0, ativo: true },
    { id: 'fp-2', nome: 'PIX Instantâneo (Chave / QR Code)', tipo: 'PIX', taxa: 0.0, dias: 0, ativo: true },
    { id: 'fp-3', nome: 'Cartão de Débito (Maquininha)', tipo: 'DEBITO', taxa: 1.39, dias: 1, ativo: true },
    { id: 'fp-4', nome: 'Cartão de Crédito 1x (À Vista)', tipo: 'CREDITO', taxa: 2.99, dias: 30, ativo: true },
    { id: 'fp-5', nome: 'Cartão de Crédito 2x a 6x', tipo: 'CREDITO', taxa: 4.49, dias: 30, ativo: true },
    { id: 'fp-6', nome: 'Cartão de Crédito 7x a 10x', tipo: 'CREDITO', taxa: 6.89, dias: 30, ativo: true },
    { id: 'fp-7', nome: 'Crediário Próprio da Ótica (Carnê)', tipo: 'CREDIARIO', taxa: 0.0, dias: 0, ativo: true },
  ]);

  // Contas Bancárias
  const [contasBancarias, setContasBancarias] = useState([
    { id: 'cb-1', nome: 'Caixa Balcão (Gaveta Loja)', banco: 'Dinheiro Físico', saldo: 250.00 },
    { id: 'cb-2', nome: 'Banco Inter (PJ Principal)', banco: 'Banco Inter 077', saldo: 14890.50 },
    { id: 'cb-3', nome: 'Asaas Conta Digital (Recebimentos PIX/Boleto)', banco: 'Asaas IP S.A.', saldo: 3420.00 },
  ]);

  // Categorias Financeiras (Plano de Contas)
  const [catFinanceiras, setCatFinanceiras] = useState([
    { id: 'cf-1', nome: 'Receita: Venda de Armações & Solares', tipo: 'RECEITA' },
    { id: 'cf-2', nome: 'Receita: Venda de Lentes Oftálmicas (O.S.)', tipo: 'RECEITA' },
    { id: 'cf-3', nome: 'Receita: Serviços de Montagem & Ajuste', tipo: 'RECEITA' },
    { id: 'cf-4', nome: 'Custo: Surfaçagem de Laboratórios Terceirizados', tipo: 'DESPESA' },
    { id: 'cf-5', nome: 'Custo: Reposição de Armações & Grifes', tipo: 'DESPESA' },
    { id: 'cf-6', nome: 'Despesa: Aluguel do Ponto Comercial', tipo: 'DESPESA' },
    { id: 'cf-7', nome: 'Despesa: Energia Elétrica & Internet', tipo: 'DESPESA' },
    { id: 'cf-8', nome: 'Despesa: Comissões dos Consultores Ópticos', tipo: 'DESPESA' },
  ]);

  // Regras de Comissão
  const [comissaoVendaPadrao, setComissaoVendaPadrao] = useState(4.0);
  const [comissaoMontagemPadrao, setComissaoMontagemPadrao] = useState(5.0);
  const [comissaoOptometria, setComissaoOptometria] = useState(15.0);

  // Asaas Config
  const [asaasApiKey, setAsaasApiKey] = useState('$aact_YTU1YTE0M2M2N2I4MTQyMzkwMTQ3ZTZiYmMwMQ==');
  const [asaasAmbiente, setAsaasAmbiente] = useState('SANDBOX');

  // Impressão
  const [larguraImpressao, setLarguraImpressao] = useState<58 | 80>(80);
  const [imprimirGrade, setImprimirGrade] = useState(true);
  const [imprimirGarantia, setImprimirGarantia] = useState(true);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setSalvoSucesso(true);
    setTimeout(() => setSalvoSucesso(false), 2500);
  };

  return (
    <div className="space-y-4 max-w-6xl">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center font-bold">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Configurações do Sistema
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Definições da Loja, Regras de Comissão, Formas de Pagamento, Contas Bancárias e Gateway Asaas.
            </p>
          </div>
        </div>

        {salvoSucesso && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Alterações salvas!
          </span>
        )}
      </div>

      {/* Submenus em Abas Conforme Especificação */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setAbaAtiva('LOJA')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'LOJA' ? 'bg-[#0284C7] text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Store className="w-3.5 h-3.5" /> Definições da Loja
        </button>

        <button
          onClick={() => setAbaAtiva('COMISSOES')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'COMISSOES' ? 'bg-[#0284C7] text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Percent className="w-3.5 h-3.5" /> Regras de Comissão
        </button>

        <button
          onClick={() => setAbaAtiva('PAGAMENTOS')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'PAGAMENTOS' ? 'bg-[#0284C7] text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Formas de Pagamento ({formasPgto.length})
        </button>

        <button
          onClick={() => setAbaAtiva('CONTAS')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'CONTAS' ? 'bg-[#0284C7] text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" /> Contas Bancárias ({contasBancarias.length})
        </button>

        <button
          onClick={() => setAbaAtiva('CATEGORIAS')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'CATEGORIAS' ? 'bg-[#0284C7] text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Categorias Financeiras
        </button>

        <button
          onClick={() => setAbaAtiva('ASAAS')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'ASAAS' ? 'bg-[#0284C7] text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-amber-300" /> Gateway Asaas
        </button>

        <button
          onClick={() => setAbaAtiva('FOCUSNFE')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'FOCUSNFE' ? 'bg-[#0284C7] text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-cyan-300" /> Emissão Fiscal & SEFAZ
        </button>

        <button
          onClick={() => setAbaAtiva('IMPRESSAO')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'IMPRESSAO' ? 'bg-[#0284C7] text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-3.5 h-3.5" /> Impressão Térmica
        </button>

        <button
          onClick={() => setAbaAtiva('MIGRACAO')}
          className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
            abaAtiva === 'MIGRACAO' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-indigo-400" /> Migração & Backup
        </button>
      </div>

      <form onSubmit={handleSalvar} className="space-y-4">
        
        {/* ABA 1: DEFINIÇÕES DA LOJA */}
        {abaAtiva === 'LOJA' && (
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Dados Cadastrais da Unidade
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nome Fantasia da Ótica</label>
                <input type="text" defaultValue={lojaAtiva.nome_fantasia} className="neo-input" />
              </div>
              <div>
                <label className="block font-bold mb-1">Razão Social</label>
                <input type="text" defaultValue={lojaAtiva.razao_social} className="neo-input" />
              </div>
              <div>
                <label className="block font-bold mb-1">CNPJ</label>
                <input type="text" disabled defaultValue={lojaAtiva.cnpj} className="neo-input font-mono bg-slate-100 dark:bg-zinc-800 cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-bold mb-1">Telefone / WhatsApp</label>
                <input type="text" defaultValue={lojaAtiva.telefone} className="neo-input font-mono" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">Endereço Completo</label>
                <input type="text" defaultValue={`${lojaAtiva.endereco} - ${lojaAtiva.cidade}/${lojaAtiva.uf}`} className="neo-input" />
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: REGRAS DE COMISSÃO */}
        {abaAtiva === 'COMISSOES' && (
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Percentuais Padrão de Comissão
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">Venda de Armações & Solares (%)</label>
                <input type="number" step="0.5" value={comissaoVendaPadrao} onChange={e => setComissaoVendaPadrao(parseFloat(e.target.value) || 0)} className="neo-input font-mono font-bold" />
                <span className="text-[10px] text-slate-400 mt-1 block">Creditado ao consultor óptico no PDV.</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">Serviços de Montagem & Bancada (%)</label>
                <input type="number" step="0.5" value={comissaoMontagemPadrao} onChange={e => setComissaoMontagemPadrao(parseFloat(e.target.value) || 0)} className="neo-input font-mono font-bold" />
                <span className="text-[10px] text-slate-400 mt-1 block">Creditado ao técnico responsável pela O.S.</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">Consultas & Optometria (%)</label>
                <input type="number" step="0.5" value={comissaoOptometria} onChange={e => setComissaoOptometria(parseFloat(e.target.value) || 0)} className="neo-input font-mono font-bold" />
                <span className="text-[10px] text-slate-400 mt-1 block">Repasse para o optometrista parceiro.</span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: FORMAS DE PAGAMENTO */}
        {abaAtiva === 'PAGAMENTOS' && (
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm overflow-hidden text-xs">
            <div className="p-3 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <span className="font-bold text-slate-800 dark:text-zinc-200">Taxas e Prazos por Meio de Pagamento</span>
              <span className="text-[11px] text-slate-400">Usado no cálculo do DRE e repasses</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F1F5F9] dark:bg-zinc-900 text-slate-600 font-semibold border-b border-slate-200 dark:border-zinc-800">
                  <th className="py-2 px-4">Forma de Pagamento</th>
                  <th className="py-2 px-4">Tipo</th>
                  <th className="py-2 px-4 font-mono">Taxa Operadora (%)</th>
                  <th className="py-2 px-4 font-mono">Dias p/ Repasse</th>
                  <th className="py-2 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {formasPgto.map(fp => (
                  <tr key={fp.id}>
                    <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-zinc-200">{fp.nome}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{fp.tipo}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-rose-600">{fp.taxa.toFixed(2)}%</td>
                    <td className="py-2.5 px-4 font-mono">{fp.dias} dias</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">ATIVO</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ABA 4: CONTAS BANCÁRIAS */}
        {abaAtiva === 'CONTAS' && (
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-zinc-100">Contas Correntes e Caixas</span>
              <button type="button" className="text-[#0284C7] font-semibold flex items-center gap-1">+ Nova Conta</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {contasBancarias.map(cb => (
                <div key={cb.id} className="p-3 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <strong className="text-slate-900 dark:text-zinc-100">{cb.nome}</strong>
                    <Landmark className="w-4 h-4 text-[#0284C7]" />
                  </div>
                  <p className="text-[11px] text-slate-500">{cb.banco}</p>
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 font-mono font-bold text-sm text-emerald-600">
                    R$ {cb.saldo.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 5: CATEGORIAS FINANCEIRAS */}
        {abaAtiva === 'CATEGORIAS' && (
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-zinc-100">Plano de Contas Gerencial</span>
              <span className="text-[11px] text-slate-400">Classificação para o Relatório DRE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {catFinanceiras.map(cf => (
                <div key={cf.id} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{cf.nome}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${cf.tipo === 'RECEITA' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {cf.tipo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 6: INTEGRAÇÃO ASAAS */}
        {abaAtiva === 'ASAAS' && (
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Gateway de Pagamentos Asaas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Ambiente</label>
                <select value={asaasAmbiente} onChange={e => setAsaasAmbiente(e.target.value)} className="neo-select">
                  <option value="SANDBOX">Sandbox (Homologação)</option>
                  <option value="PRODUCTION">Produção (Cobranças Reais)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Chave de API Criptografada (Vault)</label>
                <input type="password" value={asaasApiKey} onChange={e => setAsaasApiKey(e.target.value)} className="neo-input font-mono" />
              </div>
            </div>
          </div>
        )}

        {/* ABA: CONFIGURAÇÕES FISCAIS */}
        {abaAtiva === 'FOCUSNFE' && (
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-2">
              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-[#0099FF]" /> Emissão Fiscal & SEFAZ
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configurações de emissão de NFC-e / NF-e para a loja: {lojaAtiva.nome_fantasia}.
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                SEFAZ Conectada 🟢
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 text-[11px]">Ambiente SEFAZ</label>
                <select className="neo-select">
                  <option value="HOMOLOGACAO">Homologação (Testes)</option>
                  <option value="PRODUCAO">Produção (Validade Jurídica)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[11px]">Série Padrão NFC-e</label>
                <input
                  type="number"
                  defaultValue={1}
                  className="neo-input font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button className="neo-button-primary">Salvar Configurações Fiscais</button>
            </div>
          </div>
        )}

        {/* ABA 7: IMPRESSÃO TÉRMICA */}
        {abaAtiva === 'IMPRESSAO' && (
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Configurações de Impressão Térmica
            </h3>
            <div className="space-y-2">
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="largura" checked={larguraImpressao === 80} onChange={() => setLarguraImpressao(80)} />
                  <span>80 mm (Epson / Elgin / Bematech)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="largura" checked={larguraImpressao === 58} onChange={() => setLarguraImpressao(58)} />
                  <span>58 mm (Compacta)</span>
                </label>
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={imprimirGrade} onChange={e => setImprimirGrade(e.target.checked)} />
                  <span>Imprimir Grade de Graus (OD/OE) no comprovante do paciente</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ABA 8: MIGRAÇÃO & BACKUP COMPLETO */}
        {abaAtiva === 'MIGRACAO' && (
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-6 text-xs">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                Migração de Dados & Backup Completo (LGPD)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Importação rápida em lote de clientes e estoque do seu sistema legado, e download de cópia integral de segurança.
              </p>
            </div>

            {resultadoImportacao && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 rounded-lg text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{resultadoImportacao}</span>
              </div>
            )}

            {/* Exportação de Backup Completo */}
            <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <strong className="block text-indigo-950 dark:text-indigo-200 text-sm">
                  Exportar Backup Completo da Ótica (JSON Estruturado)
                </strong>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Baixe um arquivo seguro com todas as suas ordens de serviço, receitas, clientes, vendas e fluxo de caixa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const dataStr = exportarBackupCompleto();
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `backup_${lojaAtiva.nome_fantasia.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  setResultadoImportacao('Cópia de backup gerada e baixada com sucesso!');
                  setTimeout(() => setResultadoImportacao(null), 4000);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" /> Download Backup Completo
              </button>
            </div>

            {/* Importação de Clientes em Lote */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <strong className="text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Importar Lista de Clientes / Pacientes
                </strong>
                <span className="text-[10px] text-slate-400 font-mono">Formato: Nome, Telefone, CPF, Cidade</span>
              </div>

              <textarea
                rows={3}
                placeholder="Exemplo (uma linha por cliente):&#10;Maria da Silva, (88) 98888-1111, 123.456.789-00, Morada Nova&#10;João Santos, (88) 99999-2222, 987.654.321-11, Limoeiro do Norte"
                value={textoClientesCSV}
                onChange={e => setTextoClientesCSV(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs font-mono"
              />

              <button
                type="button"
                onClick={() => {
                  if (!textoClientesCSV.trim()) return;
                  const linhas = textoClientesCSV.trim().split('\n');
                  const clientesNovos = linhas.map(l => {
                    const partes = l.split(',').map(p => p.trim());
                    return {
                      nome: partes[0] || 'Cliente Importado',
                      telefone: partes[1] || '(88) 98888-0000',
                      cpf: partes[2] || '000.000.000-00',
                      cidade: partes[3] || 'Morada Nova',
                      uf: 'CE',
                      origem: 'IMPORTACAO_LOTE'
                    };
                  });

                  const qtd = importarClientesEmLote(clientesNovos);
                  setTextoClientesCSV('');
                  setResultadoImportacao(`Sucesso: ${qtd} clientes importados para a sua ótica!`);
                  setTimeout(() => setResultadoImportacao(null), 4000);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Processar Importação de Clientes
              </button>
            </div>

            {/* Importação de Produtos em Lote */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <strong className="text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                  <FileSpreadsheet className="w-4 h-4 text-sky-600" /> Importar Estoque / Catálogo de Produtos
                </strong>
                <span className="text-[10px] text-slate-400 font-mono">Formato: Nome, Código Barras, Preço Custo, Preço Venda, Estoque</span>
              </div>

              <textarea
                rows={3}
                placeholder="Exemplo (uma linha por produto):&#10;Armação Ray-Ban Aviador Metal, 7891234567890, 150.00, 480.00, 5&#10;Solar Oakley Holbrook Preto, 7899876543210, 200.00, 650.00, 3"
                value={textoProdutosCSV}
                onChange={e => setTextoProdutosCSV(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs font-mono"
              />

              <button
                type="button"
                onClick={() => {
                  if (!textoProdutosCSV.trim()) return;
                  const linhas = textoProdutosCSV.trim().split('\n');
                  const produtosNovos = linhas.map((l, idx) => {
                    const partes = l.split(',').map(p => p.trim());
                    return {
                      nome: partes[0] || 'Produto Importado',
                      codigo_barras: partes[1] || `789${Date.now()}${idx}`,
                      codigo_referencia: `IMP-${idx + 1}`,
                      tipo: 'ARMACAO_GRAU' as any,
                      marca: 'Importada',
                      preco_custo: parseFloat(partes[2]) || 50.00,
                      preco_venda: parseFloat(partes[3]) || 150.00,
                      estoque_atual: parseInt(partes[4]) || 1,
                      estoque_minimo: 1,
                      ativo: true
                    };
                  });

                  const qtd = importarProdutosEmLote(produtosNovos);
                  setTextoProdutosCSV('');
                  setResultadoImportacao(`Sucesso: ${qtd} produtos importados para o catálogo!`);
                  setTimeout(() => setResultadoImportacao(null), 4000);
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Processar Importação de Produtos
              </button>
            </div>

          </div>
        )}

        {/* Botão Salvar Global */}
        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-zinc-800">
          <button type="submit" className="neo-button-primary !py-2 !px-6 text-xs font-bold">
            Salvar Configurações
          </button>
        </div>

      </form>

    </div>
  );
};
