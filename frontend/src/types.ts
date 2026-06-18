export type Role = "ADMIN" | "CUSTOMER";

export type Season = "inverno" | "outono" | "verao" | "primavera";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  points: number;
  account_credit: number;
  has_first_purchase: boolean;
  check_in_unlocked: boolean;
  confirmed_orders?: number;
  profile_image_url?: string;
  strava_profile_image_url?: string;
  strava_athlete_id?: number;
  created_at?: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  size: string;
  color: string;
  season: "inverno" | "outono" | "verão" | "primavera" | Season;
  image: string;
  active: boolean;
  stock?: number;
};

export type ProductApi = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  size_label: string;
  color: string;
  season: string;
  image_url: string;
  is_active: boolean;
  stock: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type Order = {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  subtotal_amount: number;
  created_at: string;
  items: OrderItem[];
};

export type CheckIn = {
  id: number;
  activity_type: string;
  duration_min: number;
  calories_burned: number;
  description: string;
  date: string;
  points_earned: number;
  image?: string;
};

export type Coupon = {
  id: number;
  code: string;
  title: string;
  description?: string;
  discount_type?: "percentage" | "fixed";
  discount_value: number;
  points_required: number;
  status?: "unused" | "used";
  expires_at?: string;
};

export type PointTransaction = {
  id: number;
  type: string;
  source: string;
  points: number;
  description: string;
  created_at: string;
};

export type PointsResponse = {
  total_points: number;
  check_in_count: number;
  available_coupons: Coupon[];
  points_history: PointTransaction[];
};
