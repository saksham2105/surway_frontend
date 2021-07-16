export class UserGroupModel {
  constructor(
    public groupID: string,
    public creatorMail: string,
    public groupName: string,
    public groupMembers: Array<string>,
    public timestamp: string
  ) {}
}
