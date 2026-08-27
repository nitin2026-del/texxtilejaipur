import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const CONFIG_CODE = 'SYS_SHIPPING_CONFIG';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', CONFIG_CODE)
      .single();

    if (error || !data) {
      return NextResponse.json({
        standard_price: 0,
        express_price: 10,
        is_free_shipping: true
      });
    }

    return NextResponse.json({
      standard_price: data.min_order_value || 0,
      express_price: data.discount_value || 0,
      is_free_shipping: data.usage_limit === 1
    });
  } catch (err) {
    return NextResponse.json({
      standard_price: 0,
      express_price: 10,
      is_free_shipping: true
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { standard_price, express_price, is_free_shipping } = await req.json();

    const { data: existing } = await supabaseAdmin
      .from('coupons')
      .select('id')
      .eq('code', CONFIG_CODE)
      .single();

    const payload = {
      code: CONFIG_CODE,
      discount_type: 'fixed',
      discount_value: express_price,
      min_order_value: standard_price,
      usage_limit: is_free_shipping ? 1 : 0,
      is_active: false
    };

    if (existing) {
      await supabaseAdmin.from('coupons').update(payload).eq('id', existing.id);
    } else {
      await supabaseAdmin.from('coupons').insert([payload]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
