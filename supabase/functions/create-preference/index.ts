
// Fix: Declare Deno global for environments where Deno types are not automatically loaded
declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // TOKEN ABSOLUTAMENTE CORRETO DA SUA IMAGEM (Final 4340)
    const CORRECT_TOKEN = "APP_USR-3745572468754340-122216-149ba67710abd5697c6e9762bfd1ea9c-1629834109";
    
    // Ignoramos variáveis de ambiente para garantir que o fix funcione
    const accessToken = CORRECT_TOKEN.trim();
    
    const body = await req.json();
    const { items, test } = body;

    // Diagnóstico para o Painel ADM verificar se o deploy funcionou
    if (test) {
      const mpTest = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ title: 'Teste de Conexão', unit_price: 1, quantity: 1, currency_id: 'BRL' }]
        }),
      });
      const testData = await mpTest.json();

      return new Response(
        JSON.stringify({ 
          status: testData.error ? 'invalid_token' : 'online', 
          message: testData.error ? testData.message : 'Conectado!',
          debug: {
            token_prefix: accessToken.substring(0, 15),
            token_suffix: accessToken.slice(-4),
            is_correct_version: accessToken.includes("4340")
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items,
        back_urls: {
          success: 'https://google.com',
          failure: 'https://google.com',
          pending: 'https://google.com'
        },
        auto_return: 'approved',
      }),
    });

    const data = await mpResponse.json();

    if (data.error) {
      return new Response(
        JSON.stringify({ 
          error: 'MERCADO_PAGO_ERROR', 
          message: data.message || 'Erro no Mercado Pago',
          details: data 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ init_point: data.init_point }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'SERVER_ERROR', message: err.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
