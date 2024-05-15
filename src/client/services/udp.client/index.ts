import { readFileSync } from "fs";
import { resolve } from "path";
import { UDPService } from "../../../shared/classes/udp.class";
import { UDP_SERVICE_SERVER_PORT } from "../../../shared/config";
import { UDP_PROTOCOL_MESSAGES } from "../../../shared/constants";
import { UDP_CLIENT_ID } from "../../config";
import { rpcClientService } from "../rpc.client";
import {
  UDP_BEACON_TIMEOUT_MSEC,
  UDP_CLIENT_LOGO_PATH,
  UDP_CLIENT_STATES,
} from "./constants";

class UDPClientService extends UDPService {
  #state: UDP_CLIENT_STATES = UDP_CLIENT_STATES.INITIAL;
  #beaconLoop?: NodeJS.Timeout;
  #logo?: string;
  public readonly CLIENT_ID = UDP_CLIENT_ID;

  constructor(port: number) {
    super(port);
    this.on(UDPService.STATES.UDP_STATE_READY, this.#init.bind(this));
  }

  #loadLogo() {
    try {
      this.#logo = readFileSync(resolve(UDP_CLIENT_LOGO_PATH), {
        encoding: "base64",
      });
    } catch {
      console.warn("logo not found");
    }
  }

  #init() {
    this.#startBeacon();
    this.#loadLogo();
  }

  async #startBeacon() {
    let beaconTimeout =
      this.#state === UDP_CLIENT_STATES.INITIAL ? 0 : UDP_BEACON_TIMEOUT_MSEC;
    const lastInterationState = this.#state;
    try {
      const beaconFunction =
        this.#state === UDP_CLIENT_STATES.CONNECTED
          ? this.#heartbeat
          : this.#hello;
      await beaconFunction.call(this);
      this.#state = UDP_CLIENT_STATES.CONNECTED;
    } catch (e) {
      const wasServerAlive =
        lastInterationState === UDP_CLIENT_STATES.CONNECTED;
      this.#state = UDP_CLIENT_STATES.SEARCHING;
      if (wasServerAlive) {
        beaconTimeout = 0;
        console.log("Server disconnected, retrying");
      }
    }
    this.#beaconLoop = setTimeout(this.#startBeacon.bind(this), beaconTimeout);
  }

  async #hello() {
    try {
      const payload = {
        clientId: this.CLIENT_ID,
        capacities: rpcClientService.capacities,
        logo: this.#logo,
      };
      await this.broadcast(
        UDP_SERVICE_SERVER_PORT,
        UDP_PROTOCOL_MESSAGES.HELLO,
        payload
      );
      console.log("connected");
    } catch (e) {
      throw e;
    }
  }

  async #heartbeat() {
    await this.broadcast(
      UDP_SERVICE_SERVER_PORT,
      UDP_PROTOCOL_MESSAGES.HEARTBEAT,
      { clientId: this.CLIENT_ID }
    );
  }
}

export const udpClientService = new UDPClientService(
  UDP_SERVICE_SERVER_PORT + 1
);
