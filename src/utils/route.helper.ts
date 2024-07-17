import { RouteParamsRaw } from 'vue-router';
import router from '@router';

const getRemovedSlashPath = (path: string) => path.replace('/', '');

export const getRouteName = (path: string): string => {
  if (path === '/') {
    const homeName = 'home';
    return homeName;
  }
  return getRemovedSlashPath(path);
};

export const pushPage = (routePath: string): void => {
  router.push({ name: getRouteName(routePath) });
};

export const pushPageWithParams = (
  routePath: string,
  params: RouteParamsRaw,
): void => {
  router.push({
    name: getRouteName(routePath),
    params,
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pushPageWithQuery = (routePath: string, query: any) => {
  router.push({
    name: getRouteName(routePath),
    query,
  });
};

export default {
  getRouteName,
  pushPage,
  pushPageWithParams,
  pushPageWithQuery,
};
