import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Input } from 'antd';
import CryptoJS from "crypto-js";
import { UnlockOutlined, UserOutlined } from '@ant-design/icons';
import History from "History";
import styles from './index.module.less';
import Config from "../../framework/config";
import Ajax from "../../framework/utils/ajax";
import { getPermission } from "../../server/login";
import { setStore } from "../../framework/utils/localStorage";
import logo from '../../static/image/logo.png'

interface IProps {
    history: History.History
}

class Login extends Component<IProps, any, any>{
    constructor(props: IProps) {
        super(props)
        this.state = {
            success: false, //验证滑块是否通过
            userName: '',
            passWord: '',
            hintFlag: false,
            text: '',
            randomCode: '',
            loading: false,
        }
        this.refSlider = React.createRef();
        this.refText = React.createRef();
        this.refBtn = React.createRef();
        this.sliderBg = React.createRef();
    }
    refSlider: React.RefObject<any>
    refText: React.RefObject<any>
    refBtn: React.RefObject<any>
    sliderBg: React.RefObject<any>

    //按下滑块
    handleMouseDown(Event: any) {
        const slider: any = this.refSlider.current;  //滑块容器
        const btn = this.refBtn.current;  //滑块
        const sliderBg = this.sliderBg.current;
        const distance = slider.clientWidth - btn.clientWidth;  //滑动成功的宽度
        const inite: any = Event || window.Event;
        const downX = inite.clientX;  //获取鼠标按下滑块的位置。
        const _this = this;

        btn.style.transition = "";  //清除后面设置的过渡属性
        sliderBg.style.transition = "";

        document.onmousemove = function (Event) {
            const e = Event || window.Event;
            const moveX = e.clientX;  //获取鼠标移动后的水平位置
            let offsetX = moveX - downX;  //得到鼠标水平位置的偏移量
            if (offsetX > distance) {
                offsetX = distance; // 滑到终点,就停在终点
            } else if (offsetX < 0) {
                offsetX = 0  // 滑到了起点左侧,就重置为起点位置
            }
            btn.style.left = offsetX + 'px';  //动态设置滑块位置
            sliderBg.style.width = offsetX + 'px';

            if (offsetX == distance) { //水平移动距离 = 滑动成功的宽度
                _this.setState({
                    success: true,
                    hintFlag: false,
                    text: ''
                });

                _this.getrandomCode()

                btn.onmousedown = null;
                document.onmousemove = null;
            }
        }
    }

    async getrandomCode() {
        const result = await Ajax.get('/api/code', null);
        console.log(result);
        if (result.data.code == 200) {
            this.setState({
                randomCode: result.data.data
            })
        }
    }

    //松开滑块
    hendleMouseUp() {
        const btn = this.refBtn.current;
        const success = this.state.success;
        const sliderBg = this.sliderBg.current;
        if (!success) {
            btn.setAttribute("style", "left:0;transition:left 0.5s linear;");
            sliderBg.setAttribute("style", "width:0;transition:width 0.5s linear;");
        }
        document.onmousemove = null;
        document.onmouseup = null;
    }

    handleUnmaeVal(e: any) {
        let userName = e.target.value;
        this.setState({
            userName: userName
        })
    };

    handlepswdVal(e: any) {
        let passWord = e.target.value;
        this.setState({
            passWord: passWord
        });
    };


    encrypt(content: string) {
        const keyStr = 'zwlbs#.cloud2020';
        var key = CryptoJS.enc.Utf8.parse(keyStr);
        var encryptResult = CryptoJS.AES.encrypt(content, key, {
            //iv: key,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,

        });
        return encryptResult.toString();

    }

    login = async () => {
        const userName = this.state.userName;
        const passWord = this.state.passWord;
        if (userName == "" || userName == null) {
            this.setState({
                hintFlag: true,
                text: "用户名不能为空"
            });
            return;
        }
        if (passWord == "" || passWord == null) {
            this.setState({
                hintFlag: true,
                text: "密码不能为空"
            });
            return;
        }
        if (!this.state.success) {
            this.setState({
                hintFlag: true,
                text: "滑块说：休想跨过我！"
            });
            return;
        }

        this.setState({
            loading: true
        }, async () => {
            setStore('token', null);

            let urlParam = new URLSearchParams();
            urlParam.set('client_id', Config.loginParam.param.client_id);
            urlParam.set('client_secret', Config.loginParam.param.client_secret);
            urlParam.set('username', this.state.userName);
            urlParam.set('password', this.encrypt(passWord));
            urlParam.set('grant_type', Config.loginParam.param.grant_type);
            urlParam.set('scope', Config.loginParam.param.scope);
            urlParam.set('randomCode', this.state.randomCode);

            const url = Config.loginParam.path;

            const loginResponse = await Ajax.safeLoginPost<{
                access_token: string,
                user_id: string,
                refresh_token: string,
                expires_in: number,
                organization_id: string,
            }>(url, urlParam);

            if (loginResponse && loginResponse.access_token) {
                setStore('token', loginResponse.access_token);
                setStore('user_id', loginResponse.user_id);
                setStore('orgId', loginResponse.organization_id);
                const now = new Date();
                now.setSeconds(now.getSeconds() + loginResponse.expires_in);
                setStore('expires_in', now.getTime());
                setStore('refresh_token', loginResponse.refresh_token);
                const menuResponse = await getPermission<any>(null);
                const { history } = this.props;
                if (menuResponse !== undefined) {
                    setStore('userName', this.state.userName);
                    setStore('authMenuList', menuResponse.menu);
                    setStore('authPermissionList', menuResponse.permission);

                    history.replace('/view/home/workbench/index')
                }
            } else {
                this.setState({
                    loading: false
                })
            }
        })
    }

    render() {
        const { loading } = this.state;
        let hint;
        if (this.state.hintFlag) {
            hint = (
                <div className={styles["hint"]}>
                    <span>{this.state.text}</span>
                </div>
            )
        }

        return (
            <div className={styles['login-bg']}>
                <div className={styles['login-place']}>
                    <div className={styles['logo']}>
                        <img src={logo} />
                    </div>
                    <div className={styles['login-form']}>
                        <div className={styles['login-title']}>
                            <h3>登录平台</h3>
                        </div>
                        {hint}
                        <Input className={styles['login-userName']}
                            style={{ backgroundColor: '#e6f6ff' }}
                            maxLength={25} size="large" placeholder="用户名"
                            prefix={<UserOutlined />}
                            onChange={this.handleUnmaeVal.bind(this)}
                        />
                        <Input.Password className={styles['login-passWord']}
                            maxLength={25} size="large" placeholder="密码"
                            prefix={<UnlockOutlined style={{ fontSize: '22px', color: '#848484' }} />}
                            onChange={this.handlepswdVal.bind(this)}
                        />
                        <div className={styles['login-slider']} ref={this.refSlider}>
                            <div className={styles['slider-labelTip']} ref={this.refText}>
                                {this.state.success ? "您成功啦！请登录！" : "把我滑到右边试试?"}
                            </div>
                            <div className={styles['sliderBg']} ref={this.sliderBg}></div>
                            <div className={this.state.success ? styles['slider-success'] : styles['slider-label']}
                                ref={this.refBtn}
                                onMouseDown={this.handleMouseDown.bind(this)}
                                onMouseUp={this.hendleMouseUp.bind(this)}>
                            </div>
                        </div>
                        <Button loading={loading} className={styles['login-button']} type="primary" onClick={this.login}>登录</Button>
                    </div>
                    <div className={styles['login-footer']}>
                        <p style={{ textAlign: "center", margin: 0 }}>版本：1.0.0</p>
                        <p style={{ textAlign: 'center', marginBottom: 20 }}>©2015-2017 中位（北京）科技有限公司</p>
                        <p>
                            <a href="http://www.miit.gov.cn/" target="_blank" rel="noopener noreferrer">京ICP备15041746号-1</a>
                        </p>
                    </div>
                </div>
            </div >
        );
    }
}

export default connect(null, null)(Login);
