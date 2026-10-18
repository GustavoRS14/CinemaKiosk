export const CUSTOMER_FLOW_RESET_EVENT = 'totem-customer-flow-reset';

export function resetCustomerFlowUiSession() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CUSTOMER_FLOW_RESET_EVENT));
}
