export class UserModel {
  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
    public password: string,
    public verified: boolean,
    public huCoins: number,
    public contact: string,
    public subscribed: boolean,
    public collaborators: Array<Object>,
    public prevRoute: string,
    public registeredDate: string,
    public imageString: string
  ) {}
}
