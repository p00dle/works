// @works:next_type_import

// @works:next_value_import


export type AllKeyValues = 
  & { }
  // @works:next_type
;

export const initialKeyValues: Partial<AllKeyValues> = [
  // @works:next_value
].reduce((prev, current) => Object.assign(prev, current), {});