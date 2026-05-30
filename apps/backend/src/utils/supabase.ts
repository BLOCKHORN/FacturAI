import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import express from 'express';

export const getSupabase = (req?: express.Request, useServiceRole = false) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const key = useServiceRole ? process.env.SUPABASE_SERVICE_ROLE_KEY! : supabaseAnonKey;
  const options: any = {
    auth: { persistSession: false },
    realtime: { transport: ws }
  };
  if (req?.headers.authorization && !useServiceRole) {
    options.global = { headers: { Authorization: req.headers.authorization } };
  }
  return createClient(supabaseUrl, key, options);
};
