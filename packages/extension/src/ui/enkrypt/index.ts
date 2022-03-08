import { ProviderName, UIExportOptions } from "@/types/provider";
import getRoutes from "./routes";
const uiexport: UIExportOptions = {
  providerName: ProviderName.enkrypt,
  routes: getRoutes(ProviderName.enkrypt),
};
export default uiexport;
