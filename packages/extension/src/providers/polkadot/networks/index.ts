import acaNode from "./acala/acala";
import dotNode from "./polkadot";
import ksmNode from "./kusama";
import karNode from "./acala/karura";
import wndNode from "./westend";
import astrNode from "./astar/astar";
import sdnNode from "./astar/shiden";
import bncNode from "./bifrost/polkadot";
import bncKusamaNode from "./bifrost/kusama";
import edgNode from "./edgeware";
import penNode from "./pendulum/polkadot";
import ampeNode from "./pendulum/kusama";

export default {
  acala: acaNode,
  karura: karNode,
  polkadot: dotNode,
  kusama: ksmNode,
  westend: wndNode,
  astar: astrNode,
  shiden: sdnNode,
  bifrost: bncNode,
  bifrostKusama: bncKusamaNode,
  edgeware: edgNode,
  pendulum: penNode,
  amplitude: ampeNode,
};
