export type ContactMessageStatus = "moi" | "da_xu_ly";

export interface ContactMessageSummary {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ContactMessageDetail extends ContactMessageSummary {
  ipAddress: string | null;
  userAgent: string | null;
  adminNote: string | null;
  resolvedById: number | null;
}

export interface ContactMessageStats {
  total: number;
  new: number;
  resolved: number;
}

export interface ContactMessageListParams {
  page?: number;
  limit?: number;
  status?: ContactMessageStatus;
  search?: string;
}

export interface ContactMessageListResult {
  data: ContactMessageSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateContactMessagePayload {
  status?: ContactMessageStatus;
  adminNote?: string;
}
