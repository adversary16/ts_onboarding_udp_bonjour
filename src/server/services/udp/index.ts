import { RemoteInfo } from "dgram";
import { UDP_BEACON_TIMEOUT_MSEC } from "../../../client/services/udp.client/constants";
import { UDPService } from "../../../shared/classes/udp.class";
import { UDP_PROTOCOL_MESSAGES } from "../../../shared/constants";
import { TClientId, TUDPHeartbeatPayload, TUDPHelloPayload } from "../../../shared/types";
import { TClientInfo } from "./types";

class UDPServerService extends UDPService {
    #clients = new Map<string, TClientInfo>()
    constructor(){
        super();
        this.on(UDPService.STATES.UDP_STATE_READY, this.#init.bind(this))
    }

    getClientDescription(clientId: TClientId) {
        const clientDescription = this.#clients.get(clientId);
        if (!clientDescription) throw new Error('No such client');
        const { logo, capacities } = clientDescription;
        return { logo, capacities, id: clientId }
    }

    get clients(): any[] {
        const clientDTO = <any>[]
        for (const [id, { capacities }] of this.#clients) {
            clientDTO.push({ id, capacities })
        }
        return clientDTO; 
    }

    #init(){
        this.addMessageHandler(UDP_PROTOCOL_MESSAGES.HELLO, this.#registerClient.bind(this));
        this.addMessageHandler(UDP_PROTOCOL_MESSAGES.HEARTBEAT, this.#updateHeartBeat.bind(this));
        setInterval(this.#cleanup.bind(this), UDP_BEACON_TIMEOUT_MSEC)
    }

    #registerClient(registrationPayload: TUDPHelloPayload, sender: RemoteInfo):void {
        const timestamp = Date.now();
        const { clientId, capacities, logo } = registrationPayload;
        this.#clients.set(clientId, { ...sender, capacities, lastHeartbeat: timestamp, logo })
        console.log('Client with', clientId, 'connected from', sender.address)
    }

    #updateHeartBeat(heartbeatPayload: TUDPHeartbeatPayload, clientRemoteInfo: RemoteInfo): void {
        const { clientId } = heartbeatPayload;
        const clientConnection = this.#clients.get(clientId);
        if (!clientConnection || clientConnection.address !== clientRemoteInfo.address) throw new Error('RECONNECTION_REQUIRED');
        clientConnection.lastHeartbeat = Date.now();    
    }
    
    #cleanup(){
        const timestamp = Date.now();
        for (const [k, v] of this.#clients) {
            if ((timestamp - v.lastHeartbeat) > UDP_BEACON_TIMEOUT_MSEC ) {
                this.#clients.delete(k);
                console.log('Client with', k, 'was purged for timeout')
            }
        }
    }

    callRPCFunction(clientId: TClientId, functionName: string, args: any){
        const calledClient = this.#clients.get(clientId);
        if (!calledClient) throw new Error('No such client');
        if (!calledClient.capacities.includes(functionName)) throw new Error('No such function');
        const { address, port } = calledClient;
        return this.callRemoteFunction(address, port, functionName, args)
        // const result = this.callRemoteFunction()
    }
}



export const udpService = new UDPServerService()