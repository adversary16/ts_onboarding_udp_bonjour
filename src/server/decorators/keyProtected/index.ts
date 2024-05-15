import { createHash } from "crypto";
import { Request, Response } from "express";
import { existsSync, readFileSync, statSync } from "fs";
import { join, resolve } from "path";
import {
  KEYPROTECTED_HASH_ALGORITHM,
  KEYPROTECTED_KEY_FILE_NAME,
} from "./constants";
import {
  KEYPROTECTED_ERROR_KEYFILE_MISSING,
  KEYPROTECTED_ERROR_WRONG_PASSWORD,
} from "./errors";

const authKeySymbol = Symbol.for("authKey");

const getKeyString = (keyPath: string) => {
  let normalizedPath = resolve(keyPath);
  try {
    const isDirectory = statSync(normalizedPath)?.isDirectory();
    if (isDirectory) {
      const pathToKeyFile = join(normalizedPath, KEYPROTECTED_KEY_FILE_NAME);
      if (!existsSync(pathToKeyFile)) {
        throw KEYPROTECTED_ERROR_KEYFILE_MISSING;
      }
      normalizedPath = pathToKeyFile;
    }
    return readFileSync(normalizedPath, "utf-8").trim();
  } catch {
    throw KEYPROTECTED_ERROR_KEYFILE_MISSING;
  }
};

const hashString = (openString: string) =>
  createHash(KEYPROTECTED_HASH_ALGORITHM).update(openString).digest("hex");

export function KeyProtected(keyPath: string) {
  const keyHash = hashString(getKeyString(keyPath));

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const decoratedMethod = descriptor.value;
    descriptor.value = function (req: Request, res: Response) {
      try {
        const { key } = req.query;
        if (!key) throw KEYPROTECTED_ERROR_WRONG_PASSWORD;
        const hashedCandidateKey = hashString(<string>key);
        res.locals.data = { [authKeySymbol]: hashedCandidateKey };
        if (hashedCandidateKey !== keyHash)
          throw KEYPROTECTED_ERROR_WRONG_PASSWORD;
        return decoratedMethod.call(this, req, res);
      } catch (e: any) {
        res.status(401).send(e?.message ?? e);
      }
    };
  };
}
