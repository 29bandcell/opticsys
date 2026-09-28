/**
 * OpticSys Cloud - Supabase Client Service
 * Comunicação direta e ultrarrápida com o banco de dados Supabase via REST API
 */

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_CONFIG.url && 
    SUPABASE_CONFIG.anonKey && 
    !SUPABASE_CONFIG.url.includes('sua-url')
  );
};

export class SupabaseService {
  private static getHeaders() {
    return {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  /**
   * Busca registros de uma tabela
   */
  static async select<T = any>(tabela: string, queryParams: string = ''): Promise<{ data: T[] | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase não configurado' };
    }

    try {
      const url = `${SUPABASE_CONFIG.url}/rest/v1/${tabela}${queryParams ? `?${queryParams}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errText = await response.text();
        return { data: null, error: `Erro HTTP ${response.status}: ${errText}` };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro de conexão com Supabase' };
    }
  }

  /**
   * Insere um novo registro
   */
  static async insert<T = any>(tabela: string, payload: Record<string, any>): Promise<{ data: T | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase não configurado' };
    }

    try {
      const url = `${SUPABASE_CONFIG.url}/rest/v1/${tabela}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        return { data: null, error: `Erro HTTP ${response.status}: ${errText}` };
      }

      const data = await response.json();
      return { data: Array.isArray(data) ? data[0] : data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao inserir no Supabase' };
    }
  }

  /**
   * Atualiza registros por ID ou filtro
   */
  static async update<T = any>(tabela: string, idField: string, idValue: string, payload: Record<string, any>): Promise<{ data: T | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase não configurado' };
    }

    try {
      const url = `${SUPABASE_CONFIG.url}/rest/v1/${tabela}?${idField}=eq.${encodeURIComponent(idValue)}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        return { data: null, error: `Erro HTTP ${response.status}: ${errText}` };
      }

      const data = await response.json();
      return { data: Array.isArray(data) ? data[0] : data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao atualizar no Supabase' };
    }
  }

  /**
   * Remove registro por ID
   */
  static async delete(tabela: string, idField: string, idValue: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase não configurado' };
    }

    try {
      const url = `${SUPABASE_CONFIG.url}/rest/v1/${tabela}?${idField}=eq.${encodeURIComponent(idValue)}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errText = await response.text();
        return { success: false, error: `Erro HTTP ${response.status}: ${errText}` };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao deletar no Supabase' };
    }
  }
}
