import { UUID } from "crypto";
import { RemoteInfo } from "dgram";
import { UDPService } from "../../../shared/classes/udp.class";

class UDPServerService extends UDPService{
    #clients = new Map<string, any>()
    constructor(){
        super();
        this.#init()
    }

    #init(){
        this.on('hello', this.#registerClient.bind(this));
    }

    #registerClient(clientID: UUID, clientRemoteInfo: RemoteInfo){
        const timestamp = Date.now();
        console.log({ timestamp})
    }
}



export const udpService = new UDPServerService()