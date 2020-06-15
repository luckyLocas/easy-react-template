import React, { Component } from 'react';
import { Loading } from '@/common';
import LoadFailed from "./loadFailed";
interface IProps {
    code: string
}

interface IState {
    loading: boolean
    Component: React.ComponentClass | undefined
}

export default class Load extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            loading: true,
            Component: undefined
        }
    }

    async componentDidMount() {
        const { code } = this.props;
        let getComponent: any;
        try {
            switch (code) {
                case '2_home':
                    getComponent = await import(/* webpackChunkName: "home" */"@/views/home/index");
                    break;
                default:
                    getComponent = await import(/* webpackChunkName: "page404" */"@/views/error/page404");
                    break;
            }
            const { default: component } = getComponent;
            this.setState({
                loading: false,
                Component: component
            })
        } catch (error) {
            this.setState({
                loading: false,
                Component: LoadFailed
            })
        }
    }

    render() {
        const { loading, Component } = this.state;
        if (loading) {
            return <Loading type="block" size="large" />
        } else if (Component !== undefined) {
            return <Component />
        }
        return null;
    }
}
