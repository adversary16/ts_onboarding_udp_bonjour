import { UUID } from "crypto"
import { RemoteInfo } from "dgram"

export type TUDPServerCommand = ''

export type TUDPMessageType = string

export type TUDPRpcCallSuccess = {

}
export type TUDPClientResponse = ''

export type TClientId = UUID
export type TMessageID = UUID


export type TUDPMessage = [ TUDPMessageType, any, TMessageID ]

export type TUDPHelloPayload = { clientId: TClientId, capacities: string[], logo?: string } 
export type TUDPHeartbeatPayload = { clientId: TClientId }

export const isValidMessage = (message: any): message is TUDPMessage => {
    return Array.isArray(message) && message.length >= 3 && typeof message[2] === 'string'
}

export type TUDPMessageEventPayload = { payload: TUDPMessage, messageId: TMessageID, sender: RemoteInfo }

export type TUDPMessageHandler = (payload: any, sender: RemoteInfo) => Promise<any> | any