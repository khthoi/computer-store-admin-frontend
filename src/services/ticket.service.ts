import {
  MOCK_TICKETS,
  MOCK_TICKET_SUMMARIES,
  MOCK_TICKET_STATS,
  MOCK_STAFF,
  toTicketSummary,
} from "@/src/app/(dashboard)/support/_mock";
import type {
  Ticket,
  TicketSummary,
  TicketStats,
  TicketStatus,
  TicketMessage,
  StaffOption,
  TicketListParams,
  PaginatedTickets,
  AddMessagePayload,
  CreateTicketPayload,
  TicketMetaUpdatePayload,
} from "@/src/types/ticket.types";

// ─── In-memory store ───────────────────────────────────────────────────────────

let ticketStore: Ticket[] = MOCK_TICKETS.map((t) => ({ ...t }));
let nextTicketId = ticketStore.length + 1;
let nextMessageId = 1000;

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function now(): string {
  return new Date().toISOString();
}

function applyFilters(
  tickets: Ticket[],
  params: TicketListParams
): Ticket[] {
  let result = [...tickets];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.tieuDe.toLowerCase().includes(q) ||
        t.maTicket.toLowerCase().includes(q) ||
        t.khachHangTen.toLowerCase().includes(q) ||
        t.khachHangEmail.toLowerCase().includes(q)
    );
  }

  if (params.status) {
    result = result.filter((t) => t.trangThai === params.status);
  }

  if (params.priority) {
    result = result.filter((t) => t.mucDoUuTien === params.priority);
  }

  if (params.loaiVanDe) {
    result = result.filter((t) => t.loaiVanDe === params.loaiVanDe);
  }

  if (params.assignedTo) {
    result = result.filter(
      (t) => t.nhanVienPhuTrachId === params.assignedTo
    );
  }

  if (params.myOnly) {
    // In real app, filter by current user id; here we use staff id 10
    result = result.filter((t) => t.nhanVienPhuTrachId === 10);
  }

  if (params.dateFrom) {
    const from = new Date(params.dateFrom).getTime();
    result = result.filter((t) => new Date(t.ngayTao).getTime() >= from);
  }

  if (params.dateTo) {
    const to = new Date(params.dateTo).getTime();
    result = result.filter((t) => new Date(t.ngayTao).getTime() <= to);
  }

  return result;
}

// ─── Service functions ─────────────────────────────────────────────────────────

export async function getTickets(
  params: TicketListParams
): Promise<PaginatedTickets> {
  await delay();
  const filtered = applyFilters(ticketStore, params);
  const total = filtered.length;
  const totalPages = Math.ceil(total / params.limit) || 1;
  const start = (params.page - 1) * params.limit;
  const paged = filtered.slice(start, start + params.limit);
  return {
    data: paged.map(toTicketSummary),
    total,
    page: params.page,
    limit: params.limit,
    totalPages,
  };
}

export async function getTicketById(id: number): Promise<Ticket | null> {
  await delay(300);
  return ticketStore.find((t) => t.ticketId === id) ?? null;
}

export async function getTicketStats(): Promise<TicketStats> {
  await delay(200);
  return {
    tongSoTicket: ticketStore.length,
    dangMo: ticketStore.filter((t) =>
      ["Moi", "DangXuLy", "ChoKhach"].includes(t.trangThai)
    ).length,
    chuaXuLy: ticketStore.filter((t) => t.trangThai === "Moi").length,
    khanCap: ticketStore.filter(
      (t) => t.mucDoUuTien === "KhanCap" && t.trangThai !== "Dong"
    ).length,
    slaBreached: ticketStore.filter(
      (t) =>
        t.slaDeadline != null &&
        new Date(t.slaDeadline) < new Date() &&
        t.trangThai !== "Dong"
    ).length,
    trungBinhGiaiQuyet: MOCK_TICKET_STATS.trungBinhGiaiQuyet,
  };
}

export async function getStaffOptions(): Promise<StaffOption[]> {
  await delay(200);
  return MOCK_STAFF;
}

export async function createTicket(
  payload: CreateTicketPayload
): Promise<Ticket> {
  await delay(500);
  const id = nextTicketId++;
  const ticket: Ticket = {
    ticketId:       id,
    maTicket:       `TK-${String(id).padStart(4, "0")}`,
    khachHangId:    payload.khachHangId,
    khachHangTen:   "Khách hàng mới",
    khachHangEmail: "new@example.com",
    donHangId:      payload.donHangId,
    loaiVanDe:      payload.loaiVanDe,
    mucDoUuTien:    payload.mucDoUuTien,
    tieuDe:         payload.tieuDe,
    moTa:           payload.moTa,
    kenhLienHe:     payload.kenhLienHe,
    trangThai:      "Moi",
    tags:           [],
    nhanVienPhuTrachId:     payload.assignedTo,
    nhanVienPhuTrachTen:    payload.assignedTo
      ? MOCK_STAFF.find((s) => s.value === String(payload.assignedTo))?.label
      : undefined,
    messages: [
      {
        messageId:      nextMessageId++,
        ticketId:       id,
        senderType:     "HeThong",
        senderId:       null,
        senderName:     "Hệ thống",
        noiDungTinNhan: `Ticket được tạo qua ${payload.kenhLienHe}`,
        loaiTinNhan:    "SystemLog",
        attachments:    [],
        createdAt:      now(),
      },
    ],
    messageCount: 1,
    ngayTao:      now(),
    ngayCapNhat:  now(),
    soLanMoLai:   0,
  };
  ticketStore = [ticket, ...ticketStore];
  return ticket;
}

export async function updateTicketMeta(
  id: number,
  payload: TicketMetaUpdatePayload
): Promise<Ticket> {
  await delay(400);
  const idx = ticketStore.findIndex((t) => t.ticketId === id);
  if (idx === -1) throw new Error(`Ticket ${id} not found`);

  const existing = ticketStore[idx];
  const updated: Ticket = {
    ...existing,
    ...(payload.mucDoUuTien != null  && { mucDoUuTien:  payload.mucDoUuTien }),
    ...(payload.trangThai   != null  && { trangThai:    payload.trangThai   }),
    ...(payload.tags        != null  && { tags:         payload.tags        }),
    ngayCapNhat: now(),
  };

  if (payload.nhanVienPhuTrachId !== undefined) {
    if (payload.nhanVienPhuTrachId === null) {
      updated.nhanVienPhuTrachId  = undefined;
      updated.nhanVienPhuTrachMa  = undefined;
      updated.nhanVienPhuTrachTen = undefined;
      updated.nhanVienPhuTrachAvatar = undefined;
    } else {
      const staff = MOCK_STAFF.find(
        (s) => s.value === String(payload.nhanVienPhuTrachId)
      );
      updated.nhanVienPhuTrachId  = payload.nhanVienPhuTrachId;
      updated.nhanVienPhuTrachMa  = staff?.maNhanVien;
      updated.nhanVienPhuTrachTen = staff?.label;
    }
  }

  // Handle status transition side-effects
  if (payload.trangThai === "Dong" && !existing.ngayDong) {
    updated.ngayDong = now();
    if (!existing.daGiaiQuyetLuc) updated.daGiaiQuyetLuc = now();
  }
  if (payload.trangThai === "DaGiaiQuyet" && !existing.daGiaiQuyetLuc) {
    updated.daGiaiQuyetLuc = now();
  }
  if (
    payload.trangThai === "DangXuLy" &&
    existing.trangThai === "Dong"
  ) {
    updated.soLanMoLai = (existing.soLanMoLai ?? 0) + 1;
    updated.ngayDong   = undefined;
  }

  ticketStore[idx] = updated;
  return updated;
}

export async function addMessage(
  ticketId: number,
  payload: AddMessagePayload
): Promise<TicketMessage> {
  await delay(400);
  const idx = ticketStore.findIndex((t) => t.ticketId === ticketId);
  if (idx === -1) throw new Error(`Ticket ${ticketId} not found`);

  const msgId = nextMessageId++;

  // Mock: create fake TicketAttachment records from uploaded File objects
  const fakeAttachments = (payload.files ?? []).map((file, i) => ({
    attachmentId: msgId * 1000 + i,
    messageId:    msgId,
    fileName:     file.name,
    fileUrl:      typeof URL !== "undefined" ? URL.createObjectURL(file) : "",
    fileType:     file.type,
    fileSize:     file.size,
    uploadedAt:   now(),
  }));

  const msg: TicketMessage = {
    messageId:      msgId,
    ticketId,
    senderType:     "NhanVien",
    senderId:       10,   // current staff
    senderName:     "Nguyễn Thị Lan",
    noiDungTinNhan: payload.noiDungTinNhan,
    loaiTinNhan:    payload.loaiTinNhan,
    trangThaiMoi:   payload.trangThaiMoi,
    attachments:    fakeAttachments,
    createdAt:      now(),
  };

  const existing = ticketStore[idx];
  const updatedMessages = [...existing.messages, msg];
  const updates: Partial<Ticket> = {
    messages:     updatedMessages,
    messageCount: updatedMessages.length,
    ngayCapNhat:  now(),
  };

  // Auto status transitions
  if (payload.loaiTinNhan === "Reply") {
    if (existing.trangThai === "Moi") {
      updates.trangThai = "DangXuLy";
      if (!existing.phanHoiDauLuc) updates.phanHoiDauLuc = now();
    } else if (payload.trangThaiMoi) {
      updates.trangThai = payload.trangThaiMoi;
    }
  }

  ticketStore[idx] = { ...existing, ...updates };
  return msg;
}

export async function assignTicket(
  ticketId: number,
  staffId: number | null
): Promise<Ticket> {
  return updateTicketMeta(ticketId, { nhanVienPhuTrachId: staffId });
}

export async function changeStatus(
  ticketId: number,
  status: TicketStatus
): Promise<Ticket> {
  return updateTicketMeta(ticketId, { trangThai: status });
}

export async function bulkAssign(
  ticketIds: number[],
  staffId: number
): Promise<void> {
  await delay(500);
  for (const id of ticketIds) {
    const idx = ticketStore.findIndex((t) => t.ticketId === id);
    if (idx !== -1) {
      const staff = MOCK_STAFF.find((s) => s.value === String(staffId));
      ticketStore[idx] = {
        ...ticketStore[idx],
        nhanVienPhuTrachId:  staffId,
        nhanVienPhuTrachMa:  staff?.maNhanVien,
        nhanVienPhuTrachTen: staff?.label,
        ngayCapNhat:         now(),
      };
    }
  }
}
