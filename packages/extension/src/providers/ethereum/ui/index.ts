import { ProviderName, UIExportOptions } from "@/types/provider";
import getRoutes from "./routes";
const uiexport: UIExportOptions = {
  providerName: ProviderName.ethereum,
  routes: getRoutes(ProviderName.ethereum),
};
export default uiexport;
