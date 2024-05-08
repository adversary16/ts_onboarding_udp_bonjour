import { randomUUID } from "crypto";
import { RemoteInfo, createSocket } from "dgram";
import EventEmitter from "events";
import { UDP_SERVICE_SERVER_PORT, UDP_SERVICE_SOCKET_TYPE } from "../../config";
import { UDP_BROADCAST_ADDRESS, UDP_STATE } from "../../constants";
import { TClientId, TUDPMessage, TUDPMessageType, isValidMessage } from "../../types";

export class UDPService extends EventEmitter {
    static STATES = UDP_STATE;

    #socket = createSocket(UDP_SERVICE_SOCKET_TYPE);

    #init(listenPort: number) {
        this.#socket.on('listening', this.#initSocket.bind(this, listenPort));
        this.#socket.on('message', this.#handleMessage.bind(this));
        this.#socket.bind(listenPort);
    }

    constructor(listenPort: number = UDP_SERVICE_SERVER_PORT){
        super();
        try {
            this.#init(listenPort)
        } catch (error: any) {
            this.emit(UDPService.STATES.UDP_STATE_ERROR, { message: error?.message ?? error });
        }
    }

    #initSocket(listenPort: number){
        console.log(`listening ${UDP_SERVICE_SOCKET_TYPE} on port ${listenPort}`);
        this.#socket.setBroadcast(true);
        this.emit(UDPService.STATES.UDP_STATE_READY);
    }

    #handleMessage(msg: Buffer, remotePeer: RemoteInfo){
        console.log(msg.toString('utf-8'), remotePeer);
        try {
            const message: TUDPMessage = JSON.parse(msg.toString('utf-8'));
            if (!isValidMessage(message)) throw new Error('Message malformed');
            const [ messageType, payload, messageId ] = message;
            const isAck = ['RESULT_OK', 'RESULT_ERROR'].includes(messageType);
            this.emit(isAck ? messageId : messageType, { payload, messageId })

        } catch (e) {
            console.error({ e })
        }

    }

    public broadcast(port: number, messageType: TUDPMessageType, payload?: Object){
        this.#send(UDP_BROADCAST_ADDRESS, port, messageType, payload)
    }

    async #send(address: string, port: number, messageType: TUDPMessageType, payload?: any){
        const payloadOffset = 0;
        const messageId = randomUUID();
        const message: TUDPMessage = [ messageType.toUpperCase(), payload, messageId ]
        const serializedPayload = JSON.stringify(message);
        return new Promise((resolve, reject) => {
            // const failureTimeout = setTimeout(() => {
            //     reject('Timeout')
            // }, UDP_RPC_TIMEOUT_MSEC);
            const successHandler = (payload: any) => {
                console.log({ payload })
                resolve;
            }

            this.once<string>(messageId, successHandler);

            this.#socket.send(
                serializedPayload,
                payloadOffset,
                serializedPayload?.length,
                port, 
                address);
        })
    }

    public async callRemoteFunction(client: TClientId){}

    public addMessageListener(){

    }
}
