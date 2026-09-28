import React from 'react';
import { ReceitaOptica } from '../../types';

interface PrescricaoGradeProps {
  receita?: ReceitaOptica;
  // Campos para modo edição/criação
  values?: {
    od_esferico: number;
    od_cilindrico: number;
    od_eixo: number;
    od_dnp: number;
    od_altura: number;
    oe_esferico: number;
    oe_cilindrico: number;
    oe_eixo: number;
    oe_dnp: number;
    oe_altura: number;
    adicao: number;
  };
  onChange?: (field: string, value: number) => void;
  readOnly?: boolean;
}

export const PrescricaoGrade: React.FC<PrescricaoGradeProps> = ({
  receita,
  values,
  onChange,
  readOnly = true
}) => {
  const formatGrau = (val?: number) => {
    if (val === undefined || val === null) return '0.00';
    const num = Number(val);
    if (num > 0) return `+${num.toFixed(2)}`;
    return num.toFixed(2);
  };

  const od_esf = readOnly ? (receita?.od_longe.esferico ?? 0) : (values?.od_esferico ?? 0);
  const od_cil = readOnly ? (receita?.od_longe.cilindrico ?? 0) : (values?.od_cilindrico ?? 0);
  const od_eixo = readOnly ? (receita?.od_longe.eixo ?? 0) : (values?.od_eixo ?? 0);
  const od_dnp = readOnly ? (receita?.od_longe.dnp ?? 0) : (values?.od_dnp ?? 0);
  const od_alt = readOnly ? (receita?.od_longe.altura ?? 0) : (values?.od_altura ?? 0);

  const oe_esf = readOnly ? (receita?.oe_longe.esferico ?? 0) : (values?.oe_esferico ?? 0);
  const oe_cil = readOnly ? (receita?.oe_longe.cilindrico ?? 0) : (values?.oe_cilindrico ?? 0);
  const oe_eixo = readOnly ? (receita?.oe_longe.eixo ?? 0) : (values?.oe_eixo ?? 0);
  const oe_dnp = readOnly ? (receita?.oe_longe.dnp ?? 0) : (values?.oe_dnp ?? 0);
  const oe_alt = readOnly ? (receita?.oe_longe.altura ?? 0) : (values?.oe_altura ?? 0);

  const adicao = readOnly ? (receita?.adicao ?? 0) : (values?.adicao ?? 0);

  return (
    <div className="w-full overflow-x-auto">
      <table className="optica-grid-table">
        <thead>
          <tr>
            <th className="w-16">Olho</th>
            <th>Esférico</th>
            <th>Cilíndrico</th>
            <th>Eixo (°)</th>
            <th>DNP (mm)</th>
            <th>Altura (mm)</th>
            <th>Adição (ADD)</th>
          </tr>
        </thead>
        <tbody>
          {/* Olho Direito */}
          <tr className="bg-white dark:bg-zinc-900/60">
            <td className="font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
              OD
            </td>
            <td>
              {readOnly ? (
                <span className={`font-mono font-bold ${od_esf < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatGrau(od_esf)}
                </span>
              ) : (
                <input
                  type="number"
                  step="0.25"
                  value={od_esf}
                  onChange={(e) => onChange?.('od_esferico', parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 font-mono font-semibold"
                />
              )}
            </td>
            <td>
              {readOnly ? (
                <span className="font-mono text-slate-800 dark:text-zinc-200">
                  {formatGrau(od_cil)}
                </span>
              ) : (
                <input
                  type="number"
                  step="0.25"
                  value={od_cil}
                  onChange={(e) => onChange?.('od_cilindrico', parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              )}
            </td>
            <td>
              {readOnly ? (
                <span className="font-mono text-slate-800 dark:text-zinc-200">
                  {od_eixo}°
                </span>
              ) : (
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={od_eixo}
                  onChange={(e) => onChange?.('od_eixo', parseInt(e.target.value) || 0)}
                  className="w-full text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              )}
            </td>
            <td>
              {readOnly ? (
                <span className="font-mono">{od_dnp > 0 ? `${od_dnp} mm` : '-'}</span>
              ) : (
                <input
                  type="number"
                  step="0.5"
                  value={od_dnp || ''}
                  placeholder="31.5"
                  onChange={(e) => onChange?.('od_dnp', parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              )}
            </td>
            <td>
              {readOnly ? (
                <span className="font-mono">{od_alt > 0 ? `${od_alt} mm` : '-'}</span>
              ) : (
                <input
                  type="number"
                  step="0.5"
                  value={od_alt || ''}
                  placeholder="19.0"
                  onChange={(e) => onChange?.('od_altura', parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              )}
            </td>
            <td rowSpan={2} className="align-middle bg-slate-50/50 dark:bg-zinc-800/30">
              {readOnly ? (
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {adicao > 0 ? `+${Number(adicao).toFixed(2)}` : '-'}
                </span>
              ) : (
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="4"
                  value={adicao || ''}
                  placeholder="+2.00"
                  onChange={(e) => onChange?.('adicao', parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 font-mono font-bold text-indigo-600"
                />
              )}
            </td>
          </tr>

          {/* Olho Esquerdo */}
          <tr className="bg-white dark:bg-zinc-900/60">
            <td className="font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
              OE
            </td>
            <td>
              {readOnly ? (
                <span className={`font-mono font-bold ${oe_esf < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatGrau(oe_esf)}
                </span>
              ) : (
                <input
                  type="number"
                  step="0.25"
                  value={oe_esf}
                  onChange={(e) => onChange?.('oe_esferico', parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 font-mono font-semibold"
                />
              )}
            </td>
            <td>
              {readOnly ? (
                <span className="font-mono text-slate-800 dark:text-zinc-200">
                  {formatGrau(oe_cil)}
                </span>
              ) : (
                <input
                  type="number"
                  step="0.25"
                  value={oe_cil}
                  onChange={(e) => onChange?.('oe_cilindrico', parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              )}
            </td>
            <td>
              {readOnly ? (
                <span className="font-mono text-slate-800 dark:text-zinc-200">
                  {oe_eixo}°
                </span>
              ) : (
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={oe_eixo}
                  onChange={(e) => onChange?.('oe_eixo', parseInt(e.target.value) || 0)}
                  className="w-full text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              )}
            </td>
            <td>
              {readOnly ? (
                <span className="font-mono">{oe_dnp > 0 ? `${oe_dnp} mm` : '-'}</span>
              ) : (
                <input
                  type="number"
                  step="0.5"
                  value={oe_dnp || ''}
                  placeholder="32.0"
                  onChange={(e) => onChange?.('oe_dnp', parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              )}
            </td>
            <td>
              {readOnly ? (
                <span className="font-mono">{oe_alt > 0 ? `${oe_alt} mm` : '-'}</span>
              ) : (
                <input
                  type="number"
                  step="0.5"
                  value={oe_alt || ''}
                  placeholder="19.0"
                  onChange={(e) => onChange?.('oe_altura', parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
