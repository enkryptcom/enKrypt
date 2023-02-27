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
import unqNode from "./unique/unique";
import qtzNode from "./unique/quartz";
import oplNode from "./unique/opal";

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
  unique: unqNode,
  quartz: qtzNode,
  opal: oplNode,
};
