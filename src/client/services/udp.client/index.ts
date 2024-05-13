import { randomUUID } from "crypto";
import { UDPService } from "../../../shared/classes/udp.class";
import { UDP_SERVICE_SERVER_PORT } from "../../../shared/config";
import { rpcClientService } from "../rpc.client";
import { UDP_BEACON_TIMEOUT_MSEC, UDP_CLIENT_STATES } from "./constants";

class UDPClientService extends UDPService {
    #state: UDP_CLIENT_STATES = UDP_CLIENT_STATES.INITIAL;
    #beaconLoop?: NodeJS.Timeout
    public readonly CLIENT_ID = '4d67323a-dd68-40a7-bf7f-354c68d64ce3' ?? randomUUID();

    constructor(port: number){
        super(port);
        this.on(UDPService.STATES.UDP_STATE_READY, this.#init.bind(this))
    }

    #init(){
        this.#startBeacon();
    }

    async #startBeacon(){
        let beaconTimeout = this.#state === UDP_CLIENT_STATES.INITIAL ? 0 : UDP_BEACON_TIMEOUT_MSEC;

        try {
            const beaconFunction = this.#state === UDP_CLIENT_STATES.CONNECTED ? this.#heartbeat : this.#hello;
            await beaconFunction.call(this);
            this.#state = UDP_CLIENT_STATES.CONNECTED;
        } catch (e) {
            const wasServerAlive = this.#state === UDP_CLIENT_STATES.CONNECTED;
            this.#state = UDP_CLIENT_STATES.SEARCHING;
            if (wasServerAlive) beaconTimeout = 0;
            console.log('Server unreachable, reannouncing', e)
        };
        this.#beaconLoop = setTimeout(this.#startBeacon.bind(this), beaconTimeout)
    }

    async #hello(){
        try {
        const payload = { clientId: this.CLIENT_ID, capacities: rpcClientService.capacities };
        await this.broadcast(UDP_SERVICE_SERVER_PORT, 'hello', payload);
        console.log('connected')
        } catch (e) { 
            throw e
        }
    }

    async #heartbeat() {
        await this.broadcast(UDP_SERVICE_SERVER_PORT, 'heartbeat', { clientId: this.CLIENT_ID });
    }
}

export const udpClientService = new UDPClientService(UDP_SERVICE_SERVER_PORT + 1);