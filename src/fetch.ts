import fetch, { BodyInit, HeadersInit, Request } from 'node-fetch';

class ApiCallError extends Error {
  response: string;
  code: number;

  constructor(message: string, code: number, response: string) {
    super(message);
    this.response = response;
    this.code = code;
  }
}

export async function fetchDelete(
  url: string,
  body: BodyInit | null,
  logMessage: string,
) {
  return fetchRequest(url, 'DELETE', {}, body, logMessage);
}

export async function fetchPost(url: string, body: any, logMessage: string) {
  return fetchRequest(url, 'POST', {}, body, logMessage);
}

export async function fetchGet(url: string, logMessage: string) {
  return fetchRequest(url, 'GET', {}, null, logMessage);
}

export async function fetchPut(
  url: string,
  body: BodyInit | null,
  logMessage: string,
) {
  return fetchRequest(url, 'PUT', {}, body, logMessage);
}

const buildFetch = (tokenHeaders: HeadersInit) => async (
  url: string,
  method: string,
  headers: HeadersInit,
  body: BodyInit | null,
  logMessage: string,
) => {
  const apiCallId = uuid().substr(0, 6);
  logger.info('[API_CALL_ID %s] %s', apiCallId, logMessage);
  const requestHeaders = {
    'Content-Type': 'application/json',
    'x-api-call-id': apiCallId,
    ...tokenHeaders,
    ...headers,
  };

  logger.info(
    '[API_CALL_ID %s] <-- Request: [%s] %s body: %j headers %j',
    apiCallId,
    method,
    url,
    body,
    requestHeaders,
  );
  const request = {
    headers: requestHeaders,
    method,
  };
  if (body) {
    (request as any).body = JSON.stringify(body);
  }
  const response = await fetch(url, request);
  const result = await response.text();
  logger.info(
    '[API_CALL_ID %s] --> Response: [%s] %s [HTTP %s] response: "%j"',
    apiCallId,
    method,
    url,
    response.status,
    result,
  );

  if (response.status >= 300) {
    throw new ApiCallError(
      `${logMessage} FAILS becasue API error! Find "[API_CALL_ID ${apiCallId}]" to see more`,
      response.status,
      result,
    );
  }

  let data = null;
  try {
    data = JSON.parse(result);
  } catch (err) {
    logger.warn(
      '[API_CALL_ID %s] Incoming response isnt valid JSON [%s] %s [%s] response: "%s"',
      apiCallId,
      method,
      url,
      response.status,
      result,
    );
  }
  return data;
};

