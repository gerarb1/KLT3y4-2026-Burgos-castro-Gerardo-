import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    ' ADVERTENCIA: SUPABASE_URL o SUPABASE_ANON_KEY no están configuradas en las variables de entorno (.env).'
  );
}

// Sanitizar la URL para eliminar barras al final o rutas accidentales
const cleanSupabaseUrl = (supabaseUrl || 'https://placeholder.supabase.co').trim().replace(/\/+$/, '');

/**
 * Cliente Singleton exportado de Supabase.
 * Canaliza todas las peticiones a la API PostgREST mediante consultas HTTP parametrizadas.
 */
export const supabase = createClient(
  cleanSupabaseUrl,
  supabaseAnonKey || 'placeholder-key'
);
