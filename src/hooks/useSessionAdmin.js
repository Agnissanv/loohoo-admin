import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { suivreSession, estAdmin } from '../api/admin.js';

export function useSessionAdmin() {
  const navigate = useNavigate();
  const [session, setSession] = useState(undefined);
  const [autorise, setAutorise] = useState(undefined);

  useEffect(() => suivreSession(setSession), []);

  useEffect(() => {
    if (session === undefined) return;
    if (session === null) { navigate('/connexion'); return; }
    estAdmin().then(setAutorise).catch(() => setAutorise(false));
  }, [session, navigate]);

  return { session, autorise };
}