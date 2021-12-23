// import { cache } from '../factories/cache';
// import { endpoint } from '../factories/endpoint';
// import { Api } from '../types/endpoint';
// type OrgTreeNode = { role: string, id: string, children?: OrgTreeNode }

// type UserRole = 'Admin' | 'Agent';

// interface User {
//   role: UserRole;
// }

// const orgTreeCache = cache(async ({role, unitId}: {role: UserRole, unitId: string}) => {
//     return {id: unitId, role} as OrgTreeNode;
//   },
//   ({userData}: {userData: User}, state) => {
//     state.role = userData.role;
//     return state;
//   }
// );
// orgTreeCache.invalidate();

// orgTreeCache.update({userData: {role: 'Admin'}})

// const orgTreeRoutes = {
//   '/org-tree': {
//     GET: endpoint({
//       query: {
//         unitType: 'string',
//         unitId: 'string',
//         role: ['Admin', 'Agent'],
//       },
//       controller: orgTreeCache.controller
//     })
//   }
// }

// export type OrgApi = Api<typeof orgTreeRoutes>
