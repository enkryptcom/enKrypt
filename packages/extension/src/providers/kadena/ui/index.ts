import { ProviderName, UIExportOptions } from '@/types/provider';
import getRoutes from './routes';
const uiexport: UIExportOptions = {
  providerName: ProviderName.kadena,
  routes: getRoutes(ProviderName.kadena),
};
export default uiexport;
