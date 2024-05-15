import { RpcError, UdpError } from "../../../shared/errors";

export const UDP_ERROR_RECONNECTION_REQUIRED = new UdpError(
  "RECONNECTION REQUIRED"
);
export const UDP_ERROR_CLIENT_NOT_FOUND = new UdpError("NO SUCH CLIENT");
export const RPC_ERROR_NO_SUCH_FUNCTION = new RpcError("NO_SUCH_FUNCTION");
