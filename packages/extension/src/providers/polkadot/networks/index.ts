import acaNode from "./acala/acala";
import dotNode from "./polkadot";
import ksmNode from "./kusama";
import karNode from "./acala/karura";
import wndNode from "./westend";
import astrNode from "./astar/astar";
import sdnNode from "./astar/shiden";

export default {
  acala: acaNode,
  karura: karNode,
  polkadot: dotNode,
  kusama: ksmNode,
  westend: wndNode,
  astar: astrNode,
  shiden: sdnNode,
};
