export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  is_online: boolean;
  opening_time: string;
  closing_time: string;
  created_at: Date;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  category: string;
  created_at: Date;
}

export interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  delivery_agent_id?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  email: string;
  is_available: boolean;
  current_location?: string;
  created_at: Date;
}

export interface Rating {
  id: string;
  user_id: string;
  order_id: string;
  restaurant_rating?: number;
  delivery_agent_rating?: number;
  restaurant_review?: string;
  delivery_review?: string;
  created_at: Date;
}