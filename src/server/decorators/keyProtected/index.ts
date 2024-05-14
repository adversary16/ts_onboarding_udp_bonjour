import { createHash } from "crypto";
import { Request, Response } from "express";
import { existsSync, readFileSync, statSync } from "fs";
import { join, resolve } from "path";
import { AuthError } from "../../errors";

const authKeySymbol = Symbol.for('authKey');

export const DEFAULT_KEY_FILE_NAME = 'key.txt'

const getKeyString = (keyPath: string) =>  {
  let normalizedPath = resolve(keyPath);
  try {
    const isDirectory = statSync(normalizedPath)?.isDirectory();
    if (isDirectory) {
        const pathToKeyFile = join(normalizedPath, DEFAULT_KEY_FILE_NAME);
        if (!existsSync(pathToKeyFile)) {
          throw new Error('KEYPROTECTED_KEYFILE_MISSING')
        }
        normalizedPath = pathToKeyFile;
      }
      return readFileSync(normalizedPath, 'utf-8').trim();
  } catch {
    throw new Error('KEYPROTECTED_KEYFILE_MISSING')
  }

}

const hashString = (openString: string) => createHash('sha256').update(openString).digest('hex');

export function KeyProtected(keyPath: string){
    const keyHash = hashString(getKeyString(keyPath));
  
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
          const decoratedMethod = descriptor.value;
          descriptor.value = function(req: Request, res: Response) {
            try {
              const  { key } = req.query;
              if (!key) throw new AuthError('KEYPROTECTED_NO_KEY_PROVIDED')
              const hashedCandidateKey = hashString(<string>key);
              res.locals.data = { [authKeySymbol]: hashedCandidateKey };
              if (hashedCandidateKey !== keyHash) throw new AuthError('KEYPROTECTED_WRONG_PASSWORD');
              return decoratedMethod.call(this, req, res)
            } catch (e: any){
              res.status(401).send(e?.message ?? e)
            }
            }
      }
    }