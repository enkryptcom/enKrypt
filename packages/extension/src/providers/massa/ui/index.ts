import { ProviderName, UIExportOptions } from '@/types/provider';
import getRoutes from './routes';

const uiExport: UIExportOptions = {
  providerName: ProviderName.massa,
  routes: getRoutes(ProviderName.massa),
};

export default uiExport;
