import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json([]);
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, display_order')
      .order('display_order', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('Fetch categories error:', err);
    return NextResponse.json([]);
  }
}
