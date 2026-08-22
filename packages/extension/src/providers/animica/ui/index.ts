import { ProviderName, UIExportOptions } from '@/types/provider';
import getRoutes from './routes';

const uiExport: UIExportOptions = {
  providerName: ProviderName.animica,
  routes: getRoutes(ProviderName.animica),
};

export default uiExport;
