const normalize = (val: number, max: number, min: number): number => {
  return (val - min) / (max - min);
};

export default class Sparkline {
  private _values: number[];

  public constructor(values: number[] = [], maxValues: number) {
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
  }

  public get dataValues(): string {
    return JSON.stringify(this._values);
  }
}
