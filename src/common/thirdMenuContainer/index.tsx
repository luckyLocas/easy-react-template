import React, { ReactNode, CSSProperties } from "react";
import {
    useParams, useHistory
} from "react-router-dom";
import Tabs from "antd/es/tabs";
import styles from "./index.module.less";
import Fullscreen from "./fullscreen";
import { setStore } from "@/framework/utils/localStorage";

export interface IThirdMenuContainerProps {
    children: ReactNode | ReactNode[]
    containerStyle?: CSSProperties
    style?: CSSProperties
    tabBarStyle?: CSSProperties,
    contentFullHeight?: boolean
}

interface IParam {
    param2: string
    param3: string
}

/**
 * 三级菜单容器
 * @param props 需要渲染的子Tab
 */
export default function ThirdMenuContainer(props: IThirdMenuContainerProps) {

    const history = useHistory();
    const params = useParams<IParam>();

    const { children, style, tabBarStyle, contentFullHeight, containerStyle } = props;
    const param = params.param3;
    let className = styles['third-menu-container'];
    if (contentFullHeight) {
        className += ' ' + styles['full-height'];
    }
    setStore(`/view/${params.param2}`, `/view/${params.param2}/${params.param3}`)
    return (
        <div className={styles['container']} style={containerStyle}>
            <Tabs
                className={className}
                style={style}
                activeKey={param}
                tabBarStyle={tabBarStyle}
                onChange={(key: string) => {
                    history.push(`/view/${params.param2}/${key}`);
                }}
            >
                {children}
            </Tabs>
            <Fullscreen />
        </div>
    )
}


