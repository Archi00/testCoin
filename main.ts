import * as bodyParser from "body-parser";
import * as express from "express";

import { Block, generateBlock, getBlockchain } from "./blockchain";
const initHttpServer = (_myHttpPort: number) => {
    const app = express();
    app.use(bodyParser.json());

    app.get("/blocks", (req, res) => {
        res.send(getBlockchain());
    });

    app.post("/mineBlock", (req, res) => {
        const newBlock: Block = generateBlock(req.body.data);
        res.send(newBlock);
    });

    app.get("/peers", (req, res) => {
        res.send(getSockets().map(( s: any ) => s._socket.remoteAddress + ":" + s._socket.remotePort));
    });

    app.post("/addPeer", (req, res) => {
        connectToPeers(req.body.peer);
        res.send();
    });

    app.listen(_myHttpPort, () => {
        console.log("Listening http on port: " + _myHttpPort);
    });
};