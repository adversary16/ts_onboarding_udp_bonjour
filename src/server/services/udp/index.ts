import { RemoteInfo } from "dgram";
import { UDP_BEACON_TIMEOUT_MSEC } from "../../../client/services/udp.client/constants";
import { UDPService } from "../../../shared/classes/udp.class";
import { UDP_PROTOCOL_MESSAGES } from "../../../shared/constants";
import { TimeoutError } from "../../../shared/errors";
import {
  TClientId,
  TUDPHeartbeatPayload,
  TUDPHelloPayload,
} from "../../../shared/types";
import {
  RPC_ERROR_NO_SUCH_FUNCTION,
  UDP_ERROR_CLIENT_NOT_FOUND,
  UDP_ERROR_RECONNECTION_REQUIRED,
} from "./errors";
import { TClientInfo } from "./types";

class UDPServerService extends UDPService {
  #clients = new Map<string, TClientInfo>();
  constructor() {
    super();
    this.on(UDPService.STATES.UDP_STATE_READY, this.#init.bind(this));
  }

  getClientDescription(clientId: TClientId) {
    const clientDescription = this.#clients.get(clientId);
    if (!clientDescription) throw UDP_ERROR_CLIENT_NOT_FOUND;
    const { logo, capacities } = clientDescription;
    return { logo, capacities, id: clientId };
  }

  get clients(): any[] {
    const clientDTO = <any>[];
    for (const [id, { capacities }] of this.#clients) {
      clientDTO.push({ id, capacities });
    }
    return clientDTO;
  }

  #init() {
    this.addMessageHandler(
      UDP_PROTOCOL_MESSAGES.HELLO,
      this.#registerClient.bind(this)
    );
    this.addMessageHandler(
      UDP_PROTOCOL_MESSAGES.HEARTBEAT,
      this.#updateHeartBeat.bind(this)
    );
    setInterval(this.#cleanup.bind(this), UDP_BEACON_TIMEOUT_MSEC);
  }

  #registerClient(
    registrationPayload: TUDPHelloPayload,
    sender: RemoteInfo
  ): void {
    const timestamp = Date.now();
    const { clientId, capacities, logo } = registrationPayload;
    this.#clients.set(clientId, {
      ...sender,
      capacities,
      lastHeartbeat: timestamp,
      logo,
    });
    console.log("Client with", clientId, "connected from", sender.address);
  }

  #updateHeartBeat(
    heartbeatPayload: TUDPHeartbeatPayload,
    clientRemoteInfo: RemoteInfo
  ): void {
    const { clientId } = heartbeatPayload;
    const clientConnection = this.#clients.get(clientId);
    if (
      !clientConnection ||
      clientConnection.address !== clientRemoteInfo.address
    )
      throw UDP_ERROR_RECONNECTION_REQUIRED;
    clientConnection.lastHeartbeat = Date.now();
  }

  #cleanup() {
    const timestamp = Date.now();
    for (const [k, v] of this.#clients) {
      if (timestamp - v.lastHeartbeat > UDP_BEACON_TIMEOUT_MSEC) {
        this.#clients.delete(k);
        console.log("Client with", k, "was purged for timeout");
      }
    }
  }

  async callRPCFunction<T>(
    clientId: TClientId,
    functionName: string,
    args: any
  ) {
    const calledClient = this.#clients.get(clientId);
    if (!calledClient) throw UDP_ERROR_CLIENT_NOT_FOUND;
    if (!calledClient.capacities.includes(functionName))
      throw RPC_ERROR_NO_SUCH_FUNCTION;
    const { address, port } = calledClient;
    try {
      return await this.callRemoteFunction<T>(
        address,
        port,
        functionName,
        args
      );
    } catch (e) {
      if (e instanceof TimeoutError) {
        this.#clients.delete(clientId);
        console.log("Client with", clientId, "was purged for timeout");
      }
      throw e;
    }
  }
}

export const udpService = new UDPServerService();
