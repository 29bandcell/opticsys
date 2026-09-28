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
  ArrowRight
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
    realizarVendaPDV 
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
  const totalDescontos = carrinho.reduce((acc, item) => acc + (item.desconto * item.quantidade), 0);
  const totalFinal = Math.max(0, subtotal - totalDescontos);

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
    setAbaMobile('CATALOGO');
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* Header Responsivo */}
      <div className="bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950 text-[#0284C7] flex items-center justify-center font-bold shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
              Ponto de Venda (PDV Balcão)
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400">
              Venda rápida de óculos solar, armações, lentes de contato e acessórios.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs font-mono bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 w-full sm:w-auto flex justify-between sm:block">
          <span className="text-slate-400">Operador: </span>
          <strong className="text-slate-800 dark:text-zinc-200">{usuarioAtual.nome}</strong>
        </div>
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

            {/* Categorias Rápidas com Scroll Horizontal Touch */}
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
            <div className="space-y-2 max-h-52 sm:max-h-60 overflow-y-auto pr-1">
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
