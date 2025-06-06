import { AXIOS } from '../utils/axiosConfig';
import { SendErrorToBackendType } from './types';

export const sendErrorToBackend = async (data: SendErrorToBackendType) => {
  return await AXIOS({
    url: `/log-error`,
    method: 'POST',
    data: JSON.stringify({
      RequestURL: data.requestURL,
      Response: data.response,
      RequestBody: data.requestBody,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
};
