import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef, ReactElement } from 'react';
import { Button, Form, Input, Table } from 'antd';
import { SearchOutlined, ReloadOutlined, LeftOutlined } from '@ant-design/icons';
import Setting from './setting'
import FilterDom, { filterItemProps } from './filter'
import styles from './index.module.less'
import { TableProps, ColumnProps } from 'antd/lib/table';


export interface QueryDomProps {
    name: string,
    label: string,
    dom: any,
    handleValue?: (value: any, data: any) => any
}

export interface MyTableProps<T> extends TableProps<T> {
    columns: MyColumns<T>[],
    queryAjax?: any, // 查询请求
    queryDom?: QueryDomProps[],
    queryArgs?: Object,
    queryBtnDoms?: any,
    hideQueryBtn?: boolean, // 是否隐藏头部查询按钮
    initialValues?: any, // 头部查询默认参数
    tableBodyClassName?: string, // table的class
    btnGroup?: any[], // 左侧 新增 批量删除按钮组
    showSetting?: boolean, // 是否展示设置行
    showSettingRight?: boolean, // 是否展示设置行右侧
    showSettingLeft?: boolean,// 是否展示设置行左侧
    showSettingQuery?: boolean, //是否暂时右侧查询输入框
    settingQuery?: settingQueryProps | null, // 设置行输入框配置
    settingQueryStyle?: { // 设置行输入框 style
        width: number | string
    },
    showRow?: boolean, // 是否展示勾选框
    showTree?: boolean, // 是否展示树
    rowChange?: Function, // 勾选函数
    rowSelections?: any, // rowSelection的拓展
    rowType?: string, // 单选 多选类型
    showPages?: boolean, // 是否展示分页
    ref?: any, 
    tree?: ReactElement, // 左侧树
    queryCallback?: (data: any, record: any) => void, // 查询成功回调函数
    pageCallback?: (data: any) => void, // 分页回调函数
    rowClick?: (record: any, e: any) => void, // 行点击事件回调函数
    refresh?: () => void, // 刷新回调函数
    queryChange?: (obj: any) => void, // 右侧输入框查询回调函数
}

export interface MyColumns<T> extends ColumnProps<T> {
    filter?: filterItemProps,
}

interface settingQueryProps {
    placeholder: string,
    key: string,
    maxLength?: number
}

interface queryParams {
    size: number,
    page: number,
    [propName: string]: any
}

interface sorterArgsParams {
    orderType?: string,
    orderField?: string
}


/**
 * table
 * @param props 
 * @param parentRef 
 */
function ConcreteTable<T extends Object = any>(props: MyTableProps<T>, parentRef: any): ReactElement {

    const { dataSource, className, tableBodyClassName, rowSelections, rowType, columns, initialValues, ...extra } = props

    const [tableData, setTableData] = useState<any[]>([]) // sourceData

    const [tableColumns, setTableColumns] = useState<MyColumns<any>[]>([]) // default columns
    const [settingColumnList, setSettingColumnList] = useState<Array<any>>([])

    const [pagination, setPagination] = useState<any>({ // 分页参数
        current: 1,
        pageSize: 10,
        total: 10,
        showSizeChanger: true,
        showTotal: (total: number, range: any) => `共${total}条`,
        size: 'default'
    })

    const [showSetting, setShowSetting] = useState<boolean>(true) // 设置行显示状态
    const [showSettingRight, setShowSettingRight] = useState<boolean>(true) // 设置行右侧显示状态
    const [showSettingLeft, setShowSettingLeft] = useState<boolean>(true) // 设置行显示左侧显示状态
    const [showSettingQuery, setShowSettingQuery] = useState<boolean>(true) // 设置行右侧查询显示状态
    const [loading, setLoading] = useState<boolean>(false) // 加载动画状态
    const [showTree, setShowTree] = useState<boolean>(true) // 左侧树展示状态
    const [hideQueryBtn, setHideQueryBtn] = useState<boolean>(false) // 

    const [treeShowOrHide, setTreeShowOrHide] = useState<boolean>(true) // 左侧树显示隐藏状态，用来控制动画

    const [queryBtnDoms, setQueryBtnDoms] = useState<any[]>([]) // 头部查询dom数组

    const [filterdInfo, setFilterdInfo] = useState<any>(null) // 过滤参数

    const [filterdInfoData, setFilterdInfoData] = useState<any>(null) // 过滤参数
    const [sortedInfo, setSortedInfo] = useState<any>(null) // 排序参数
    const [filterAndSortArgs, setFilterAndSortArgs] = useState<any>(null) // 排序参数

    const [pageArgs, setPageArgs] = useState<any>({}) // 分页请求参数
    const [defaultQueryArgs, setDefaultQueryArgs] = useState<any>({}) // 保存默认queryArgs 参数
    const [queryArgs, setQueryArgs] = useState<any>(null) // 保存默认queryArgs 参数

    const [tableQueryArgs, setTableQueryArgs] = useState<any>({}) // 保存筛选条件

    const [rowSetting, setRowSetting] = useState<any>({
        fixed: true,
        type: 'checkbox',
        onChange: rowChange
    }) // 

    const [scroll, setScroll] = useState<any>(() => ({
        x: 'max-content',
        y: '500px',
        scrollToFirstRowOnChange: true
    }))

    const [queryValue, setQueryValue] = useState<string>('') // 右侧input值

    const [form] = props.queryDom && props.queryDom.length ? Form.useForm() : [undefined]

    const tableClassName: any = typeof className === 'string' ? [className] : className || []

    const _tableBodyClassName: any = typeof tableBodyClassName === 'string' ? [tableBodyClassName] : tableBodyClassName || []

    const _table: any = useRef()

    useImperativeHandle(parentRef, () => {
        return {
            reload: reload,
            reloadPageOne: reloadPageOne,
            queryForm: form,
            updateDataOne: updateDataOne,
            getQueryArgs: tableQueryArgs
        }
    })

    useEffect(() => { // 初始化加载数据
        //保存默认queryArgs用来刷新用 tableRandom 用来强制刷新
        setDefaultQueryArgs(props.queryArgs ? { ...props.queryArgs, tableRandom: new Date().getTime() } : { tableRandom: new Date().getTime() })
        setSettingColumnList(columns.filter((a: MyColumns<T>) => !!a.dataIndex).map((b: MyColumns<T>) => b.dataIndex))
        setTableColumns(columns)

        if ('showPages' in props && !props.showPages) {
            setPagination(false)
        }

        if (
            ('showSetting' in props && !props.showSetting) ||
            ('showSettingRight' in props && !props.showSettingRight && 'showSettingLeft' in props && !props.showSettingLeft)) {
            setShowSetting(false)
        }

        if ('showSettingRight' in props && !props.showSettingRight) {
            setShowSettingRight(false)
        }

        if ('showSettingLeft' in props && !props.showSettingLeft) {
            setShowSettingLeft(false)
        }

        if ('showSettingQuery' in props && !props.showSettingQuery) {
            setShowSettingQuery(false)
        }

        if ('showTree' in props && !props.showTree) {
            setShowTree(false)
        }

        if ('hideQueryBtn' in props && props.hideQueryBtn) {
            setHideQueryBtn(true)
        }

        if ('showRow' in props && (typeof props.showRow === 'boolean' && !props.showRow)) {

            setRowSetting(false)
        }

        return () => {

            window.onresize = null
        }
    }, [])

    useEffect(() => { // 设置头部form参数
        if (form) {
            form.setFieldsValue(initialValues)
        }
    }, [initialValues])

    useEffect(() => { // 设置头部form参数
        setQueryBtnDoms(props.queryBtnDoms)
    }, [props.queryBtnDoms])

    useEffect(() => { // 默认参数发生变化时 进行查询；例如：选择左侧树
        setQueryArgs({
            // ...queryArgs,
            ...props.queryArgs
        })
    }, [props.queryArgs])

    useEffect(() => { // 默认参数发生变化时 进行查询；例如：选择左侧树
        if (queryArgs) {
            queryTablePageOne({
                ...queryArgs,
                ...filterAndSortArgs
            })
        }
    }, [queryArgs, filterAndSortArgs])

    useEffect(() => { // 分页发生变化时
        if (pageArgs && JSON.stringify(pageArgs) !== '{}') {
            queryTable({
                ...tableQueryArgs,
                ...pageArgs
            })

            if (props.pageCallback) {
                props.pageCallback(pageArgs)
            }
        }
    }, [pageArgs])

    useEffect(() => { // 数据源改变时
        if (dataSource) {
            setLoading(false)
        }
        setTableData(dataSource?.map((item: any, index: number) => {
            return {
                key: item.id || index,
                ...item
            }
        }) || [])
    }, [dataSource])

    useEffect(() => { // 设置滚动参数
        setScroll({
            ...scroll,
            ...props.scroll
        })
    }, [props.scroll])

    useEffect(() => {
        if (rowType || rowSelections) {
            setRowSetting({
                ...rowSetting,
                ...rowSelections,
                type: rowType || 'checkbox',
            })
        }
    }, [rowType, rowSelections])

    function queryTablePageOne(data: any = {}) {// 查询第一页
        const pageData = pagination ? { page: 1, size: pagination.pageSize, } : {}

        queryTable({
            ...pageData,
            ...data,
        })
    }

    async function queryTable(data: queryParams) { // 查询请求
        const formArgs = await handleFormValues()
        const args = {
            orderType: 'DESC',
            orderField: 'createDataTime',
            ...queryArgs,
            ...data,
            ...formArgs,
        }
        setTableQueryArgs(args) // 保存请求参数

        if (props.queryAjax) {
            setLoading(true)
            const result: any = await props.queryAjax(args)

            setLoading(false)
            if (result) {
                const datas: any[] = result.data
                const total = Number(result.total)
                setTableData(datas)

                if (pagination) { // showPage 为false时 不需要重置分页数据
                    // 重新计算当前分页，用于删除操作
                    let newPage = data ? data.page : 1
                    console.log(data);
                    if (newPage > 1) {
                        const oldTotal = total <= ((data.page - 1) * data.size)
                        newPage = oldTotal ? data.page - 1 : data.page
                    }


                    setPagination({
                        ...pagination,
                        pageSize: data ? data.size : 10,
                        current: newPage,
                        total: total
                    })
                }

                if (props.queryCallback) { // 请求回调函数
                    props.queryCallback(datas, result)
                }
            } else {
                if (props.queryCallback) { // 请求回调函数
                    props.queryCallback([], result)
                }
            }
        }
    }

    async function handleFormValues() { // 处理头部表单值
        let _values: any = props.queryDom ? form?.getFieldsValue() : {}
        if (props.queryDom) {
            props.queryDom.forEach((item: QueryDomProps) => {
                if (item.handleValue) {
                    const _value: any = _values[item.name] ? item.handleValue(_values[item.name], _values) : {}
                    console.log(_value);
                    _values = {
                        ..._values,
                        ..._value
                    }
                }
            })
        }
        return _values
    }

    function handleFormItem(data: QueryDomProps[]) { // 处理formItem
        return data.map((item) => {
            return <Form.Item key={item.name} label={item.label} name={item.name}>
                {item.dom}
            </Form.Item>
        })
    }

    function queryFinish(data: any) {// 顶部查询的form回调
        refresh()
        // queryTablePageOne()
    }

    function settingQueryHandle(value: string) { // 右侧设置中的查询input框
        const obj: any = {}
        obj[props.settingQuery!.key] = value

        if (props.queryChange) {
            props.queryChange(obj)
        }
        setQueryArgs({
            ...queryArgs,
            ...obj
        })
    }

    function updateDataOne(data: any, key: string = 'id') { // 更新单个数据
        const index = tableData.findIndex((item: any) => item[key] === data[key])
        if (index > -1) {
            tableData[index] = data
            setTableData(tableData)
        }
    }

    function reload() { // 重置刷新
        if (form) {
            form.setFieldsValue(initialValues)
        }
        queryTablePageOne(tableQueryArgs)
    }

    function reloadPageOne() { // 重置刷新
        if (form) {
            form.setFieldsValue(initialValues)
        }
        queryTablePageOne({
            ...tableQueryArgs,
            page: 1
        })
    }

    function rowChange(keys: string[], rows: any[]) { //多选
        if (props.rowChange) {
            props.rowChange(keys, rows)
        }
    }

    function refresh() { // 右侧刷新

        setQueryValue('') // 设置右侧输入框

        if (props.refresh) {
            props.refresh()
        }

        setQueryArgs({
            ...defaultQueryArgs,
            tableRandom: new Date().getTime()
        })
        setFilterAndSortArgs({})
        // 清除筛选 过滤状态
        setFilterdInfo(null)
        setSortedInfo(null)
    }

    function tableChange(page: any, filters: any, sorter: any, extra: any) { // 分页、筛选、排序 变化时触发

        if (props.onChange) {
            props.onChange(page, filters, sorter, extra)
        }

        if (JSON.stringify(page) !== '{}' && (pagination.pageSize !== page.pageSize || pagination.current !== page.current)) {
            const pageData = {
                size: page.pageSize,
                page: page.current
            }
            setPageArgs(pageData)
            return
            // return queryTable(pageData)
        }

        let filterArgs: any = {}

        for (let a in filters) { // 对比新旧筛选值
            if (filters[a]) {
                if (filterdInfoData && a in filterdInfoData) {
                    if (JSON.stringify(filters[a][0]) === JSON.stringify(filterdInfoData[a])) {
                        filterArgs = filterdInfoData
                    } else {
                        filterArgs = {}
                        filterArgs[a] = filters[a][0]
                        break;
                    }
                } else {
                    filterArgs = {}
                    filterArgs[a] = filters[a][0]
                    break;
                }
            }
        }
        // 根据key 从columns 里面获取对应的filterKey
        for (const key in filterArgs) {
            const item: any = columns.find((a: any) => a.dataIndex === key)
            if (item) {
                filterArgs = {
                    [item.filter.key || key]: filterArgs[key]
                }
            }
        }
       

        let sorterArgs: sorterArgsParams = {}

        if (JSON.stringify(sorter) !== '{}') {
            const column = sorter.column
            if (sorter.order === 'descend' || sorter.order === 'ascend') {
                sorterArgs.orderType = sorter.order === 'descend' ? 'DESC' : 'ASC'
                sorterArgs.orderField = column.sorterKey
            } else {
                sorterArgs = {}
            }

        }

        // 保存筛选、过滤值，用来控制筛选点中状态
        setFilterdInfoData(filterArgs)
        setSortedInfo(sorter)

        setFilterAndSortArgs({
            ...sorterArgs,
            ...filterArgs
        })
        // setQueryArgs({
        //     ...queryArgs,
        // })
    }

    function handleColumnsFilter(columns: MyColumns<any>[]): MyColumns<any>[] {// 处理columns过滤
        const arr = columns.map((item: any) => {
            item.key = item.dataIndex
            const { sorterKey, filter, ...extra } = item

            // 处理排序
            const sorter = sorterKey ? {
                sorterKey: sorterKey,
                sortOrder: sortedInfo ? sortedInfo.columnKey === item.dataIndex && sortedInfo.order : false,
                sorter: true
            } : {}

            // 处理过滤条件
            const _filter = filter ?
                {
                    filteredValue: filterdInfo ? filterdInfo[item.dataIndex] : null,
                    filterDropdown: (filterProps: any) =>
                        <FilterDom
                            dataIndex={item.dataIndex}

                            filter={{
                                ...filter,
                                domData: typeof filter.domData === 'function' ? filter.domData() : filter.domData
                            }}
                            onConfirm={(selectedKeys: any): void => {
                                setFilterdInfo({
                                    [item.dataIndex]: selectedKeys
                                })
                            }}
                            onReset={() => {
                                setFilterdInfo(null)
                            }}
                            {...filterProps}
                        />
                }
                : {}

            if (!extra.render) { // 返回数据为false时 统一处理为'--'
                extra.render = (value: any) => {
                    return value !== '' && value !== null && value !== undefined ? value : '--'
                }
            }

            return {
                ellipsis: true,
                ...sorter,
                ..._filter,
                ...extra
            }
        })
        return arr
    }

    function handleColumns(): MyColumns<any>[] {
        // 合并 columns
        const arr: any = []

        if (tableColumns[0] && !tableColumns[0].dataIndex) {
            arr.push(tableColumns[0])
        }
        // 从设置中获取勾选的column
        settingColumnList.forEach((b: string) => {
            const obj = tableColumns.find((item: any) => item.dataIndex === b)
            if (obj) {
                arr.push(obj)
            }
        })

        return handleColumnsFilter(arr)
    }

    return (
        <div className={[styles['concrete-table'], ..._tableBodyClassName, 'concrete-table-style'].join(' ')}>
            {/* 头部查询组件 */}
            {
                props.queryDom && props.queryDom.length ?
                    <div className={styles['concrete-table-queyr']} style={{ backgroundColor: '#fff' }}>
                        <Form layout="inline" form={form} onFinish={queryFinish}>
                            {handleFormItem(props.queryDom)}
                            {
                                queryBtnDoms && queryBtnDoms.length ?
                                    queryBtnDoms.map((item: any[], index: number) => {
                                        return <Form.Item key={index}>
                                            {item}
                                        </Form.Item>
                                    })
                                    : null
                            }
                            {
                                !hideQueryBtn ?
                                    <Form.Item>
                                        <Button icon={<SearchOutlined />} htmlType="submit" type='primary'>查询</Button>
                                    </Form.Item>
                                    : null
                            }
                        </Form>
                    </div>
                    : null
            }
            <div className={styles['concrete-table-body']} style={{ backgroundColor: '#fff' }}>
                {/* 左侧树组件 */}
                {
                    showTree ?
                        <div className={[styles['concrete-table-tree'], treeShowOrHide ? styles['tree-show'] : styles['tree-hide']].join(' ')}>
                            {
                                props.tree ? props.tree : null
                            }
                            <LeftOutlined
                                className={styles['tree-btn']}
                                onClick={() => { setTreeShowOrHide(!treeShowOrHide) }}
                            />

                        </div>
                        : null
                }
                <div className={styles['concrete-table-body-right']}>
                    {/* 设置行 */}
                    {
                        showSetting ?
                            <div className={styles['concrete-table-setting']}>
                                {
                                    showSettingLeft ?
                                        <div className={styles['concrete-table-setting-btns']}>
                                            {props.btnGroup}
                                        </div>
                                        : null
                                }
                                {
                                    showSettingRight ?
                                        <div className={styles['concrete-table-setting-right']}>
                                            {
                                                showSettingQuery ?
                                                    <span className={styles['concrete-table-setting-right-input']}>
                                                        <Input.Search
                                                            style={{
                                                                width: 200,
                                                                ...props.settingQueryStyle
                                                            }}
                                                            maxLength={props.settingQuery?.maxLength || 30}
                                                            onSearch={settingQueryHandle}
                                                            placeholder={props.settingQuery?.placeholder}
                                                            value={queryValue}
                                                            onChange={(e) => { setQueryValue(e.target.value) }}
                                                            allowClear
                                                        />
                                                    </span>
                                                    : null
                                            }
                                            <ReloadOutlined onClick={refresh} />
                                            <Setting columns={props.columns} onChange={setSettingColumnList} />

                                        </div>
                                        : null
                                }
                            </div>
                            : null
                    }
                    <Table
                        className={[styles['concrete-table-content'], ...tableClassName].join(' ')}
                        dataSource={tableData}
                        columns={handleColumns()}
                        pagination={pagination}
                        loading={loading}
                        onChange={tableChange}
                        rowSelection={rowSetting}
                        ref={_table}
                        size='middle'
                        rowKey={props.rowKey || 'id'}

                        onRow={

                            record => ({
                                onClick: e => {
                                    e.stopPropagation()
                                    return props.rowClick ? props.rowClick(record, e) : null
                                }
                            })
                        }
                        showSorterTooltip={false}
                        scroll={scroll}
                        {...extra}
                    />

                </div>

            </div>

        </div>
    )
}

export default forwardRef(ConcreteTable)
