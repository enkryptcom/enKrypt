import { ProviderName, UIExportOptions } from "@/types/provider";
import getRoutes from "./routes";
const uiExport: UIExportOptions = {
  providerName: ProviderName.bitcoin,
  routes: getRoutes(ProviderName.bitcoin),
};
export default uiExport;
