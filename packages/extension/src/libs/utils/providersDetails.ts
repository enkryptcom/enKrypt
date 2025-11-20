import { ProviderName, ProviderNameProper } from "@enkryptcom/swap/src/types"

import changellyLogo from '@/ui/action/assets/swap/changelly-logo.png'
import oneInch from '@/ui/action/assets/swap/1inch-logo.png'
import paraswap from '@/ui/action/assets/swap/paraswap-logo.png'
import zerox from '@/ui/action/assets/swap/0x-logo.png'
import rango from '@/ui/action/assets/swap/rango-logo.png'
import jupiter from '@/ui/action/assets/swap/jupiter-logo.png'
import okx from '@/ui/action/assets/swap/okx-logo.png'

export default {
  [ProviderName.changelly]: { name: ProviderNameProper.changelly, logo: changellyLogo },
  [ProviderName.oneInch]: { name: ProviderNameProper.oneInch, logo: oneInch },
  [ProviderName.oneInchFusion]: { name: ProviderNameProper.oneInchFusion, logo: oneInch },
  [ProviderName.paraswap]: { name: ProviderNameProper.paraswap, logo: paraswap },
  [ProviderName.zerox]: { name: ProviderNameProper.zerox, logo: zerox },
  [ProviderName.rango]: { name: ProviderNameProper.rango, logo: rango },
  [ProviderName.jupiter]: { name: ProviderNameProper.jupiter, logo: jupiter },
  [ProviderName.okx]: { name: ProviderNameProper.okx, logo: okx }
}