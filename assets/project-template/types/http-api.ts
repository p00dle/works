import type { UserGetApi, UserPostApi } from '~/components/user/http-endpoints';
import type { LocalAuthGetApi, LocalAuthPostApi } from '~/services/local-auth/http-endpoints';
import type { HttpGetApiParser, HttpPostApiParser } from 'works';
// @works:next_import

export type HttpGetApi = HttpGetApiParser<
  & UserGetApi
  & LocalAuthGetApi
  // @works:next_get_api
>;

export type HttpPostApi = HttpPostApiParser<
  & UserPostApi
  & LocalAuthPostApi
  // @works:next_post_api
>;