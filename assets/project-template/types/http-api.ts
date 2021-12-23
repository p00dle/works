import type { UserApi } from '~/components/user/http-endpoints';
import type { LocalAuthApi } from '~/services/local-auth/http-endpoints';
import type { HttpApiParser } from 'works';

export type HttpApi = HttpApiParser<
  & UserApi
  & LocalAuthApi
>;