// Substitui base44.entities.ScreenAnalysis e base44.entities.User
import { supabase } from './supabaseClient';

// O código original (Base44) usa "created_date", mas nossa tabela usa "created_at".
// Essas funções traduzem automaticamente para manter tudo funcionando sem editar cada página.
function normalizeOrderColumn(orderBy) {
  return orderBy.replace('created_date', 'created_at');
}
function addCreatedDateAlias(row) {
  if (!row) return row;
  return { ...row, created_date: row.created_at };
}
function addCreatedDateAliasList(rows) {
  return (rows || []).map(addCreatedDateAlias);
}

export const ScreenAnalysis = {
  async create(data) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: result, error } = await supabase
      .from('screen_analyses')
      .insert({ ...data, user_id: user.id, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return addCreatedDateAlias(result);
  },

  async list(orderBy = '-created_at', limit = 50) {
    const { data: { user } } = await supabase.auth.getUser();
    orderBy = normalizeOrderColumn(orderBy);
    const col = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
    const asc = !orderBy.startsWith('-');
    const { data, error } = await supabase
      .from('screen_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order(col, { ascending: asc })
      .limit(limit);
    if (error) throw error;
    return addCreatedDateAliasList(data);
  },

  async filter(filters, orderBy = '-created_at', limit = 50) {
    const { data: { user } } = await supabase.auth.getUser();
    let query = supabase.from('screen_analyses').select('*');

    // Filtro por id específico
    if (filters.id) {
      query = query.eq('id', filters.id);
    } else {
      query = query.eq('user_id', user.id);
    }

    orderBy = normalizeOrderColumn(orderBy);
    const col = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
    const asc = !orderBy.startsWith('-');

    const { data, error } = await query.order(col, { ascending: asc }).limit(limit);
    if (error) throw error;
    return addCreatedDateAliasList(data);
  },

  async update(id, data) {
    const { data: result, error } = await supabase
      .from('screen_analyses')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async delete(id) {
    const { error } = await supabase
      .from('screen_analyses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const User = {
  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return { ...user, ...data };
  },

  async filter(filters) {
    let query = supabase.from('profiles').select('*');
    if (filters.email) query = query.eq('email', filters.email);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async update(id, data) {
    const { data: result, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },
};
