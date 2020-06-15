import Ajax from "../framework/utils/ajax";

/**
 * 获取用户权限列表
 * @param data 传null
 */
export const getPermission = <T>(data: any) => Ajax.safeGet<T>('/api/user/permission/menu', data)

/**
 * 退出登录
 * @param data 传null
 */
export const logout = <T>() => Ajax.safePost<T>('/api/user/quit', null)