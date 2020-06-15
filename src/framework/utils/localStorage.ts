/**
 * token 登录验证标识
 * expiration token过期时间
 * username 用户名
 * authorMenuList 用户全选菜单列表
 * hostUrl 平台host地址
 */

let dispacth: any = null;

/**
 * 存储localStorage
 */
export const setStore = (name: string, content: any) => {
  let thisContent = content;
  if (!name) return;
  if (typeof thisContent !== 'string') {
    thisContent = JSON.stringify(thisContent);
  }
  window.sessionStorage.setItem(name, thisContent);
};

/**
 * 获取localStorage
 */
export const getStore = (name: string) => {
  if (!name) {
    return false;
  }
  return window.sessionStorage.getItem(name);
};

/**
 * 删除localStorage
 */
export const removeStore = (name: string) => {
  if (!name) return;
  window.sessionStorage.removeItem(name);
};

