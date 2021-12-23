// import { endpoint } from '../factories/endpoint';
// import { Api } from '../types/endpoint';

// type User = any;



// interface Case {
//   caseId: string;
//   closed: number;
//   opened: number;
// }

// async function uploadCases(_: Case[]) {} 

// export const casesRoutes = {
//   '/cases': {
//     GET: endpoint({
//       accessControl: (user: User) => !!user.active && user.role === 'Grunt',
//       query: {bool: 'boolean', str: 'string', arr: 'string[]' },
//       controller: async ({bool, str, arr}) => bool ? str: arr
//     }),
//     POST: endpoint({
//       accessControl: (user: User) => user.role === 'Admin',
//       query: {date: 'date'},
//       controller: async ({date},payload: Case[]) => {
//         await uploadCases(payload);
//         console.log(date);
//         return 'OK'
//       }
//     })
//   }
// } as const;


// export const auditRoutes = {
//   '/audits': {
//     GET: endpoint({
//       accessControl: (user: User) => !!user.active && user.role === 'Manager',
//       query: {date: 'date'},
//       controller: ({date}) => date > 0 ? 'yes' : 'no'
//     })
//   }
// } as const;

// const router = {
//   ...casesRoutes,
//   ...auditRoutes
// }

// export type API = Api<typeof router>;
