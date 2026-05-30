export interface InvoiceLine {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_percentage: number;
  tax_amount: number;
  total_line_amount: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  base_amount: number;
  total_tax_amount: number;
  total_amount: number;
  xml_path: string | null;
  pdf_path: string | null;
  source_image_path: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'paid' | 'rejected';
  status_updated_at: string;
  created_at: string;
  lines?: InvoiceLine[];
}

export interface BuyerData {
  cif: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  province: string;
  email: string;
  phone: string;
  accounting_office?: string;
  managing_body?: string;
  processing_unit?: string;
}
