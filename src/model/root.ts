import { Model } from "../framework/d.ts/model"
import { getStore } from "../framework/utils/localStorage";
import { IUserDetails } from "@/views/home/type";

export type StateType = {
    currentLocale: string;
    logined: boolean,
    loadingState: boolean,
    collapsed: boolean,
    activePathCode: string,
    userMessage: IUserDetails
}


const Root: Model<StateType> = {
    namespace: 'root',
    defaultState: {
        currentLocale: 'zh',
        logined: false,
        loadingState: false,
        collapsed: false,
        activePathCode: '',
        userMessage: {}
    },
    reducers: {
        start: function (state: StateType, action) {
            return state;
        },
        default: (state: StateType, action) => {
            const token = getStore('token');
            if (token) {
                return Object.assign({}, state, { logined: true });
            }
            return state;
        },
        // 更新用户信息
        refreshData: (state: StateType, action) => {
            return Object.assign({}, state, { userMessage: action.payload });
        }
    },
    sagas: {
        *getDataEvery(payload: any) {
            return 'world'
        },
    }
}


export default Root;