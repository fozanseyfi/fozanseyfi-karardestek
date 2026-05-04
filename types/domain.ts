import type {
  ComparisonStatus,
  ComparisonType,
  Currency,
  ItemCategory,
  UserRole,
} from "@/lib/constants";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type Firm = {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Comparison = {
  id: string;
  name: string;
  type: ComparisonType;
  status: ComparisonStatus;
  project_id: string | null;
  owner_id: string;
  budget: number | null;
  currency: Currency;
  decision_date: string | null;
  decided_firm_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ComparisonFirm = {
  id: string;
  comparison_id: string;
  firm_id: string;
  bid_pdf_url: string | null;
  notes: string | null;
  created_at: string;
};

export type ComparisonItem = {
  id: string;
  comparison_id: string;
  name: string;
  category: ItemCategory;
  unit: string | null;
  qty: number;
  target_price: number | null;
  position: number;
  created_at: string;
};

export type BidPrice = {
  id: string;
  comparison_id: string;
  item_id: string;
  firm_id: string;
  price: number | null;
  updated_by: string;
  updated_at: string;
};

export type ComparisonShare = {
  id: string;
  comparison_id: string;
  shared_with: string;
  permission: "view" | "edit";
  shared_by: string;
  created_at: string;
};

export type Template = {
  id: string;
  name: string;
  type: ComparisonType;
  category: "GES" | "RES" | "Genel";
  description: string | null;
  items: TemplateItem[];
  is_system: boolean;
  created_by: string | null;
  created_at: string;
};

export type TemplateItem = {
  name: string;
  category: ItemCategory;
  unit: string | null;
  default_qty: number;
};

export type Notification = {
  id: string;
  user_id: string;
  type: "share" | "decision" | "invite" | "system";
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};
