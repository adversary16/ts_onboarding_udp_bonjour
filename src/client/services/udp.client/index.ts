import { randomUUID } from "crypto";
import { UDPService } from "../../../shared/classes/udp.class";
import { UDP_SERVICE_SERVER_PORT } from "../../../shared/config";
import { rpcClientService } from "../rpc.client";
import { UDP_BEACON_TIMEOUT_MSEC, UDP_CLIENT_STATES } from "./constants";

class UDPClientService extends UDPService{
    #state: UDP_CLIENT_STATES = UDP_CLIENT_STATES.SEARCHING;
    #beaconLoop?: NodeJS.Timeout
    public readonly CLIENT_ID = randomUUID();

    constructor(port: number){
        super(port);
        this.#init();
    }

    #init(){
        this.#beaconLoop = setTimeout(() => {
            this.#hello()
        }, UDP_BEACON_TIMEOUT_MSEC);
    }

    #beacon(){
    }

    async #hello(){
        this.broadcast(UDP_SERVICE_SERVER_PORT, 'hello', { clientId: this.CLIENT_ID, capacities: rpcClientService.capacities })
    }

    async #heartbeat() {

    }
}

export const udpClientService = new UDPClientService(UDP_SERVICE_SERVER_PORT + 1);