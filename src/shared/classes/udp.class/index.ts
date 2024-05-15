import { randomUUID } from "crypto";
import { RemoteInfo, createSocket } from "dgram";
import EventEmitter from "events";
import { UDP_SERVICE_SERVER_PORT, UDP_SERVICE_SOCKET_TYPE } from "../../config";
import {
  UDP_BROADCAST_ADDRESS,
  UDP_PROTOCOL_MESSAGES,
  UDP_RPC_TIMEOUT_MSEC,
  UDP_STATE,
} from "../../constants";
import { UdpError } from "../../errors";
import {
  TMessageID,
  TUDPMessage,
  TUDPMessageEventPayload,
  TUDPMessageHandler,
  TUDPMessageType,
  isValidMessage,
} from "../../types";

export class UDPService extends EventEmitter {
  static STATES = UDP_STATE;

  #socket = createSocket(UDP_SERVICE_SOCKET_TYPE);

  #init(listenPort: number) {
    this.#socket.on("listening", this.#initSocket.bind(this, listenPort));
    this.#socket.on("message", this.#handleMessage.bind(this));
    this.#socket.bind(listenPort);
  }

  constructor(listenPort: number = UDP_SERVICE_SERVER_PORT) {
    super();
    try {
      this.#init(listenPort);
    } catch (error: any) {
      this.emit<Map<string, TUDPMessage>>(UDPService.STATES.UDP_STATE_ERROR, {
        message: error?.message ?? error,
      });
    }
  }

  #initSocket(listenPort: number) {
    console.log(`listening ${UDP_SERVICE_SOCKET_TYPE} on port ${listenPort}`);
    this.#socket.setBroadcast(true);
    this.emit(UDPService.STATES.UDP_STATE_READY);
  }

  #handleMessage(msg: Buffer, sender: RemoteInfo) {
    try {
      const message: TUDPMessage = JSON.parse(msg.toString("utf-8"));
      if (!isValidMessage(message)) throw new UdpError("MESSAGE MALFORMED");
      const [messageType, payload, messageId] = message;
      const isAck = [
        UDP_PROTOCOL_MESSAGES.RESPONSE_OK,
        UDP_PROTOCOL_MESSAGES.RESPONSE_ERROR,
      ].includes(messageType);
      this.emit(isAck ? messageId : messageType.toUpperCase(), {
        payload,
        messageId,
        sender,
        messageType,
      });
    } catch (e) {
      console.error({ e });
    }
  }

  public broadcast(
    port: number,
    messageType: TUDPMessageType,
    payload?: Object
  ) {
    return this.#send(UDP_BROADCAST_ADDRESS, port, messageType, payload);
  }

  async #send(
    address: string,
    port: number,
    messageType: TUDPMessageType,
    payload?: any,
    ackFor?: TMessageID
  ) {
    const payloadOffset = 0;
    const messageId = ackFor ?? randomUUID();
    const message: TUDPMessage = [messageType, payload, messageId];
    const serializedPayload = JSON.stringify(message);
    return new Promise((resolve, reject) => {
      if (ackFor) {
        resolve(null);
      }
      let failureTimeout = setTimeout(() => {
        reject("Timeout");
      }, UDP_RPC_TIMEOUT_MSEC);
      const resultHandler = (payload: any) => {
        const isError =
          payload.messageType === UDP_PROTOCOL_MESSAGES.RESPONSE_ERROR;
        clearTimeout(failureTimeout);
        isError ? reject(payload) : resolve(payload);
      };
      this.once<string>(messageId, resultHandler);

      this.#socket.send(
        serializedPayload,
        payloadOffset,
        serializedPayload?.length,
        port,
        address
      );
    });
  }

  public async callRemoteFunction(
    address: string,
    port: number,
    functionName: string,
    args: any
  ): Promise<any> {
    return this.#send(address, port, UDP_PROTOCOL_MESSAGES.CALLRPC, [
      functionName,
      args,
    ]);
  }

  public addMessageHandler(messageType: string, handler: TUDPMessageHandler) {
    this.addListener(
      messageType.toUpperCase(),
      async (event: TUDPMessageEventPayload) => {
        const { sender, payload, messageId } = event;
        let responseType = UDP_PROTOCOL_MESSAGES.RESPONSE_OK;
        let responsePayload: any = null;
        try {
          responsePayload = await handler(payload, sender);
        } catch (error: any) {
          responseType = UDP_PROTOCOL_MESSAGES.RESPONSE_ERROR;
          responsePayload = { message: error?.message ?? error };
        }
        try {
          await this.#send(
            sender.address,
            sender.port,
            responseType,
            responsePayload,
            messageId
          );
        } catch (e) {
          console.error({ e });
        }
      }
    );
  }
}
