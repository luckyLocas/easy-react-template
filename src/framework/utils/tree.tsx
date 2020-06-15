/**
 * 树形结构封装
 */
import React from 'react';
import orgIcon from '@/static/image/orgIcon.svg';
import openOrgIcon from '@/static/image/openOrgIcon.svg';
import monitorIcon from '@/static/image/monitorIcon.svg';
import groupIcon from '@/static/image/group.svg';
import customer from '@/static/image/customer.svg';
import factory from '@/static/image/factory.svg';
import site from '@/static/image/site.svg';
import styles from '@/framework/skin/tree.module.less'

export interface INodeItem {
    id: string,
    key: string,
    name?: string,
    pId: string,
    title: string,
    type: string,
    value?: number,
    [key: string]: any
}

/**
 * 组装树形结构
 * treeData:接口数据
 * refactoring:(分组下拉选树)需要特殊处理
 */
export const getTreeRoot = (newData: Array<INodeItem>, refactoring?: boolean) => {
    // 获取根节点
    let parentIds = [];
    const pIdArr: any = [];
    const ids: any = [];

    newData.map((item: INodeItem) => {
        ids.push(item.id);
        if (refactoring) {
            pIdArr.push(item.pId);
        }
        return item;
    });
    const treeData = copyObject(newData);
    for (let i = treeData.length - 1; i >= 0; i -= 1) {
        const item = treeData[i];
        if (ids.indexOf(item.pId) == -1) {
            parentIds.push(item.pId);
        }

        // 分组下拉选树禁止勾选组织,并删除为子节点的组织
        if (refactoring && item.type === 'organization') {
            item.disableCheckbox = true;
            item.checkable = false;
            if (pIdArr.indexOf(item.id) === -1) {
                treeData.splice(i, 1);
            }
        }
    }

    // 循环递归子节点
    return getTree(treeData, parentIds);
}

/**
 * 循环递归子节点
 * @param treeData
 * @param parentIds 
 */
function getTree(treeData: Array<INodeItem>, parentIds: string[]) {
    const resultObj: any = {};
    for (let i = 0; i < treeData.length; i++) {
        const item = treeData[i];
        item.icon = getIcon;
        if (resultObj[item.pId]) {
            if (item.type === 'organization') {// 企业节点放到后面
                resultObj[item.pId].push(item);
            } else {
                resultObj[item.pId].unshift(item);
            }
        } else {
            resultObj[item.pId] = [item];
        }
    }

    for (let i = 0; i < treeData.length; i += 1) {
        const item: any = treeData[i];
        if (item && resultObj[item.id]) {
            item.children = resultObj[item.id];
        }
    }

    let treeArr: any[] = [];
    for (let i = 0; i < parentIds.length; i++) {
        const id = parentIds[i];
        treeArr = treeArr.concat(resultObj[id]);
    }

    // const treeArr = resultObj[parentId] ? resultObj[parentId] : [];
    return treeArr;
}

/**
 * 组织树图标
 * nodeProps：node节点数据
 */
export const getIcon = (nodeProps: any) => {
    const { expanded, data: { type, children } } = nodeProps;
    // const treeIcon = {
    //     width: 14,
    //     height: 14,
    //     verticalAlign: 'middle'
    // }
    // const orgTreeIcon = {
    //     width: 16,
    //     height: 16,
    //     verticalAlign: 'middle'
    // }
    switch (type) {
        case "organization"://组织
            if (expanded && children) {
                return <img src={openOrgIcon} className={styles['org-icon']} />;
            }
            return <img src={orgIcon} className={styles['tree-icon']} />;
        case 'group'://分组
            return <img src={groupIcon} className={styles['tree-icon']} />;
        case 'monitor'://监控对象
            return <img src={monitorIcon} className={styles['tree-icon']} />;
        case 'user'://用户
            return <img src={customer} className={styles['user-icon']} />;
        case 'customer'://客户
            return <img src={customer} className={styles['user-icon']} />;
        case 'factory'://厂区
            return <img src={factory} className={styles['factory-icon']} />;
        case 'constructionSite'://工地
            return <img src={site} className={styles['user-icon']} />;
        default:
            break;
    }
}

/*
* 深拷贝
*/

function copyObject(object: any): any {
    const copy = Object.create(Object.getPrototypeOf(object));
    copyOwnPropertiesFrom(copy, object);
    return copy;
}

function copyOwnPropertiesFrom(target: any, source: any): any {
    Object
        .getOwnPropertyNames(source)
        .forEach(function (propKey) {
            let desc: any = Object.getOwnPropertyDescriptor(source, propKey);
            Object.defineProperty(target, propKey, desc);
        });
    return target;
}