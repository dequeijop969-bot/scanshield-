// Camada de compatibilidade — substitui o @base44/sdk
import { supabase } from './supabaseClient';
import { ScreenAnalysis, User } from './entities';

export const base44 = {
  auth: {
    async me() {
      return await User.me();
    },
    logout() {
      supabase.auth.signOut().then(() => {
        window.location.href = '/login';
      });
    },
    redirectToLogin(returnUrl) {
      const target = returnUrl || window.location.pathname;
      window.location.href = `/login?redirect=${encodeURIComponent(target)}`;
    },
  },

  entities: {
    ScreenAnalysis: {
      ...ScreenAnalysis,
      async bulkCreate(items) {
        const { data: { user } } = await supabase.auth.getUser();
        const rows = items.map(item => ({ ...item, user_id: user.id, created_at: new Date().toISOString() }));
        const { data, error } = await supabase.from('screen_analyses').insert(rows).select();
        if (error) throw error;
        return data;
      },
    },
    User,
  },

  integrations: {
    Core: {
      async UploadFile({ file }) {
        const { data: { user } } = await supabase.auth.getUser();
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from('uploads')
          .upload(fileName, file, { upsert: false });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);
        return { file_url: publicUrl };
      },

      async InvokeLLM({ prompt, file_urls, model, response_json_schema }) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({ prompt, file_urls, model, response_json_schema }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Erro na análise');
        }
        return await response.json();
      },

      async SendEmail({ to, from_name, subject, body }) {
        // Envia via Vercel Function (usa Resend ou só loga em dev)
        try {
          await fetch('/api/sendEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, from_name, subject, body }),
          });
        } catch (e) {
          console.error('Erro ao enviar email:', e);
        }
      },
    },
  },

  functions: {
    async invoke(name, body) {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/${name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { data };
    },
  },
};
