import acaNode from './acala/acala';
import dotNode from './polkadot';
import ksmNode from './kusama';
import karNode from './acala/karura';
import wndNode from './westend';
import astrNode from './astar/astar';
import bncNode from './bifrost/polkadot';
import bncKusamaNode from './bifrost/kusama';
import uniqueNode from './unique/unique';
import penNode from './pendulum/pendulum';
import varaNode from './vara';
import {
  assethubDOT as assetHubDotNode,
  assethubKSM as assetHubKsmNode,
} from './assethub';

export default {
  acala: acaNode,
  karura: karNode,
  polkadot: dotNode,
  kusama: ksmNode,
  westend: wndNode,
  astar: astrNode,
  bifrost: bncNode,
  bifrostKusama: bncKusamaNode,
  unique: uniqueNode,
  pendulum: penNode,
  vara: varaNode,
  assetHubDOT: assetHubDotNode,
  assetHubKSM: assetHubKsmNode,
};
