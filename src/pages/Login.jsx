import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, EyeOff, CheckCircle2, ShieldCheck, Zap, ScanSearch, Lock } from 'lucide-react';
import { createPageUrl } from '@/utils';

const features = [
  { icon: ScanSearch, text: 'Análise de imagens e vídeos em segundos' },
  { icon: ShieldCheck, text: 'Detecção de golpes, fraudes e deepfakes' },
  { icon: Lock, text: 'Suas análises são privadas e criptografadas' },
];

export default function Login() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Preencha email e senha.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setError('A senha precisa ter pelo menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate(redirectTo || createPageUrl('Home'));
      } else {
        await register(email, password);
        setSuccess('Conta criada! Verifique seu email para confirmar e depois faça login.');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      const msg = err.message || 'Erro ao autenticar';
      if (msg.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos.');
      } else if (msg.includes('already registered') || msg.includes('already exists')) {
        setError('Esse email já está cadastrado. Tente entrar.');
      } else {
        setError(msg);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] bg-background">

      {/* ─── LEFT: Painel de marca (desktop) ─────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-border/60 p-12 xl:p-16">
        {/* Background decor */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.3) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--foreground) / 0.3) 1px, transparent 1px)`,
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse 90% 70% at 40% 40%, black 30%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 40% 40%, black 30%, transparent 100%)',
            }}
          />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-foreground/[0.025] blur-3xl" />
        </div>

        {/* Logo topo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-border/60">
            <img src="https://media.base44.com/images/public/69b21108e661b747169bd2a0/320b791b3_WhatsAppImage2026-03-11at211121.jpg" alt="Logotipo ScanShield" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground">ScanShield</span>
        </motion.div>

        {/* Mensagem central */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-md"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-5">
            Segurança digital com IA
          </p>
          <h1 className="text-4xl xl:text-5xl font-black tracking-tighter text-foreground leading-[1.02] mb-6 text-balance">
            Sua defesa contra golpes começa aqui.
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-10 text-pretty">
            Entre na sua conta e tenha uma IA especialista em fraudes analisando
            qualquer imagem, vídeo ou link suspeito por você.
          </p>

          <ul className="space-y-4">
            {features.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.12 }}
                className="flex items-center gap-3.5"
              >
                <span className="w-9 h-9 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-emerald-400" />
                </span>
                <span className="text-sm text-foreground/80">{f.text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Stats rodapé */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="relative flex items-center gap-8 border-t border-border/60 pt-8"
        >
          {[
            { value: '10k+', label: 'Análises realizadas' },
            { value: '98%', label: 'Taxa de precisão' },
            { value: '5k+', label: 'Usuários protegidos' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-2xl font-black tracking-tight text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ─── RIGHT: Formulário ────────────────────────────────── */}
      <div className="relative flex items-center justify-center px-4 py-12 sm:px-8">
        {/* Glow sutil atrás do card (mobile-friendly) */}
        <div className="absolute inset-0 pointer-events-none lg:hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-foreground/[0.03] blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm"
        >
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 ring-1 ring-border/60 shadow-[0_0_40px_hsl(var(--foreground)/0.08)]"
            >
              <img src="https://media.base44.com/images/public/69b21108e661b747169bd2a0/320b791b3_WhatsAppImage2026-03-11at211121.jpg" alt="Logotipo ScanShield" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">ScanShield</h1>
          </div>

          {/* Alternador Entrar / Criar conta */}
          <div className="relative grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted mb-8">
            <motion.div
              className="absolute top-1 bottom-1 rounded-lg bg-card shadow-sm ring-1 ring-border/60"
              initial={false}
              animate={{
                left: mode === 'login' ? '0.25rem' : 'calc(50% + 0.125rem)',
                width: 'calc(50% - 0.375rem)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
            <button
              onClick={() => switchMode('login')}
              className={`relative z-10 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                mode === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`relative z-10 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                mode === 'register' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Criar conta
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-2">
                {mode === 'login' ? 'Bem-vindo de volta' : 'Comece grátis'}
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                {mode === 'login'
                  ? 'Entre para continuar protegido contra golpes.'
                  : 'Crie sua conta e faça sua primeira análise em segundos.'}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-card border-border/80 focus-visible:ring-foreground/20"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleSubmit()}
                  className="h-12 rounded-xl bg-card border-border/80 pr-11 focus-visible:ring-foreground/20"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label htmlFor="login-confirm" className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Input
                      id="login-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      className="h-12 rounded-xl bg-card border-border/80 pr-11 focus-visible:ring-foreground/20"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {confirmPassword && password === confirmPassword && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-11 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3"
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3"
                >
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-base shadow-[0_0_30px_hsl(var(--foreground)/0.1)]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'login' ? (
                  <>
                    <Zap className="w-4 h-4 mr-1" />
                    Entrar
                  </>
                ) : (
                  'Criar conta grátis'
                )}
              </Button>
            </motion.div>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-border" />
              <span className="mx-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">ou</span>
              <div className="flex-grow border-t border-border" />
            </div>

            <Button
              variant="outline"
              onClick={loginWithGoogle}
              className="w-full h-12 rounded-xl gap-2.5 border-border/80 bg-card hover:bg-muted font-semibold"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar com Google
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Protegido com criptografia de ponta a ponta
          </p>
        </motion.div>
      </div>
    </div>
  );
}
