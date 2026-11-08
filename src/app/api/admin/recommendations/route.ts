import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SETTINGS_KEY = 'SYS_STYLE_RECOMMENDATIONS';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ rules: {} });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    return NextResponse.json({ rules: data?.value || {} });
  } catch (error: any) {
    console.error('Fetch recommendations error:', error);
    return NextResponse.json({ rules: {} });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await supabaseAdmin.from('site_settings').upsert({
      key: SETTINGS_KEY,
      value: payload.rules || payload,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save recommendations error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save recommendations' }, { status: 500 });
  }
}
