// import { SendEventToSentry } from '@/utils/sentry';
import axios, { AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { sendErrorToBackend } from '../apis/utils';
import { customToast } from './toast';
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = Cookies.get('auth_token') ?? '';
    return token;
  } else {
    return null;
  }
};

export const getAuthorizationHeader = () => `Bearer ${getToken()}`;

const getURL = (env: string) => {
  // TODO: DO NOT EDIT HERE, it causes backend issues
  // if (env === 'development') return 'https://api.origins-dev.ordinox.xyz';
  if (env === 'development') return 'https://api-1.origins.ordinox.xyz';
  // if (env === "development") return "http://localhost:7890";
  if (env === 'production') return 'https://api-1.origins.ordinox.xyz';
  // if (env === 'production') return 'https://api1.odx.so';
  // if (env === 'staging') return 'https://api.origins-stage.ordinox.xyz';
  if (env === 'staging') return 'https://api-1.origins.ordinox.xyz';
};

const getPricefeedURL = (env: string) => {
  // TODO: DO NOT EDIT HERE, it causes backend issues
  // if (env === "development") return "https://api.origins-dev.ordinox.xyz";
  if (env === 'development') return 'https://api1.odx.so';
  if (env === 'production') return 'https://api1.odx.so';
  if (env === 'staging') return 'https://api1.odx.so://pf.od.exchange';
};

export const baseURL = getURL(process.env.NEXT_PUBLIC_ENV || 'development');
export const pricefeedBaseURL = getPricefeedURL(process.env.NEXT_PUBLIC_ENV || 'development');

const axiosPricefeedInstance = axios.create({
  baseURL: pricefeedBaseURL,
});

const axiosInstance = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: getAuthorizationHeader(),
  },
  withCredentials: false,
});

axiosInstance.interceptors.request.use(async function (config) {
  const token = getAuthorizationHeader();
  config.headers.Authorization = token;
  return config;
});

axiosInstance.interceptors.response.use(
  async function (result) {
    // const apiName = result?.config?.url;
    // console.log(`API result ${apiName}`, result);
    return result;
  },
  async function (error) {
    const apiName = error?.config?.url;
    console.log(`API error ${apiName}`, error);
    console.log(`API error message ${apiName}`, error.message);
    if (error?.response?.status === 401) {
      console.log('error', error);
      Cookies.remove('auth_token');
      // window.location.href = "/"; // Redirect to login page
    }

    // if (error.response.status === 401) {
    //   // Cookies.remove("auth_token");
    //   // localStorage.removeItem("auth_token");
    // }

    if (error?.response?.status === 502) {
      customToast({
        message: 'Services are down for maintenance, we will be back live soon',
        type: 'loading',
        id: 'maintenance',
      });
      return;
    }

    // SendEventToSentry(error);
    // if (error.code === 'ECONNABORTED') {
    //   // eslint-disable-next-line no-throw-literal
    //   throw error;
    // }
    if (!error?.config?.url?.includes('log-error') && error?.config?.url?.includes('relay2')) {
      await sendErrorToBackend({
        requestURL: error?.config?.url,
        requestBody: error?.config?.data,
        response: error?.response?.data,
      });
    }
    throw error;
  }
);

export const AXIOS = async (
  config: AxiosRequestConfig,
  type: 'origins' | 'pricefeed' = 'origins'
) => {
  let getRes;
  if (type === 'origins') getRes = await axiosInstance(config);
  else getRes = await axiosPricefeedInstance(config);
  return getRes.data;
};

export const api = { AXIOS };
