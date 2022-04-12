import {
  Transaction,
  TransactionStatus,
  TransactionDirection,
} from "./transaction";
import { Account } from "./account";
import { Token } from "./token";
import { DAppsItem } from "./dapps";
import { NFTAuthor } from "./nft";

export const transactionsOne: Transaction[] = [
  {
    from: {
      name: "My Main Account 1",
      address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    to: {
      name: "My Main Account 2",
      address: "0x14502CF6C0A13167Dc340E25Dabf5FBDB68R5967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    token: {
      name: "Polkadot",
      symbol: "dot",
      icon: "https://mpolev.ru/enkrypt/polkadot.png",
      amount: 100.5,
      price: 300,
    },
    amount: 6625,
    cryptoAmount: 400,
    status: TransactionStatus.progress,
    date: 1647233180000,
    direction: TransactionDirection.incoming,
  },
  {
    from: {
      name: "My Main Account 1",
      address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    to: {
      name: "My Main Account 2",
      address: "0x14502CF6C0A13167Dc340E25Dabf5FBDB68R5967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    token: {
      name: "Polkadot",
      symbol: "dot",
      icon: "https://mpolev.ru/enkrypt/polkadot.png",
      amount: 100.5,
      price: 300,
    },
    amount: 6625,
    cryptoAmount: 400,
    status: TransactionStatus.progress,
    date: 1647152486000,
    direction: TransactionDirection.outgoing,
  },
  {
    from: {
      name: "My Main Account 1",
      address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    to: {
      name: "My Main Account 2",
      address: "0x14502CF6C0A13167Dc340E25Dabf5FBDB68R5967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    token: {
      name: "Polkadot",
      symbol: "dot",
      icon: "https://mpolev.ru/enkrypt/polkadot.png",
      amount: 100.5,
      price: 300,
    },
    amount: 6625,
    cryptoAmount: 100,
    status: TransactionStatus.success,
    date: 1645152486000,
    direction: TransactionDirection.outgoing,
  },
];

export const transactionsTwo: Transaction[] = [
  {
    from: {
      name: "My Main Account 1",
      address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    to: {
      name: "My Main Account 2",
      address: "0x14502CF6C0A13167Dc340E25Dabf5FBDB68R5967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    token: {
      name: "Polkadot",
      symbol: "dot",
      icon: "https://mpolev.ru/enkrypt/polkadot.png",
      amount: 100.5,
      price: 300,
    },
    amount: 16625,
    cryptoAmount: 200,
    status: TransactionStatus.failed,
    date: 1645152456000,
    direction: TransactionDirection.outgoing,
  },
  {
    from: {
      name: "My Main Account 1",
      address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    to: {
      name: "My Main Account 2",
      address: "0x14502CF6C0A13167Dc340E25Dabf5FBDB68R5967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    token: {
      name: "Polkadot",
      symbol: "dot",
      icon: "https://mpolev.ru/enkrypt/polkadot.png",
      amount: 100.5,
      price: 300,
    },
    amount: 6625,
    cryptoAmount: 400,
    status: TransactionStatus.progress,
    date: 1647152486000,
    direction: TransactionDirection.incoming,
  },
  {
    from: {
      name: "My Main Account 1",
      address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    to: {
      name: "My Main Account 2",
      address: "0x14502CF6C0A13167Dc340E25Dabf5FBDB68R5967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    token: {
      name: "Polkadot",
      symbol: "dot",
      icon: "https://mpolev.ru/enkrypt/polkadot.png",
      amount: 100.5,
      price: 300,
    },
    amount: 6625,
    cryptoAmount: 100,
    status: TransactionStatus.success,
    date: 1645152486000,
    direction: TransactionDirection.outgoing,
  },
  {
    from: {
      name: "My Main Account 1",
      address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    to: {
      name: "My Main Account 2",
      address: "0x14502CF6C0A13167Dc340E25Dabf5FBDB68R5967",
      amount: 0.2,
      primaryToken: {
        name: "Ethereum",
        symbol: "eth",
        icon: "https://mpolev.ru/enkrypt/eth.png",
        amount: 0.5,
        price: 2500,
      },
    },
    token: {
      name: "Polkadot",
      symbol: "dot",
      icon: "https://mpolev.ru/enkrypt/polkadot.png",
      amount: 100.5,
      price: 300,
    },
    amount: 16625,
    cryptoAmount: 200,
    status: TransactionStatus.failed,
    date: 1645152456000,
    direction: TransactionDirection.outgoing,
  },
];

export const accountsActive: Account[] = [
  {
    name: "My Main Account",
    address: "0x03502CF6C0A13167Dc2D0E25Dabf5FBDB68C5968",
    amount: 1.321,
    primaryToken: {
      name: "Ethereum",
      symbol: "eth",
      icon: "https://mpolev.ru/enkrypt/eth.png",
      amount: 0.5,
      price: 2500,
    },
  },
  {
    name: "My Main Account 2",
    address: "0x03502CF6C0A13167Dc2D0E25Dabf5FBDB68C5967",
    amount: 2.332,
    primaryToken: {
      name: "Ethereum",
      symbol: "eth",
      icon: "https://mpolev.ru/enkrypt/eth.png",
      amount: 0.5,
      price: 2500,
    },
  },
  {
    name: "My Main Account 3",
    address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
    amount: 0.2,
    primaryToken: {
      name: "Ethereum",
      symbol: "eth",
      icon: "https://mpolev.ru/enkrypt/eth.png",
      amount: 0.5,
      price: 2500,
    },
  },
];

export const accountsInActive: Account[] = [
  {
    name: "My Main Account 4",
    address: "0x13202CF6C0A13167Dc2D0E25Dabf5FBDB68C5967",
    amount: 0.22,
    primaryToken: {
      name: "Ethereum",
      symbol: "eth",
      icon: "https://mpolev.ru/enkrypt/eth.png",
      amount: 0.5,
      price: 2500,
    },
  },
  {
    name: "My Main Account 5",
    address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
    amount: 0.2,
    primaryToken: {
      name: "Ethereum",
      symbol: "eth",
      icon: "https://mpolev.ru/enkrypt/eth.png",
      amount: 0.5,
      price: 2500,
    },
  },
  {
    name: "My Main Account 6",
    address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
    amount: 0.2,
    primaryToken: {
      name: "Ethereum",
      symbol: "eth",
      icon: "https://mpolev.ru/enkrypt/eth.png",
      amount: 0.5,
      price: 2500,
    },
  },
  {
    name: "My Main Account 7",
    address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
    amount: 0.2,
    primaryToken: {
      name: "Ethereum",
      symbol: "eth",
      icon: "https://mpolev.ru/enkrypt/eth.png",
      amount: 0.5,
      price: 2500,
    },
  },
  {
    name: "My Main Account 8",
    address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
    amount: 0.2,
    primaryToken: {
      name: "Ethereum",
      symbol: "eth",
      icon: "https://mpolev.ru/enkrypt/eth.png",
      amount: 0.5,
      price: 2500,
    },
  },
  {
    name: "My Main Account 9",
    address: "0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967",
    amount: 0.2,
    primaryToken: {
      name: "Ethereum",
      symbol: "eth",
      icon: "https://mpolev.ru/enkrypt/eth.png",
      amount: 0.5,
      price: 2500,
    },
  },
];

export const assets: Token[] = [
  {
    name: "Ethereum",
    symbol: "eth",
    icon: "https://mpolev.ru/enkrypt/eth.png",
    amount: 0.5,
    price: 2500,
  },
  {
    name: "Uniswap",
    symbol: "uni",
    icon: "https://mpolev.ru/enkrypt/uni.png",
    amount: 20.5,
    price: 400,
  },
  {
    name: "yearn.finance",
    symbol: "yfi",
    icon: "https://mpolev.ru/enkrypt/yearn.png",
    amount: 120,
    price: 134,
  },
  {
    name: "Ethereum",
    symbol: "eth",
    icon: "https://mpolev.ru/enkrypt/eth.png",
    amount: 0.5,
    price: 2500,
  },
  {
    name: "Uniswap",
    symbol: "uni",
    icon: "https://mpolev.ru/enkrypt/uni.png",
    amount: 20.5,
    price: 400,
  },
  {
    name: "yearn.finance",
    symbol: "yfi",
    icon: "https://mpolev.ru/enkrypt/yearn.png",
    amount: 120,
    price: 134,
  },
];

export const dapps: DAppsItem[] = [
  {
    title: "Rarible",
    link: "rarible.com",
    description: "Create, sell or collect digital items.",
    isFavorites: false,
    image: "https://mpolev.ru/cx/rarible.png",
  },
  {
    title: "Uniswap",
    link: "app.uniswap.org",
    description: "Earn interest, deposit and borrow assets.",
    isFavorites: true,
    image: "https://mpolev.ru/cx/uniswap.png",
  },
  {
    title: "Unstoppable domains",
    link: "rarible.com",
    description: "Get a .crypto domain for your Ethereum account.",
    isFavorites: false,
    image: "https://mpolev.ru/cx/rarible.png",
  },
  {
    title: "DAppRadar Portfolio Tracker",
    link: "app.uniswap.org",
    description: "Visualize and track your holdings.",
    isFavorites: true,
    image: "https://mpolev.ru/cx/rarible.png",
  },
  {
    title: "Loopring Exchange",
    link: "rarible.com",
    description: "Decentralized Layer 2 exchange.",
    isFavorites: false,
    image: "https://mpolev.ru/cx/rarible.png",
  },
];

export const singleAccount: Account = {
  name: "My Main Account",
  address: "0x03502CF6C0A13167Dc2D0E25Dabf5FBDB68C5968",
  amount: 1.321,
  primaryToken: {
    name: "Ethereum",
    symbol: "eth",
    icon: require("@/ui/action/icons/raw/eth-logo.png"),
    amount: 0.5,
    price: 2500,
  },
};

export const nfts: NFTAuthor[] = [
  {
    id: 1,
    name: "Azuki",
    image: require("@/ui/action/icons/raw/azuki.png"),
    items: [
      {
        id: 1,
        name: "Azuki #4262",
        image: require("@/ui/action/icons/raw/azuki-pic-1.png"),
        price: 9.9,
      },
    ],
  },
  {
    id: 2,
    name: "Cool Cats",
    image: require("@/ui/action/icons/raw/cool-cats.png"),
    items: [
      {
        id: 1,
        name: "Cool Cat #6288",
        image: require("@/ui/action/icons/raw/cool-cats-pic-1.png"),
        price: 2.9,
      },
      {
        id: 2,
        name: "Cool Cat #6486",
        image: require("@/ui/action/icons/raw/cool-cats-pic-2.png"),
        price: 0.9,
      },
      {
        id: 3,
        name: "Cool Cat #2486",
        image: require("@/ui/action/icons/raw/cool-cats-pic-3.png"),
        price: 10.9,
      },
    ],
  },
];
