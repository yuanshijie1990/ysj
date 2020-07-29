import axios from 'axios';
import qs from 'qs';
import { Message, MessageBox } from 'element-ui';
import store from '@/store';

class Storage {
  get(key) {
    return localStorage.getItem(key);
  }

  set(key, value) {
    if (Object.prototype.toString.call(value) === '[object Object]') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
  }

  remove(key) {
    localStorage.removeItem(key);
  }
}

const storage = new Storage();

function getUserInfoCache() {
  const storageCache = localStorage.getItem('userInfo_admin-base');
  if (!storageCache) {
    return {};
  }
  try {
    return JSON.parse(storageCache);
  } catch (e) {
    storage.set('userInfo_admin-base', {});
    return {};
  }
}

export let userInfoCache = getUserInfoCache();

export function getToken() {
  return getUserInfoCache().accesstoken;
}

export function getUser() {
  return getUserInfoCache().user || {};
}

export function isJSON(val) {
  if (typeof val !== 'string') {
    return false;
  }
  try {
    const obj = JSON.parse(val);
    if (Object.prototype.toString.call(obj) === '[object Object]') {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

export function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

axios.interceptors.request.use(
  config => {
    console.log(123,config)
    const accesstoken = store.getters.token && getToken();
    // 如果token是JSESSIONID,把JSESSIONID 带到url 后面
    if (accesstoken && /^JSESSIONID:/.test(accesstoken)) {
      if (config.params && isObject(config.params)) {
        config.params.JSESSIONID = accesstoken.substring(11);
      } else {
        config.params = { JSESSIONID: accesstoken.substring(11) };
      }
    }
    // if (
    //   request.url &&
    //   request.method === "post" &&
    //   request.data
    // ) {
    //   request.data.userBo = {
    //     deptId: deptId,
    //     deptName: deptName,
    //     pid: pid
    //   };
    //   return request;
    // }
    return config;
  },
  error => error
);

axios.defaults.transformRequest = function(data, headers) {
  
  const accesstoken = store.getters.token && getToken();
  if (accesstoken && !Reflect.has(headers, 'accesstoken')) {
    headers['accesstoken'] = accesstoken.replace(/^JSESSIONID:/, ''); // 让每个请求携带自定义token 请根据实际情况自行修改
  }

  if (!headers.accesstoken) {
    delete headers.accesstoken;
  }
  if (data) {
    let dd = localStorage.getItem('userInfo_admin-base')
    dd = JSON.parse(dd)
    if(dd.deptment){
      data.userBo = {
        deptId: dd.deptment.deptId||null,
        deptName: dd.deptment.deptName||null,
        pid: dd.deptment.pid||null
      };
    }
  }
  if (data instanceof FormData) {
    return data;
  }

  if (
    headers['Content-Type'] === 'application/x-www-form-urlencoded' &&
    data &&
    isObject(data)
  ) {
    return qs.stringify(data);
  }
  return JSON.stringify(data);
};

/* 创建axios实例 */
const service = axios.create({
  baseURL: '/dyhj', // api的base_url
  timeout: 30000 // 请求超时时间
});

service.transformRequest; 

service.defaults.headers.post['Content-Type'] = 'application/json';

/**
 * 重新登录
 * @param {string} msg 提示消息
 */
async function afreshLogin(msg) {
  await MessageBox.confirm(msg, '提示', {
    confirmButtonText: '关闭页面',
    cancelButtonText: '取消',
    type: 'warning'
  });
  // window.eventBus.$emit('LogOut');
}

// respone拦截器
service.interceptors.response.use(
  response => {
    /**
     * code为非20000是抛错 可结合自己业务进行修改
     */
    const accesstoken = response.headers.accesstoken;
    const res = isJSON(response.data)
      ? JSON.parse(response.data)
      : response.data;
    // if (accesstoken && res.data) {
    //   res.data.accesstoken = accesstoken;
    // }

    /**
     * 50008:非法的token
     * 50012:其他客户端登录了
     * 50014:Token 过期了
     * res.code === 50008 || res.code === 50012 || res.code === 50014
     */
    if (res.code === 1200) {
      window.open(window.location.protocol+'//'+window.location.hostname, '_self')
      // const msg =
      //   res.message || '你已被登出，可以取消继续留在该页面，或者重新登录';
      // if (msg === '你还没有登录，请先登录！') {
      //   afreshLogin(msg);
      // } else {
      //   Message.error(msg);
      // }
      return Promise.reject('error');
    }

    if (typeof res === 'object') {
      if (Reflect.has(res, 'success') && !res.success) {
        const msgStr = 'message:';
        const message =
          res.message && res.message.indexOf(msgStr) > -1
            ? res.message.split(msgStr)[1]
            : res.message;
        Message.error(message);
      } else {
        return response;
      }
    } else {
      return response; // 针对返回 res 是二进制数据流
    }
  },
  error => {
    console.log('err' + error); // for debug
    // Message({
    //   type: 'error',
    //   message: error.message,
    //   duration: 5 * 1000
    // });
    return Promise.reject(error);
  }
);

export default service;

export const params = obj => {
  if (obj && typeof obj === "object") {
    const left = Object.keys(obj);
    const right = Object.values(obj);
    let str = "";
    for (let i = 0; i < left.length; i++) {
      if (right[i]) {
        if (!str) {
          str += `?${left[i]}=${right[i]}`;
        } else {
          str += `&${left[i]}=${right[i]}`;
        }
      }
    }
    return str;
  } else {
    return "";
  }
};
