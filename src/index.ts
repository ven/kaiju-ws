import fs from "fs";
import path from "path";
import signale from "signale";
import { io, Socket } from "socket.io-client";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomIntFromInterval = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const addresses = fs
  .readFileSync(path.join(__dirname, "../", "wallets.txt"))
  .toString()
  .split("\n");

async function loopWallets(socket: Socket) {
  for (const address of addresses) {
    socket.emit(
      "DNAreduce",
      JSON.stringify([
        "DNAreduce",
        { amount: randomIntFromInterval(11, 16), wallet: address },
      ])
    );
    signale.success(`Finished on ${address}.`);
    await sleep(500);
  }
}

(async () => {
  const socket = io("https://dna-event.herokuapp.com");
  socket.on("DNAtotal", async (value: number | string) => {
    signale.info(`DNA Total: ${value}`);
    if (Number(value) > 0) {
      socket.removeAllListeners("DNAtotal");
      await loopWallets(socket);
    }
  });
})();
