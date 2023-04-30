import * as vscode from "vscode";
import * as dgram from "dgram";

import { getMode } from "./state";

export class Sonar {
  private socket: dgram.Socket = dgram.createSocket("udp4");
  private searcher: NodeJS.Timeout | undefined;
  private callbacks: { found: ((msg: any) => void)[] } = { found: [] };

  constructor() {
    this.student();
  }

  instructor(pin: string) {
    if (this.socket !== undefined) {
      this.socket.close();
      clearInterval(this.searcher);
    }
    this.socket = dgram.createSocket("udp4");
    this.socket.on("listening", () => {
      this.socket.setBroadcast(true);
    });
    this.socket.on("message", (msg, rinfo) => {
      if (msg.toString() === `Campfire:${pin}`) {
        this.socket.send(msg, rinfo.port, rinfo.address);
      }
    });
    this.socket.bind(14352);
  }

  student() {
    if (this.socket !== undefined) {
      this.socket.close();
      clearInterval(this.searcher);
    }
    this.socket = dgram.createSocket("udp4");
    this.socket.on("listening", () => {
      function search(socket: dgram.Socket) {
        let instructor = vscode.workspace
          .getConfiguration("campfire")
          .get<string>("instructor");
        let host = "255.255.255.255";
        if (instructor !== undefined && instructor !== "") {
          host = instructor;
        }
        socket.setBroadcast(host === "255.255.255.255");
        const pin = vscode.workspace
          .getConfiguration("campfire")
          .get<string>("pin");
        if (getMode() !== "searching") {
          return;
        }
        if (pin === undefined || pin === "") {
          return;
        }
        socket.send(`Campfire:${pin}`, 14352, host);
      }
      this.searcher = setInterval(() => {
        search(this.socket);
      }, 5000);
      search(this.socket);
    });
    this.socket.on("message", (msg, rinfo) => {
      const pin = vscode.workspace
        .getConfiguration("campfire")
        .get<string>("pin");
      if (pin === undefined || pin === "") {
        return;
      }
      if (msg.toString() === `Campfire:${pin}`) {
        this.callbacks.found.forEach((callback) => {
          callback(rinfo);
        });
      }
    });
    try {
      this.socket.bind();
    } catch (e) {
      console.error(e);
    }
  }

  onFound(callback: (msg: any) => void) {
    if (this.callbacks.found === undefined) {
      this.callbacks.found = [];
    }
    this.callbacks.found.push(callback);
  }
}
