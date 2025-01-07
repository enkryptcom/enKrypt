import { Plugin } from 'vite';
import { dirname, relative } from 'node:path';

const assetsRewritePlugin: Plugin = {
  name: 'assets-rewrite',
  enforce: 'post',
  apply: 'build',
  transformIndexHtml(html, { path }) {
    const assetsPath = relative(dirname(path), '/assets').replace(/\\/g, '/');
    return html.replace(/"\/assets\//g, `"${assetsPath}/`);
  },
};

export default assetsRewritePlugin;
