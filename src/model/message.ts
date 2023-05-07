import { Directory } from "../utils/readDirectory";

type DiscriminatedUnion<K extends PropertyKey, T extends object> = {
  [P in keyof T]: ({ [Q in K]: P } & T[P]) extends infer U ? { [Q in keyof U]: U[Q] } : never
}[keyof T];

export type ToServer = DiscriminatedUnion<"type", {
  ident: {
    name: string;
  },
  connect: {},
  files: {},
  fileContent: {
    key: string;
    fileName: string;
  },
}>;

export type FromServer = DiscriminatedUnion<"type", {
  ident: {},
  connect: {},
  files: {
    files: Directory[];
  },
  fileContent: {
    key: string;
    data: string;
  },
}>;
