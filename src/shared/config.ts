import { SocketType } from "dgram";

export const UDP_SERVICE_SOCKET_TYPE: SocketType = 'udp4' as const;
export const UDP_SERVICE_SERVER_PORT: number = process.env.UDP_SERVICE_SERVER_PORT 
                                                                                    ? Number(process.env.UDP_SERVICE_SERVER_PORT) 
                                                                                    :  20023 as const;