interface Window {
  [key: string]: any;
}
interface EnkryptWindow {
  enkrypt: {
    providers: {
      [key: string]: any;
    };
  };
  [key: string]: any;
}

declare const IS_MANIFEST_V3: boolean;
