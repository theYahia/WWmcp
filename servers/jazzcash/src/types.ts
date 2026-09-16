/**
 * Generic JazzCash API response. JazzCash returns a flat object of `pp_*` fields;
 * the exact set varies per endpoint, so we type the common ones and allow the rest.
 */
export interface JazzCashResponse {
  pp_ResponseCode?: string;
  pp_ResponseMessage?: string;
  pp_TxnRefNo?: string;
  pp_Amount?: string;
  pp_VoucherNumber?: string;
  pp_SecureHash?: string;
  [key: string]: unknown;
}
