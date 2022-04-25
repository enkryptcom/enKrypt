import { polkadotIcon } from "@polkadot/ui-shared";
type options = {
  size?: number;
  isAlternative?: boolean;
};
const createIcon = (address: string, options?: options): string => {
  options = options || {};
  const circles = polkadotIcon(address, {
    isAlternative: options.isAlternative || true,
  })
    .map(
      ({ cx, cy, fill, r }) =>
        `<circle cx="${cx}" cy="${cy}" fill="${fill}" r="${r}" />`
    )
    .join("");
  const svgHtml = `<svg height="${
    options.size || 32
  }" viewBox='0 0 64 64' width="${options.size || 32}">${circles}</svg>`;
  const ele = document.createElement("div");
  ele.innerHTML = svgHtml;
  const svgString = new XMLSerializer().serializeToString(ele.children[0]);
  const base64 = Buffer.from(svgString).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
};

export default createIcon;
