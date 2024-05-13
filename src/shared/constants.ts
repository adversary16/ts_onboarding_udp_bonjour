export enum UDP_STATE {
  UDP_STATE_READY = "udp_state_ready",
  UDP_STATE_ERROR = "udp_state_error",
}

export const UDP_BROADCAST_ADDRESS = "255.255.255.255";
export const UDP_RPC_TIMEOUT_MSEC = 1 * 1000;

export enum UDP_PROTOCOL_MESSAGES {
  HELLO = "hello",
  HEARTBEAT = "hearbeat",
  CALLRPC = "call_function",
  RESPONSE_OK = "result_ok",
  RESPONSE_ERROR = "result_error",
}
