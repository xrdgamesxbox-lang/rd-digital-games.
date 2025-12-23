
declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  // 1. Responder às requisições de OPTIONS (Preflight do navegador)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Busca a chave configurada em Edge Functions > Secrets no painel do Supabase
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeKey) {
      console.error('ERRO: STRIPE_SECRET_KEY não encontrada nos Secrets do Supabase.');
      return new Response(
        JSON.stringify({ 
          error: 'CONFIG_REQUIRED', 
          message: 'A chave STRIPE_SECRET_KEY não foi configurada no painel do Supabase (Edge Functions > Secrets).' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const body = await req.json().catch(() => ({}));
    const { items, customer_email, success_url, cancel_url } = body

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'INVALID_REQUEST', message: 'Carrinho vazio.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Converte os itens para o formato da Stripe (unit_amount em centavos)
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.title,
          images: item.image_url ? [item.image_url] : [],
          description: `Licença: ${item.accountType || 'Digital'}`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }))

    // Cria a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customer_email && customer_email !== 'Visitante' ? customer_email : undefined,
      line_items,
      mode: 'payment',
      success_url: success_url || `${req.headers.get('origin')}/?success=true`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/?cancel=true`,
      metadata: {
        store: 'RD Digital Games',
        customer: customer_email || 'Visitante',
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    console.error('Erro Stripe:', err.message);
    return new Response(
      JSON.stringify({ error: 'STRIPE_ERROR', message: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
