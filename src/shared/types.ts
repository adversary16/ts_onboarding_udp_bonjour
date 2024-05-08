import { UUID } from "crypto"

export type TUDPServerCommand = ''

export type TUDPMessageType = string

export type TUDPRpcCallSuccess = {

}
export type TUDPClientResponse = ''

export type TClientId = UUID
export type TMessageID = UUID


export type TUDPMessage = [ TUDPMessageType, any, TMessageID ]

export const isValidMessage = (message: any): message is TUDPMessage => {
    return Array.isArray(message) && message.length >= 3 && typeof message[2] === 'string'
}