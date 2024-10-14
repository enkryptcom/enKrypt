import { ProviderName, UIExportOptions } from "@/types/provider";
import getRoutes from "./routes";
const uiexport: UIExportOptions = {
  providerName: ProviderName.polkadot,
  routes: getRoutes(ProviderName.polkadot),
};
export default uiexport;
