import { getNames } from './get-names'

const userNames = {
  single: { lower: 'user', upper: 'USER', camel: 'user', snake: 'user', kebab: 'user', pascal: 'User', title: 'User' },
  plural: { lower: 'users', upper: 'USERS', camel: 'users', snake: 'users', kebab: 'users', pascal: 'Users', title: 'Users' },
};

const pendingCaseNames = {
  single: { lower: 'pendingcase', upper: 'PENDINGCASE', camel: 'pendingCase', snake: 'pending_case', kebab: 'pending-case', pascal: 'PendingCase', title: 'Pending Case' },
  plural: { lower: 'pendingcases', upper: 'PENDINGCASES', camel: 'pendingCases', snake: 'pending_cases', kebab: 'pending-cases', pascal: 'PendingCases', title: 'Pending Cases' },
}

describe('getNames', () => {
  it('should work for case: lower, single', () => expect(getNames('user')).toEqual(userNames));
  it('should work for case: upper, single', () => expect(getNames('USER')).toEqual(userNames));  
  it('should work for case: camel, single', () => expect(getNames('pendingCase')).toEqual(pendingCaseNames));
  it('should work for case: snake, single', () => expect(getNames('pending_case')).toEqual(pendingCaseNames));
  it('should work for case: kebab, single', () => expect(getNames('pending-case')).toEqual(pendingCaseNames));
  it('should work for case: pascal, single', () => expect(getNames('PendingCase')).toEqual(pendingCaseNames));

  it('should work for case: lower, plural', () => expect(getNames('users')).toEqual(userNames));
  it('should work for case: upper, plural', () => expect(getNames('USERS')).toEqual(userNames));  
  it('should work for case: camel, plural', () => expect(getNames('pendingCases')).toEqual(pendingCaseNames));
  it('should work for case: snake, plural', () => expect(getNames('pending_cases')).toEqual(pendingCaseNames));
  it('should work for case: kebab, plural', () => expect(getNames('pending-cases')).toEqual(pendingCaseNames));
  it('should work for case: pascal, plural', () => expect(getNames('PendingCases')).toEqual(pendingCaseNames));

  it('should throw on non-string argument', () => {
    // @ts-expect-error
    expect(() => getNames(undefined)).toThrow();
    // @ts-expect-error
    expect(() => getNames(4)).toThrow();
  });
  it('should throw on zero-length string argument', () => expect(() => getNames('')).toThrow());
});