export class ViewUtilities {
  private static _longWidthTableItems: Array<string> =[
    'company',
    'job_role',
    'cv'
  ];



  private static _shortWidthTableItems: Array<string> =[
    'date',
  ];

  public static checkItemForLongElegibility(item: string):boolean {
    return this._longWidthTableItems.includes(item);
  }

  public static checkItemForShortElegibility(item: string): boolean {
    return this._shortWidthTableItems.includes(item);
  }

}
