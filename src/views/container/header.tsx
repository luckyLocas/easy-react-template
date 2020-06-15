import React, { Component, CSSProperties } from 'react';
import { connect } from 'react-redux';
import { Menu } from 'antd';
import { Dropdown } from 'antd';
import History from 'history';
import {
    UserOutlined,
    LogoutOutlined,
    AppstoreAddOutlined,
} from '@ant-design/icons';
import logo from "@/static/image/logo1.png";
import languageIcon from '@/static/image/language.svg';
import themeIcon from '@/static/image/theme.svg';

import styles from './index.module.less';
import { AllState } from '../../model';
import { setStore, getStore } from "../../framework/utils/localStorage";
import RouterTabs from "../../common/routerTabs/routerTabs";
import MenuPage from "./menu";
import AlarmTip from './alarmTip';
import { IUserDetails } from '../home/type';
import { logout } from '@/server/login';

interface IProps {
    style?: CSSProperties
    history: History.History
    userData: IUserDetails
    getUserMsg: Function
}

interface IState {
    dateAndTime: { week: string, date: string, time: string, morning: string },
    // userData: {
    //     username: string,
    //     photo: string,
    // },
    timer: any,
    historyRouters: Array<any>
    activePathCode: string
}

interface ItemRouter {
    name: string,
    code: string,
    path: string,
}


class Header extends Component<IProps, IState, any>{
    constructor(props: IProps) {
        super(props);
        const router = getStore('historyRouter');
        const activeTabPath = getStore('activeTabPath');

        this.state = {
            dateAndTime: {
                'week': '',
                'date': '',
                'time': '',
                'morning': ''
            },
            // userData: {
            //     username: '',
            //     photo: '',
            // },
            timer: null,
            historyRouters: router ? JSON.parse(router) : [{
                name: '首页',
                code: 'home',
                path: '/view/home',
                closable: false,
            }],// 用于顶部tabs页签显示
            activePathCode: activeTabPath ? activeTabPath : 'home'// 顶部页签选中项
        }
    }

    componentDidMount() {
        this.props.getUserMsg();
        this.getDateAndTime();
    }

    componentWillUnmount() {
        const { timer } = this.state;
        if (timer) clearTimeout(timer);
    }

    // 获取用户信息
    // getUserInfo = async () => {
    //     const result = await getUserMsg<{ username: string, photo: string }>(null);
    //     if (result) {
    //         this.setState({
    //             userData: { ...result }
    //         })
    //     }
    // }

    /**
     * 获取当前日期及时间
     * 每分钟更新
     */
    getDateAndTime = () => {
        const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

        var myDate = new Date();
        const month = myDate.getMonth() + 1;
        const curDate = myDate.getDate();
        const day = myDate.getDay();
        const mytime = myDate.toLocaleTimeString();
        const morning = mytime.substr(0, 2);
        let hours: any = myDate.getHours();
        hours = hours < 10 ? `0${hours}` : hours;
        let minutes: any = myDate.getMinutes();
        minutes = minutes < 10 ? `0${minutes}` : minutes;
        const seconds = myDate.getSeconds();

        const result = {
            'week': weekday[day],
            'date': `${month}月${curDate}日`,
            'time': `${hours}:${minutes}`,
            'morning': morning
        }

        const { timer } = this.state;
        if (timer) clearTimeout(timer);
        const newTimer = setTimeout(this.getDateAndTime, 60000 - seconds * 1000);
        this.setState({
            dateAndTime: result,
            timer: newTimer
        })
    }

    /**
     * 修改历史路由与当前选中的tab项
    */
    changeRouterAndPath = (path: string, newRouter: Array<ItemRouter> = this.state.historyRouters) => {
        this.setState({
            activePathCode: path,
            historyRouters: newRouter,
        })
        if (path !== 'home') {
            if (newRouter.length > 2) {
                const result = [newRouter[0]];
                for (let i = 0; i < newRouter.length; i += 1) {
                    if (newRouter[i].code === path) {
                        result.push(newRouter[i]);
                        break;
                    }
                }
                setStore('historyRouter', result);
            } else {
                setStore('historyRouter', JSON.stringify(newRouter));
            }
        } else {
            setStore('historyRouter', JSON.stringify([newRouter[0]]));
        }
        setStore('activeTabPath', path);
    }

    /**
     * 跳转个人中心页面
     */
    goPersonCenter = () => {
        const { history } = this.props;
        this.setState({
            activePathCode: 'home'
        })
        history.push('/view/home/personal');
    }

    /**
    * 退出登录
    */
    loginExit = async () => {
        await logout();
        window.sessionStorage.clear();
        window.location.href = '/login';
    }

    render() {
        const { history, style } = this.props;
        const { dateAndTime, historyRouters, activePathCode } = this.state;
        const { userData: { username, photo } } = this.props;

        return (
            <div id="header" className={styles['header-container']} style={style}>
                <div className={styles['header-wrapper']}>
                    <div className={styles['header-left']}>
                        <div className={styles['header-logo']}>
                            <img alt="logo图片" src={logo} />
                            <h2>F3商砼云平台</h2>
                        </div>
                    </div>
                    <div className={styles['header-tabs']}>
                        <RouterTabs
                            changeRouter={this.changeRouterAndPath}
                            historyRouters={historyRouters}
                            activePathCode={activePathCode}
                            history={history}
                        />
                    </div>
                    <div className={styles['header-right']}>
                        <div className={styles['icons-list']}>
                            <AlarmTip history={history} />
                            <Dropdown overlay={
                                <Menu>
                                    <Menu.Item>
                                        <a href="#">
                                            CN 简体中文
                                        </a>
                                    </Menu.Item>
                                </Menu>
                            }>
                                <a className="ant-dropdown-link">
                                    <img alt="多语言" title="多语言" src={languageIcon} className={styles['item-icon']} />
                                </a>
                            </Dropdown>
                            <img alt="主题" title="主题颜色" src={themeIcon} className={styles['item-icon']} />
                            {/* <Badge count={88} overflowCount={99}>
                                <BellOutlined title="消息" className={styles['item-icon']} />
                            </Badge> */}
                        </div>
                        <Dropdown overlay={
                            <Menu>
                                <Menu.Item>
                                    <a href="#" onClick={this.goPersonCenter}>
                                        <UserOutlined /> 个人中心
                                     </a>
                                </Menu.Item>
                                <Menu.Item>
                                    <a href="#" onClick={this.loginExit}>
                                        <LogoutOutlined /> 退出登录
                                    </a>
                                </Menu.Item>
                            </Menu>
                        }
                            className={styles.user}
                        >
                            <a className="ant-dropdown-link">
                                {photo ? <img alt="" src={photo} /> : <UserOutlined style={{ fontSize: '22px' }} />}
                                <span>{username}</span>
                            </a>
                        </Dropdown>
                        <div className={styles.date}>
                            <div>{dateAndTime.week}</div>
                            <div>{dateAndTime.date}</div>
                        </div>
                        <div className={styles.time}>
                            <div>{dateAndTime.morning}</div>
                            <div className={styles.currentTime}>{dateAndTime.time}</div>
                        </div>
                    </div>
                </div>
                {/* 导航菜单部分 */}
                <div className={styles['menu-container']}>
                    <div id="triggerWrapper" className={styles['trigger-wrapper']}>
                        {/* <MenuUnfoldOutlined className={styles.trigger} /> */}
                        <AppstoreAddOutlined className={styles.trigger} />
                    </div>
                    <div id="menuWrapper" className={styles['menu-dropdown']}>
                        <MenuPage changeRouter={this.changeRouterAndPath} historyRouters={historyRouters} history={history} />
                    </div>
                </div>
            </div>
        );
    }
}
export default connect(
    (state: AllState) => ({
        collapsed: state.root.collapsed,
        userData: state.root.userMessage,//用户信息
    }),
    dispatch => ({
        loginExit: () => {
            dispatch({ type: 'root/LOGIN_EXIT' });
        },
        getUserMsg: (payload: any) => {
            dispatch({ type: 'root/getUserMsgEvery', payload });
        },
    }),
)(Header);
