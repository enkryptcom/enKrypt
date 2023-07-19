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
import opalNode from "./unique/opal";
import quartzNode from "./unique/quartz";
import uniqueNode from "./unique/unique";
import penNode from "./pendulum/pendulum";
import ampeNode from "./pendulum/amplitude";
import varaNode from "./vara";

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
  opal: opalNode,
  quartz: quartzNode,
  unique: uniqueNode,
  pendulum: penNode,
  amplitude: ampeNode,
  vara: varaNode,
};
