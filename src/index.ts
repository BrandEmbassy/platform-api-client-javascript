import { fetchRequest } from './fetch';
import { memoizedAuthenticate } from '../api/oauth';

export function createAuthorizedRequestFunction (httpMethod: string) {
  return async function authorizedRequest (
    brandId: number,
    url: string,
    body: any,
    logMessage: string,
  ) {
    const token = await memoizedAuthenticate(brandId);
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return fetchRequest(url, httpMethod, headers, body, logMessage);
  };
}

export async function authorizedGetRequest (
  brandId: number,
  url: string,
  logMessage: string,
) {
  const token = await memoizedAuthenticate(brandId);
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return fetchRequest(url, 'GET', headers, null, logMessage);
}

export const authorizedPostRequest = createAuthorizedRequestFunction('POST');
export const authorizedPutRequest = createAuthorizedRequestFunction('PUT');
export const authorizedDeleteRequest = createAuthorizedRequestFunction(
  'DELETE',
);
