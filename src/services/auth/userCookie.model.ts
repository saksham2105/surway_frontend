export class UserCookieModel {
  constructor(
    public firstName: string,
    public secondName: string,
    public email: string,
    public verified: boolean,
    public huCoins: number,
    public contact: string,
    public subscribed: boolean,
    public registeredDate: string,
    public imageString: string
  ) {}
}
