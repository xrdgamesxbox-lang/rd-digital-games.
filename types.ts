
export interface Game {
  id: string;
  title: string;
  description: string;
  platform: string;
  image_url: string;
  is_featured: boolean;
  is_available?: boolean; // Disponibilidade Global do Jogo
  
  // Disponibilidade específica (Novo)
  is_parental_available?: boolean;
  is_exclusive_available?: boolean;

  category: 'jogo' | 'gamepass' | 'prevenda';
  display_order?: number;
  updated_at?: string; // Data da última modificação
  
  // Preços para Jogos
  original_price_parental?: number;
  current_price_parental?: number;
  original_price_exclusive?: number;
  current_price_exclusive?: number;
  
  // Preços para Game Pass (ou legado)
  original_price?: number;
  current_price?: number;
  discount_percentage?: number;
  
  plan_duration?: '1' | '3' | '6' | '12';
  account_type?: 'parental' | 'exclusiva'; // Usado para histórico/legado
}

export interface CartItem {
  cartId: string;
  gameId: string;
  title: string;
  image_url: string;
  accountType: 'parental' | 'exclusiva' | 'gamepass' | 'prevenda';
  price: number;
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface License {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  game_title: string;
  product_category: string;
  account_type: string;
  assigned_email: string;
  assigned_password: string;
  is_gamepass: boolean;
  subscription_months?: number;
  start_date?: string;
  end_date?: string;
  status: 'ativo' | 'expirado' | 'cancelado';
}
