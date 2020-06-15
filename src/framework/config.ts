/**
 * 通过webpack定义的一个全局变量，开发时true，生产时false
 */
declare const PROCESS_DEV_ENV: boolean

export default {
    remote: {
        socketUrl: PROCESS_DEV_ENV ? 'http://192.168.24.146:8763' : ''
    },
    /**
     * 高德地图Key
     */
    amapKey: '6b953aec395d345fd37e1b5434d587a9',
    loginParam: {
        path: '/api/auth/oauth/token',
        param: {
            client_id: 'test',
            client_secret: 'test',
            username: 'admin',
            password: '123456',
            grant_type: 'password',
            scope: 'write'
        }
    },
    routes: [
        { path: '/login', code: 'login', component: 'login/index', name: '登录' },
        {
            path: '/view/:param2?/:param3?/:param4?', code: 'view', component: 'container/index', name: '云平台', children: [
                {
                    path: '/view/home', code: '2_home', component: 'home/index', name: '首页',
                    children: [
                        {
                            path: '/view/home/workbench', code: '3_workbench', component: 'home/workbench/index', name: '工作台',
                            children: [
                                { path: '/view/home/workbench/alarmList', code: '4_alarm_list', component: 'home/workbench/tabAlarm/index', name: '报警' },
                                { path: '/view/home/workbench/remindList', code: '4_remind_list', component: 'home/workbench/tabRemind/index', name: '提醒' }
                            ]
                        },
                        { path: '/view/home/personal', code: "3_personal_center", component: 'home/personal/index', name: '个人中心' },
                    ]
                },
            ]
        },
        { path: '/401', code: '401', component: 'error/page401', name: '404' },
        { path: '/404', code: '404', component: 'error/page404', name: '404' },
    ]
}
