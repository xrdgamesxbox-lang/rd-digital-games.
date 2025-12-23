
export interface Game {
  id: string;
  title: string;
  description: string;
  platform: string;
  image_url: string;
  is_featured: boolean;
  category: 'jogo' | 'gamepass' | 'prevenda';
  
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
