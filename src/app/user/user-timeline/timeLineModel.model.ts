export class HuCoinsTimeLineModel {
  constructor(
    public indexID: string,
    public imageIconPath: string,
    public purchaseType: string,
    public huCoinsUsed: string,
    public timestamp: string
  ) {}
}

export class ActivityTimeLineModel {
  constructor(public desc: string, public timestamp: string) {}
}
