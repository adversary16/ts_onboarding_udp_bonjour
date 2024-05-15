export class AuthError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class ConfigError extends Error {
  constructor(
    public readonly module: string,
    message?: string
  ) {
    super(message);
  }
}

export class UdpError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class RpcError extends Error {
  constructor(message?: string) {
    super(message);
  }
}
