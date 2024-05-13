import { UUID } from "crypto";
import { RemoteInfo } from "dgram";
import { UDP_PROTOCOL_MESSAGES } from "./constants";

export type TUDPServerCommand = "";

export type TUDPMessageType = UDP_PROTOCOL_MESSAGES;

export type TUDPAckResponse =
  | UDP_PROTOCOL_MESSAGES.RESPONSE_ERROR
  | UDP_PROTOCOL_MESSAGES.RESPONSE_OK;

export type TUDPRpcCallSuccess = {};
export type TUDPClientResponse = "";

export type TClientId = UUID;
export type TMessageID = UUID;

export type TUDPMessage = [messageType: TUDPMessageType, any, TMessageID];

export type TUDPHelloPayload = {
  clientId: TClientId;
  capacities: string[];
  logo?: string;
};
export type TUDPHeartbeatPayload = { clientId: TClientId };

export const isClientId = (idString: string): idString is TClientId => {
  return !!idString.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
  );
};

export const isValidMessage = (message: any): message is TUDPMessage => {
  return (
    Array.isArray(message) &&
    message.length >= 3 &&
    typeof message[2] === "string"
  );
};

export type TUDPMessageEventPayload = {
  payload: TUDPMessage;
  messageId: TMessageID;
  sender: RemoteInfo;
};

export type TUDPMessageHandler = (
  payload: any,
  sender: RemoteInfo
) => Promise<any> | any;
