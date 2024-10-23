import { ProviderName, UIExportOptions } from '@/types/provider';
import getRoutes from './routes';
const uiExport: UIExportOptions = {
  providerName: ProviderName.solana,
  routes: getRoutes(ProviderName.solana),
};
export default uiExport;
