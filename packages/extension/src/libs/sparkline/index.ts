import memoizeOne from "memoize-one";

type DGetter = (
  values: number[],
  viewBoxWidth: number,
  viewBoxHeight: number,
  decimals: number
) => string;

const round = (n: number, decimals: number): number => {
  const power: number = 10 ** decimals;
  return Math.round(n * power) / power;
};
const normalize = (val: number, max: number, min: number): number => {
  return (val - min) / (max - min);
};
const getD: DGetter = (
  values: number[],
  viewBoxWidth: number,
  viewBoxHeight: number,
  decimals: number
): string => {
  const l: string[] = [];
  const maxX: number = values.length - 1;
  const maxY: number = Math.max(...values);
  for (let i = 0; i <= maxX; i++) {
    l.push(
      round((i / maxX) * viewBoxWidth, decimals) +
        "," +
        round(viewBoxHeight - (values[i] / maxY) * viewBoxHeight, decimals)
    );
  }
  return `M ${l.join(" L ")}`;
};

export default class Sparkline {
  private _decimals: number;
  private _desc: string;
  private _fill: string;
  private _getD: DGetter;
  private _height: string;
  private _preserveAspectRatio: string;
  private _stroke: string;
  private _strokeWidth: number | string;
  private _title: string;
  private _values: number[];
  private _viewBoxHeight: number;
  private _viewBoxWidth: number;
  private _width: string;

  public constructor(values: number[] = [], maxValues: number) {
    this._decimals = 10;
    this._desc = "A line graph representation of a value's change over time.";
    this._fill = "transparent";
    this._getD = memoizeOne(getD);
    this._height = "100%";
    this._preserveAspectRatio = "none";
    this._stroke = "currentColor";
    this._strokeWidth = "1.5%";
    this._title = "Sparkline";
    this._width = "100%";
    this._values = values.filter(
      (val, idx) => idx % parseInt((values.length / maxValues).toString()) === 0
    );
    this._values.push(values[values.length - 1]);
    this._values = this._values.map((val) => {
      return (
        normalize(val, Math.max(...this._values), Math.min(...this._values)) *
        100
      );
    });
    this._viewBoxHeight = 100;
    this._viewBoxWidth = 100;
  }

  public get d(): string {
    return this._getD(
      this._values,
      this._viewBoxWidth,
      this._viewBoxHeight,
      this._decimals
    );
  }

  public get dataUri(): string {
    return `data:image/svg+xml;base64,${Buffer.from(this.outerHTML).toString(
      "base64"
    )}`;
  }

  public get outerHTML(): string {
    let fillPath = "";
    let strokePath = "";

    // If values exist,
    if (this._values.length !== 0) {
      strokePath = `
        <path
          d="${this.d}"
          fill="transparent"
          stroke="${this._stroke}"
          stroke-width="${this._strokeWidth}"
        />
      `;

      // If a fill color exists,
      if (this._fill !== "transparent") {
        const d: string =
          `L ${this._viewBoxWidth},${this._viewBoxHeight} ` +
          `L 0,${this._viewBoxHeight} Z`;
        fillPath = `
          <path
            d="${this.d} ${d}"
            fill="${this._fill}"
            stroke="transparent"
            stroke-width="0"
          />
        `;
      }
    }

    return `<?xml version="1.0" encoding="utf-8"?>
      <svg
        height="${this._height}"
        preserveAspectRatio="${this._preserveAspectRatio}"
        version="1.1"
        viewBox="0 0 ${this._viewBoxWidth} ${this._viewBoxHeight}"
        x="0px"
        xml:space="preserve"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        y="0px"
        width="${this._width}"
      >
        <title>${this._title}</title>
        <desc>${this._desc}</desc>
        ${fillPath}
        ${strokePath}
      </svg>
    `;
  }

  public setDecimals(decimals: number): this {
    this._decimals = decimals;
    return this;
  }

  public setDesc(desc: string): this {
    this._desc = desc;
    return this;
  }

  public setDescription(desc: string): this {
    this._desc = desc;
    return this;
  }

  public setFill(fill: string): this {
    this._fill = fill;
    return this;
  }

  public setHeight(height: string): this {
    this._height = height;
    return this;
  }

  public setPreserveAspectRatio(preserveAspectRatio: string): this {
    this._preserveAspectRatio = preserveAspectRatio;
    return this;
  }

  public setStroke(stroke: string): this {
    this._stroke = stroke;
    return this;
  }

  public setStrokeWidth(strokeWidth: number | string): this {
    this._strokeWidth = strokeWidth;
    return this;
  }

  public setTitle(title: string): this {
    this._title = title;
    return this;
  }

  public setValues(values: number[]): this {
    this._values = values;
    return this;
  }

  public setViewBoxHeight(viewBoxHeight: number): this {
    this._viewBoxHeight = viewBoxHeight;
    return this;
  }

  public setViewBoxWidth(viewBoxWidth: number): this {
    this._viewBoxWidth = viewBoxWidth;
    return this;
  }

  public setWidth(width: string): this {
    this._width = width;
    return this;
  }
}
