import React from 'react';
import {
  useParams,
} from "react-router-dom";
import Config from "../../framework/config";
import { IRoute } from "../../framework/router";
import styles from "./content.module.less";
import Loading from "../../common/loading";
// import Loadable from "react-loadable";
import Load from './load'

interface IParam {
  param2: string;
  param3: string;
  param4: string;
}

function getRouteByPath(routes: IRoute[], path: string): IRoute | undefined {
  for (let i = 0; i < routes.length; i++) {
    const element = routes[i];
    if (element.path === path) {
      return element;
    } else if (element.children) {
      const childRoute = getRouteByPath(element.children, path);
      if (childRoute) {
        return childRoute;
      }
    }
  }
  return undefined;
}

// function getLoadable(code: string) {
//   switch (code) {
//     case '2_home':
//       return Loadable({
//         loader: () => import(/* webpackChunkName: "home" */"../../views/home/index"),
//         loading: () => <Loading />,
//       });
//     case '2_monitoring_object':
//       return Loadable({
//         loader: () => import(/* webpackChunkName: "monitorManager" */"../../views/monitorManager/index"),
//         loading: () => <Loading />,
//       });
//     case '2_org_and_user':
//       return Loadable({
//         loader: () => import(/* webpackChunkName: "orgAndUser" */"../../views/orgAndUser/index"),
//         loading: () => <Loading />,
//       });
//     case '2_plan_management':
//       return Loadable({
//         loader: () => import(/* webpackChunkName: "planManagement" */"../../views/planManagement/index"),
//         loading: () => <Loading />,
//       });
//     case '2_allocation_management':
//       return Loadable({
//         loader: () => import(/* webpackChunkName: "scheduleManagement" */"../../views/scheduleManagement/index"),
//         loading: () => <Loading />,
//       });
//     case '2_monitoring_management':
//       return Loadable({
//         loader: () => import(/* webpackChunkName: "monitorMgm" */"../../views/monitorMgm/index"),
//         loading: () => <Loading />,
//       });
//     case '2_system':
//       return Loadable({
//         loader: () => import(/* webpackChunkName: "systemManage" */"../../views/systemManage/index"),
//         loading: () => <Loading />,
//       });
//     case '2_log_management':
//       return Loadable({
//         loader: () => import(/* webpackChunkName: "logManagement" */"../../views/logManagement/index"),
//         loading: () => <Loading />,
//       });
//     default:
//       return Loadable({
//         loader: () => import(/* webpackChunkName: "page404" */"../../views/error/page404"),
//         loading: () => <Loading />,
//       });
//   }
// }


const secondMenuList: Array<string> = [];
const componentList: Array<{
  param2: string;
  element: JSX.Element;
}> = [];

export default function Content() {
  const params = useParams<IParam>();
  const path = `/view/${params.param2}`;

  if (!(secondMenuList.indexOf(path) > -1)) {
    const route = getRouteByPath(Config.routes, path);
    if (route) {
      // const Loadable = getLoadable(route.code);
      componentList.push({
        param2: params.param2,
        element: <Load code={route.code} />,
      });
      secondMenuList.push(path);
    }
  }
  // 如果超过了6个，则删除第一个不是首页的页面
  if (secondMenuList.length > 6) {
    for (let i = 0; i < secondMenuList.length; i++) {
      const element = secondMenuList[i];
      if (element !== 'home') {
        secondMenuList.splice(i, 1);
        componentList.splice(i, 1);
        break;
      }
    }
  }
  return (
    <div style={{ height: '100%', width: "100%" }}>
      {
        componentList.map(component => {
          return (
            <div
              key={component.param2}
              className={component.param2 === params.param2 ? styles.normal : styles.hidden}
              style={{ height: '100%' }}
            >
              {component.element}
            </div>
          );
        })
      }
    </div>
  );
}
