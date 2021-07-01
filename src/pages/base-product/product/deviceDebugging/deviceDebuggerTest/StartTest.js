import React, { Component } from 'react';
import DebuggingInfoDialog from './DebuggingInfoDialog';
import JsonFormatCompentent from './JSONFormat';
import { connect } from 'react-redux';
import {cloneDeep} from 'lodash';
import {ExportStagerDataDialog} from './ExportStagerDataDialog';
import {UpdataDevice} from './UpdataDevice';
import debuggingImg from '../../../../../assets/images/debuggingImg.png';
import {getUrlParam,copyTextToClipBoard} from '../../../../../util/util';
import { get, post,Paths } from '../../../../../api';
import { Tabs, Modal, Button } from 'antd';
import {Notification} from '../../../../../components/Notification';

import { 
        getDeviceAndWsAction, 
        getWebsocketMessageAction, 
        getTokenAction, 
        resetDataAction, 
        getDataTypeListAction, 
        getPropertyConfigAction,
        getDeviceDebugAccountListAction,//调试账号列表,
        getDeviceDebugMacList,
        get_SelectedData1_Action,
        get_SelectedData2_Action,
        get_clearException1_Action,
        get_clearException2_Action,
        get_clearDevData1_Action,
        get_clearDevData2_Action,
        updateDeviceDebugAccountListAction,//更新账号列表
        updateDeviceDebugMacListAction,//更新mac列表
    } from '../../store/ActionCreator_debug';
    import { 
        getProductBaseInfo
    } from '../../store/ActionCreator';

import './devTest.scss';

const { TabPane } = Tabs;
    
/**
 * 复制文本的方法，主流浏览器兼容。低版本浏览器提示不支持
 * @param text
 */
function copyText(text) {
    copyTextToClipBoard(text);
}

/**
 * 类型输入框，只能输入符合规则的字符
 * @param ruletype         String         规则（mac|long|int|float|hexstring|string）,分别是  mac地址|整数|整数|小数|十六进制|字符串，默认字符串
 * @param onChange    Function       值改变事件，参数为新的值
 * @param value            String         值
 * @param 其他                            其他参数会原封不动追加到 input元素上（onChange 除外）
 */
class TypeInput extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value:'',
        };
        let v = this.props.value;
        if (!this.rule(this.props.ruletype, v)) {
            v = '';
        }
        if (this.props.value) {
            this.state.value = v;
        }
        this._value = v;
        this.rule = this.rule.bind(this);
    }
    componentWillReceiveProps (newProps) {
        let v = newProps.value;
        if (!this.rule(this.props.ruletype, v)) {
            v = '';
        }
        if (this.state.initValue != newProps.value) {
            this.setState({
                value: v,
                initValue: v,
            });
        }
    }
    rule (type, v) {
        if (!type || !v) return true;
        type = type.toLocaleLowerCase();
        if (type == 'mac' && /^[A-Fa-f0-9]{0,12}$/.test(v)) {
            return true;
        } else if ((type == 'long' || type == 'integer') && /^-?[0-9]*$/.test(v)) {
            return true;
        } else if (type == 'float' && /^(\d+\.\d*|\d+)$/.test(v)) {
            return true;
        } else if (type == 'hexstring' && /^[A-Fa-f0-9]*$/.test(v)) {
            return true;
        } else if (type == 'string') {
            return true;
        }
        return false;
    }
    _value = '';
    render () {
        let _props = cloneDeep(this.props);//深复制一份数据
        let _onChange = this.props.onChange;
        _props.value = this.state.value;
        _props.onChange = function (e) {
            if (!e) return;
            let v = e.target.value;
            if (this.rule(this.props.ruletype, v)) {
                _onChange && _onChange(v);
                this.setState({ value: v });
                this._value = v;
            } else {
                this.setState({ value: this._value ? this._value : '' });
            }
        }.bind(this);
        let dom = React.createElement('input', _props);
        return dom;
    }
}

/**
 * 过滤面板
 */
class FilterPanel extends React.Component{
    constructor(props){
        super(props);
        let filterObj = this.props.filterState ? this.props.filterState : {};
        let isFilter = this.props.isFilter ? this.props.isFilter : false;
        this.state = { 
            filterObj: filterObj, isFilter: isFilter, activeKey: this.props.activeKey 
        };

        this._onReset = this._onReset.bind(this);
        this.onClear = this.onClear.bind(this);
        this._onChange = this._onChange.bind(this);
        this._onChangeSelect = this._onChangeSelect.bind(this);
        this._onChangeCheckbox = this._onChangeCheckbox.bind(this);
        this.exportDataHandler = this.exportDataHandler.bind(this);
    }
    componentWillReceiveProps (newProps) {
        this.setState({...newProps._state});
    }
    _onChange (key, v) {
        let filterState = this.state.filterObj;
        filterState[key] = v;
        this.setState(filterState);
        this.props.onChange && this.props.onChange(this.state.isFilter, filterState);
    }
    _onChangeSelect (key, e) {
        this._onChange(key, e.target.value);
    }
    _onChangeCheckbox () {
        let v = !this.state.isFilter;
        this.setState({ isFilter: v });
        this.props.onChange && this.props.onChange(v, this.state.filterObj);
    }
    _onReset () {
        this.setState({ filterObj: {} });
        this.props.onChange && this.props.onChange(this.state.isFilter, {});
    }
    onClear () {
        if (this.state.activeKey == 1) {
            // actions.DeviceDebugger.clear();
            this.state.get_clearDevData1();
        } else {
            // actions.DeviceDebugger.clear2();
            this.state.get_clearDevData2();
        }
    }
    //导出数据
    exportDataHandler() {
        this.props.openDialog();
    }
    render () {
        let dataTypeOption = this.props.dataTypeList.data.map((v, i) => {
            return (
                <option key={'dataTypeOption'+i} value={v.commandList ? v.commandList.join(',') : ''}>
                    {v.typeName}
                </option>
            );
        }),
        activeKey = this.props.activeKey;
        return (
            <div className="dev-test-filter-panel">
                <form>
                    <div style={{ display: activeKey == 1 ? 'inline-block' : 'none' }}>
                        <label>命令类型：</label>
                        <select className="has-next sclt-cont" onChange={this._onChangeSelect.bind(this, 'filterCommand')} >
                            {dataTypeOption}
                        </select>
                        <label>数据类型：</label>
                        <select className="has-next sclt-cont" onChange={this._onChangeSelect.bind(this, 'filterDataType')} >
                            <option value="">全部</option>
                            <option value="U">上行数据</option>
                            <option value="D">下行数据</option>
                        </select>
                    </div>
                    <div style={{ display: activeKey == 2 ? 'inline-block' : 'none' }}>
                        <label>升级类型：</label>
                        <select className="has-next sclt-cont firm-up" onChange={this._onChangeSelect.bind(this, 'bussinessType')} >
                            <option value="">全部</option>
                            <option value="2">Wi-Fi固件升级</option>
                            <option value="3">PCB固件升级</option>
                        </select>
                    </div>
                    <label>MAC地址：</label>
                    <TypeInput
                        ruletype="mac"
                        type="text"
                        className="has-next"
                        maxLength="12"
                        value={this.state.filterObj.filterMac}
                        onChange={this._onChange.bind(this, 'filterMac')}
                    />
                    <input type="reset" value='重置' className="has-next" onClick={this._onReset} />
                </form>
                <div className='filterBox'>
                    <input type="checkbox" id="isFilter" value="9" name="filterIsFilter" onChange={this._onChangeCheckbox.bind(this, 'filterIsFilter')} />
                    <label className="by-checkbox has-next" htmlFor="isFilter">过滤</label>
                    <input type="button" value='清空报文列表' onClick={this.onClear}/>
                    {activeKey == 1 && (<span className="fr export-excel-btn" onClick={this.exportDataHandler}>导出数据</span>)}
                </div>
            </div>
        );
    }
}

/**
 * 普通面板  样式效果
 * @param title 面板标题
 */
class CommonPanel extends React.Component{
    componentWillReceiveProps (newProps) {
        this.setState({...newProps._state});
    }
    render () {
        return (
            <div className={'dev-test-common-panel ' + (this.props.className ? this.props.className : '')} >
                <div className="common-panel-title">
                    <p>{this.props.title}</p>
                </div>
                <div className="common-panel-content">{this.props.children}</div>
            </div>
        );
    }
}

/**
 * 数据表格
 * @param thead           Array[String]              表头信息
 * @param row             Array[String]|Array[JSON]  表格数据
 * @param rowKey          Array[String]              表格数据为json格式时，提供此参数用来解析json得到td内容
 * @param generateRule    String                     描述表格数据row的格式  默认String 可选json
 * @param minRowCount     int                        表格最小行数，主要用来填充空表格（不足n条时，也要填充多条空行，让表格行数达到n行）
 * @param maxRow          int                        表格最大行数，行数超过n行时，显示最新行，排除最旧的行，使表格行数保持n行
 * @param tableClass      String                     在表格table元素上添加class样式
 * @param filter          function                   提供表格的过滤方法  参数为当前行的数据,即row[index] ，返回false时过滤掉此行数据
 * @param selectedRow     function                   提供选中事件方法，选中某行时触发，参数为选中行的数据，即row[index]
 * @param selectedRowId   String                     让表格自动选中某一行，selectedRowId为row中的id字段
 */
class DataTable extends React.Component{
    constructor(props){
        super(props);
        let state = {};
        if (this.props.selectedRowId) {
            state.selectedId = this.props.selectedRowId;
        }
        this.state = state;
        this.selectRow = this.selectRow.bind(this);
    }
    //表格过滤
    filter (data) {
        let filterFn = this.props.filter
            ? this.props.filter
            : function () {
                return true;
            };
        return filterFn(data);
    }
    //选择一行
    selectRow (data, fn) {
        if (data && data.id) {
            this.setState({
                selectedId: data.id,
            });
            fn && fn(data);
        }
    }
    //生成表头
    generateTHead () {
        //获取表头数
        let theadArray = this.props.thead ? this.props.thead : [];
        //生成表头td模板
        let rowHeadTd = theadArray.map((v, i) => {
            return (
                <td
                    key={i}
                    width={
                        this.props.rowsWidth && this.props.rowsWidth[i]
                            ? this.props.rowsWidth[i]
                            : ''
                    }
                >
                    {v}
                </td>
            );
        });
        //拼接表头模板
        let rowHead = '';
        if (this.props.thead) {
            rowHead = (
                <thead>
                    <tr key="1">{rowHeadTd}</tr>
                </thead>
            );
        }
        return rowHead;
    }
    //生成表格内容
    generateTBody () {
        let generateRule = this.props.generateRule ? this.props.generateRule : '';
        let getValue = function (data, i, type) {
            if (!type || type == 'string') {
                return data[i];
            } else if (type == 'json') {
                let keyList = this.props.rowKey ? this.props.rowKey : [];
                return data[keyList[i]];
            } else if (type == 'function') {
                let keyFn = this.props.rowFn ? this.props.rowFn : [];
                return keyFn[i](data);
            }
        }.bind(this);

        let getColCount = function (type) {
            if (this.props.thead) {
                return this.props.thead.length;
            }
            if (this.props.colCount) {
                return this.props.colCount;
            }

            if (!type || type == 'string') {
                return this.props.rows[0] ? this.props.rows[0].length : 0;
            } else if (type == 'json') {
                return this.props.rowKey ? this.props.rowKey.length : 0;
            } else if (type == 'function') {
                return this.props.rowFn ? this.props.rowFn.length : 0;
            }
        }.bind(this);

        //判断是否要设置最少表格行数，如果实际数据记录数，少于设置的最少行数，则补空行
        let minRowCount = this.props.minRowCount ? parseInt(this.props.minRowCount) : 0;
        let resultRows = this.props.rows ? this.props.rows : [];
        let colCount = getColCount(generateRule);
        if (resultRows.length < minRowCount) {
            let nullRow = [];
            for (let n = 0; n < colCount; n++) {
                nullRow.push('');
            }
            let nullRowTrCount = minRowCount - resultRows.length;
            let nullRowTr = [];
            for (let n = 0; n < nullRowTrCount; n++) {
                nullRowTr.push(nullRow);
            }
            resultRows = resultRows.concat(nullRowTr);
        }

        //生成tbody的数据模板
        let rows = [],
            trCount = 0;
        let nullTd = [];

        for (let i = 0; i < colCount; i++) {
            nullTd.push(
                <td
                    width={
                        this.props.rowsWidth && this.props.rowsWidth[i]
                            ? this.props.rowsWidth[i]
                            : ''
                    }
                    key={'tbody'+i}
                />,
            );
        }
        for (let index = 0; index < resultRows.length; index++) {
            let row = resultRows[index];
            let className = trCount % 2 == 1 ? 'odd' : '';
            if (!this.filter(row)) {
                if (index < minRowCount) {
                    // rows.push(<tr key={index} className={className}><td></td></tr>);
                }
                continue;
            }
            trCount++;
            if (this.props.maxRow) {
                //控制表格行数最大值，避免数据过多，导致页面卡死
                if (trCount >= this.props.maxRow) break;
            }

            let selectedId = this.state.selectedId;
            if (selectedId && row && selectedId == row.id) {
                className += ' active';
            }
            let trRow = [];
            for (let i = 0; i < colCount; i++) {
                let curValue = getValue(row, i, generateRule);
                trRow.push(
                    <td
                        key={'curValue'+i}
                        width={
                            this.props.rowsWidth && this.props.rowsWidth[i]
                                ? this.props.rowsWidth[i]
                                : ''
                        }
                    >
                        {curValue}
                    </td>,
                );
            }
            trRow = trRow && trRow.length > 0 ? trRow : <td />;
            rows.push(
                <tr
                    key={index}
                    className={className}
                    onClick={this.selectRow.bind(this, row, this.props.selectedRow)}
                >
                    {trRow}
                </tr>,
            );
        }
        for (let i = rows.length; i < minRowCount; i++) {
            let className = i % 2 == 1 ? 'odd' : '';
            rows.push(
                <tr key={nullTd+i} className={className}>
                    {nullTd}
                </tr>,
            );
        }
        return rows;
    }
    render () {
        let rowHead = this.generateTHead();
        let rows = this.generateTBody();
        return (
            <div className="dev-test-table">
                <table className={this.props.tableClass ? this.props.tableClass : ''}>
                    {rowHead}
                    <tbody>{rows}</tbody>
                </table>
            </div>
        );
    }
}

/**
 * 数据调试 tab页
 * 初始化时获取父级 所有state，监听stores
 */
class DataDebuggingPage extends React.Component{
    constructor(props){
        super(props);
        this.state = this.props._state;
        this.changeFilter = this.changeFilter.bind(this);
        this.commitData = this.commitData.bind(this);
        this.editJsonData = this.editJsonData.bind(this);
        this.analysisData = this.analysisData.bind(this);//?
        this.tableFilter = this.tableFilter.bind(this);
        this.changeParseData = this.changeParseData.bind(this);
        this.selectedTableRow = this.selectedTableRow.bind(this);
    }
    componentWillReceiveProps (newProps) {
        this.setState({...newProps._state});
    }
    tableFilter (data) {
        if (!data) return false;
        if (data.bussinessType != 0 && data.bussinessType != 1) return false;
        if (!this.state.isFilter) return true;
        let filterObj = this.state.filterObj;
        if (
            filterObj.filterMac &&
            filterObj.filterMac.length > 0 &&
            (!data.macAddress || data.macAddress.indexOf(filterObj.filterMac) != 0)
        ) {
            return false;
        }
        if (
            filterObj.filterDataType &&
            (!data.dataType || data.dataType != filterObj.filterDataType)
        ) {
            return false;
        }
        if (
            filterObj.filterCommand &&
            (!data.command || filterObj.filterCommand.indexOf(data.command) < 0)
        ) {
            return false;
        }
        return true;
    }
    selectedTableRow (data) {
        // actions.DeviceDebugger.selectedData1(data);
        this.state.get_SelectedData1(data);
    }
    changeParseData(key, value) {
        this.state.selectedData1.parseData[key] = value;
    }
    analysisData () {

        let product = this.state.deviceAndWs.productInfo.data,
        propertyConfig = this.state.propertyConfig.propertyConfig,
        propertyConfigId = this.state.propertyConfig.propertyConfigId;
        if ( !product || !propertyConfigId || !propertyConfig || !this.state.selectedData1) return [];
        
        let productStr = [
            product.productVersion,
            product.deviceTypeId,
            product.deviceSubTypeId,
            this.state.selectedData1.command,
        ].join('-'); //"产品序号-大类-小类-命令字";
        // let protocolId= this.state.propertyConfigId["3-35-1-0401"];
        let protocolId = propertyConfigId[productStr];
        if (!protocolId) return [];
        let protocolMap = propertyConfig[protocolId]
            ? propertyConfig[protocolId]
            : {};
        let property = this.state.selectedData1.parseData; //选择左边栏数据时, 后台返回的数据储存于状态机selectedData1
        let dataList = [];

        if (this.state.selectedData1.dataFormat == 1) {
            //为1时 直接用parseData中的键值对显示；   为0时用协议去解析parseData，并以协议中字段的顺序为显示的顺序
            for (let key in property) {
                if (
                    this.state.selectedData1.command == '0104' ||
                    this.state.selectedData1.command === '0007'
                ) {
                    let type = 'text';
                    dataList.push([
                        key,
                        <TypeInput
                            type={type}
                            value={property[key]}
                            onChange={this.changeParseData.bind(this, key)}
                        />,
                    ]);
                } else {
                    dataList.push([key, property[key]]);
                }
            }
        } else {
            if (property) {
                for (let arrIndex in protocolMap) {
                    let key = protocolMap[arrIndex].property;
                    let propertyValue = property[key];
                    if (!property || propertyValue === undefined) continue;
                    let protocol = protocolMap[arrIndex];
                    if (protocol) {
                        if (
                            this.state.selectedData1.command == '0104' ||
                            this.state.selectedData1.command === '0007'
                        ) {
                            let type = 'text';
                            if (protocol.valueType == 'long' || protocol.valueType == 'integer') {
                                type = 'number';
                            }
                            dataList.push([
                                protocol.propertyName,
                                <TypeInput
                                    ruletype={protocol.javaType}
                                    type={type}
                                    value={propertyValue}
                                    onChange={this.changeParseData.bind(this, key)}
                                />,
                            ]);
                        } else {
                            dataList.push([protocol.propertyName, propertyValue]);
                        }
                    }
                }
            }
        }

        // function changeParseData(key, value) {
        //     this.state.selectedData1.parseData[key] = value;
        // }
        
        return dataList;
    }
    editJsonData (e) {
        var selectedData1 = this.state.selectedData1;
        var editJson = !selectedData1.editJson;
        if (editJson) {
            selectedData1.editJson = editJson;
            this.setState({
                selectedData1: selectedData1,
            });
        } else {
            var v = this.refs.editJsonTextArea.getDOMNode().value;
            var data = null;
            try {
                data = JSON.parse(v);
                if (data != null) {
                    selectedData1.parseData = data;
                }
                selectedData1.editJson = editJson;
                this.setState({
                    selectedData1: selectedData1,
                });
            } catch (e) {
                Notification({
                    description:'JSON格式化异常，请检查JSON字符串语法',
                    type:'warn'
                });
            }
        }
    }
    commitData () {

        if (!this.state.selectedData1) return;
        let sendObj = {
            packetStart: this.state.selectedData1.packetStart,
            deviceType: this.state.selectedData1.deviceType,
            deviceSubType: this.state.selectedData1.deviceSubType,
            dataVersion: this.state.selectedData1.dataVersion,
            command: this.state.selectedData1.command,
            macAddress: this.state.selectedData1.macAddress,
            parseData: this.state.selectedData1.parseData,
        };
        ws.send(JSON.stringify(sendObj));
    }
    clearErrorMsg = ()=> {
        this.state.get_clearException1();
    }
    getExceptionDom () {
        if(this.state.websocketMessage.deviceDebuggerException){
            let arrException = this.state.websocketMessage.deviceDebuggerException.split('\r\n');
            let dom = arrException.map((v, i) => {
                return <p key={'ExceptionDom'+i}>{v}</p>;
            });
            return dom;
        }
    }
    changeFilter (isFilter, filterObj) {
        // actions.DeviceDebugger.updateFilter({"isFilter":isFilter,"filterObj":filterObj});
        this.setState({ isFilter: isFilter, filterObj: filterObj });
    }
    render () {
        return (
            <div>
                <FilterPanel _state={this.state} dataTypeList={this.state.dataTypeList} activeKey="1" onChange={this.changeFilter} openDialog={this.props.openDialog}/>
                <div className="dev-test-tab-content data-debug-page">
                    <div className="dev-test-data-wrap">
                        <div className="left-wrap">
                            <CommonPanel title='报文列表' className="add_data_table_scroll">
                                <DataTable
                                    thead={['处理时间','MAC地址','命令字','包标识','数据类型','报文长度','数据长度',]}
                                    rows={this.state.websocketMessage.devData}
                                    rowKey={['time','macAddress','command','packetSequence','dataTypeString','packetLengthString','dataLengthString',]}
                                    rowsWidth={['', '125px']}
                                    generateRule="json"
                                    minRowCount={15}
                                    maxRow={1001}
                                    tableClass="fixed-head"
                                    filter={this.tableFilter}
                                    selectedRow={this.selectedTableRow}
                                    selectedRowId={
                                        this.state.selectedData1
                                            ? this.state.selectedData1.id
                                            : null
                                    }
                                />
                            </CommonPanel>
                            <CommonPanel title='原始报文数据'>
                                <div className="data-area">
                                    <div className="data-input">
                                        <p>{(this.state.selectedData1.packet ? this.state.selectedData1.packet : '').replace(/(.{2})/g, '$1 ')}</p>
                                    </div>
                                    <div className="data-opera">
                                        <div className="inner">
                                            <input type="button"  value='复制' onClick={copyText.bind(this, this.state.selectedData1 ? this.state.selectedData1.packet : '')}/>
                                        </div>
                                    </div>
                                </div>
                            </CommonPanel>
                            <CommonPanel title='设备明文数据'>
                                <div className="data-area">
                                    <div className="data-input">
                                        <p>
                                            {(this.state.selectedData1.data ? this.state.selectedData1.data : '' ).replace(/(.{2})/g, '$1 ')}
                                        </p>
                                    </div>
                                    <div className="data-opera">
                                        <div className="inner">
                                            <input type="button" value='复制' onClick={copyText.bind(this, this.state.selectedData1 ? this.state.selectedData1.data : '')}/>
                                        </div>
                                    </div>
                                </div>
                            </CommonPanel>
                            <CommonPanel title='调试错误信息'>
                                <div className="data-area">
                                    <div className="data-input exception-text">
                                        {this.getExceptionDom()}
                                    </div>
                                    <div className="data-opera">
                                        <div className="inner">
                                            <input type="button" value='复制' onClick={copyText.bind(this, this.state.websocketMessage.deviceDebuggerException)}/>
                                            <p>
                                                <input type="button" value='删除' onClick={this.clearErrorMsg} />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CommonPanel>
                        </div>
                        <div className="right-wrap">
                            <CommonPanel title='报文解析列表'>
                                {this.state.selectedData1 &&
                                    this.state.selectedData1.dataFormat == 1 &&
                                    this.state.selectedData1.parseData != undefined ? (
                                        <div className="json-format-panel">
                                            {this.state.selectedData1 &&
                                                this.state.selectedData1.editJson ? (
                                                    <div className="editJsonPanel">
                                                        <textarea
                                                            defaultValue={
                                                                this.state.selectedData1 &&
                                                                    this.state.selectedData1.parseData
                                                                    ? JSON.stringify(
                                                                        this.state.selectedData1
                                                                            .parseData,
                                                                    )
                                                                    : this.state.selectedData1.parseData +
                                                                    ''
                                                            }
                                                            ref="editJsonTextArea"
                                                        />
                                                    </div>
                                                ) : (
                                                    <JsonFormatCompentent json={this.state.selectedData1.parseData} jsonCode={this.state.selectedData1.id} />
                                                )}
                                        </div>
                                    ) : 
                                    (<DataTable rows={this.analysisData()} minRowCount={24} rowsWidth={['60%', '']} tableClass="fixed-head" />)}
                            </CommonPanel>
                            <div className="send-command-area">
                                <div className="inner">
                                    <p>
                                        <input
                                            type="button"
                                            value={this.state.selectedData1 && this.state.selectedData1.editJson ? '保存编辑数据' : '编辑JSON数据'}
                                            style={{ display: this.state.selectedData1 && this.state.selectedData1.dataFormat == 1 && (this.state.selectedData1.command == '0103' || this.state.selectedData1.command == '0104' || this.state.selectedData1.command == '0007') ? 'inline-block' : 'none'}}
                                            onClick={this.editJsonData}
                                        />
                                        <input
                                            type="button"
                                            value='下发控制命令'
                                            style={{display: this.state.selectedData1 && (this.state.selectedData1.command == '0104' || this.state.selectedData1.command == '0007') ? 'inline-block' : 'none',}}
                                            onClick={this.commitData}
                                        />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * 升级调试页
 * 初始化时获取父级 所有state，监听stores
 */
class EquipmentUpgradePage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            upgradeDialogClosable: false, //加入控制弹窗的状态机 
            upgradeDialogTip: {}, //弹窗的提示内容
            upgradeData: null, //升级请求的参数
            firmwareModules:[],//模组固件列表
            deviceVersionType:'',
            mac:'',
            ...this.props._state
        };

        this.tableFilter = this.tableFilter.bind(this);
        this.selectedTableRow = this.selectedTableRow.bind(this);
        this.getOnlineDevice = this.getOnlineDevice.bind(this);
        this.selectedDeviceFn = this.selectedDeviceFn.bind(this);
        this.upgrade = this.upgrade.bind(this);
        this.clearErrorMsg = this.clearErrorMsg.bind(this);
        this.getExceptionDom = this.getExceptionDom.bind(this);
        this.changeFilter = this.changeFilter.bind(this);
    }
    componentWillReceiveProps (newProps) {
        this.setState({...newProps._state});
    }
    tableFilter (data) {
        if (!data) return false;
        if (data.bussinessType != 2 && data.bussinessType != 3) return false;

        if (!this.state.isFilter) return true;
        let filterObj = this.state.filterObj;
        if (
            filterObj.filterMac &&
            filterObj.filterMac.length > 0 &&
            (!data.macAddress || data.macAddress.indexOf(filterObj.filterMac) != 0)
        ) {
            return false;
        }
        if (filterObj.bussinessType && filterObj.bussinessType != data.bussinessType) {
            return false;
        }
        return true;
    }
    selectedTableRow (data) {
        // actions.DeviceDebugger.selectedData2(data);
        this.state.get_SelectedData2(data);
    }
    getOnlineDevice () {
        let resultOnlineDevice = [];
        let index = 0;
        for (let mac in this.state.websocketMessage.onlineDevice) {
            if (new Date().getTime() - this.state.websocketMessage.onlineDevice[mac].time <= 1000 * 25) {
                let device = {
                    id: ++index,
                    mac: mac,
                    packetStart: this.state.websocketMessage.onlineDevice[mac].packetStart,
                };
                resultOnlineDevice.push(device);
            }
        }
        return resultOnlineDevice;
    }
    selectedDeviceFn (data) {
        this.selectedDevice = data;
    }
    upgrade (type) {
        if (!this.selectedDevice) {
            Notification({
                description:'请先选择升级的设备！',
            });
            return;//没选择mac得话，点击升级无用。
        } 
        let tipconts = type == 1 ? '模组升级' : 'MCU升级';
        // this.props.getAllFirmwareVersionTypeAction( type == 1 ? 1 : 2);
        get(Paths.getAllFirmwareVersionType,{deviceVersionTypeId: type == 1 ? 1 : 2}).then((data) => {
            if(data.code==0){
                this.setState({firmwareModules:data.data});
            }
        });
        // let typeSrc = type == 1 ? 'Wi-Fi' : 'PCB';
        // let upgradeData = {},
        //     data = {},
        //     upgradeDialogTip = {
        //         tipconts: typeSrc + '升级',
        //         warn: '确定要升级设备'+ this.selectedDevice.mac +'的'+ typeSrc +'固件？'
        //     };
        // if (type == '1' && this.selectedDevice.packetStart == 'F2') {
        //     data = { mac: this.selectedDevice.mac, moduleType: type, command: '8030' };
        // } else if (type == '1' && this.selectedDevice.packetStart == '5A') {
        //     data = { mac: this.selectedDevice.mac, moduleType: type, command: '0130' };
        // } else if (type == '2' && this.selectedDevice.packetStart == 'F2') {
        //     data = { mac: this.selectedDevice.mac, moduleType: type, command: '8020' };
        // } else if (type == '2' && this.selectedDevice.packetStart == '5A') {
        //     data = { mac: this.selectedDevice.mac, moduleType: type, command: '0120' };
        // }
        // upgradeData.actionType = 'upgrade';
        // upgradeData.data = data;
        this.setState({
            upgradeDialogClosable: true,
            tipconts,
            deviceVersionType:type,
            mac:this.selectedDevice.mac
            // upgradeDialogTip,
            // upgradeData,
        });
    }
    handleConfirm = (bool, param) => {
        //点击了弹窗确认的方法
        if (bool) {
            // actions.DeviceDebugger[param.actionType](param.data);
        }
        this.setState({
            upgradeDialogClosable: false,
            upgradeDialogTip: {},
            upgradeData: null,
        });
    }
    handlecancel = () => {
        this.setState({
            upgradeDialogClosable: false
        });
    }
    clearErrorMsg () {
        // actions.DeviceDebugger.clearException2();
        this.state.get_clearException2();
    }
    getExceptionDom () {
        if(this.state.websocketMessage){
            let arrException = this.state.websocketMessage.deviceDebuggerException2.split('\r\n');
            let dom = arrException.map((v, index) => {
                return <p key={'deviceDebuggerException2'+index}>{v}</p>;
            });
            return dom;
        }
    }
    changeFilter (isFilter, filterObj) {
        // actions.DeviceDebugger.updateFilter({"isFilter":isFilter,"filterObj":filterObj});
        this.setState({ isFilter: isFilter, filterObj: filterObj });
    }
    render () {
        let { selectedData2,upgradeDialogClosable, upgradeDialogTip, tipconts, firmwareModules, deviceVersionType, mac } = this.state;
        let { firmwareVersionType, totalVersion, mainVersion, macList } = this.props;
        /**
         * hardwareType
         * 1. 如果产品硬件方案是MCU方案，调试时可以出现模组升级+MCU升级；
         * 2. 如果产品硬件方案是SoC方案，调试时只能出现模组升级；
         */
        return (
            <div>
                <div>
                    <FilterPanel _state={this.state} dataTypeList={this.state.dataTypeList} activeKey="2" onChange={this.changeFilter}/>
                    <div className="dev-test-tab-content equipment-upgrade-page">
                        <div className="dev-test-data-wrap">
                            <div className="left-wrap">
                                <CommonPanel title='在线设备列表'>
                                    <div className="device-list">
                                        <DataTable
                                            rows={this.getOnlineDevice()}
                                            rowKey={['id', 'mac']}
                                            generateRule="json"
                                            minRowCount={26}
                                            rowsWidth={['25%', '']}
                                            selectedRow={this.selectedDeviceFn}
                                        />
                                    </div>
                                    {
                                        this.props.hardwareType==0?
                                            <div className="device_upgrade_opera">
                                                <p><input type="button" value='模组升级' onClick={this.upgrade.bind(this, '1')} /></p>
                                                <p className="line" />
                                                <p><input type="button" value='MCU升级' onClick={this.upgrade.bind(this, '2')} /></p>
                                            </div>
                                            :<div className="device_upgrade_opera">
                                                <p><input type="button" value='模组升级' onClick={this.upgrade.bind(this, '1')} /></p>
                                            </div>
                                    }
                                </CommonPanel>
                            </div>
                            <div className="right-wrap">
                                <CommonPanel title='报文列表' className="add_data_table_scroll" >
                                    <DataTable
                                        thead={['处理时间','MAC地址','命令字','包标识','数据类型','报文长度','数据长度']}
                                        rows={this.state.websocketMessage.devData2}
                                        rowKey={['time','macAddress','command','packetSequence','dataTypeString','packetLengthString','dataLengthString']}
                                        rowsWidth={['', '125px']}
                                        generateRule="json"
                                        minRowCount={15}
                                        maxRow={1001}
                                        tableClass="fixed-head"
                                        filter={this.tableFilter}
                                        selectedRow={this.selectedTableRow}
                                        selectedRowId={ this.state.selectedData1 ? this.state.selectedData1.id : null }
                                    />
                                </CommonPanel>
                                <CommonPanel title='原始报文数据'>
                                    <div className="data-area">
                                        <div className="data-input">
                                            <p>
                                                {(selectedData2.packet ? selectedData2.packet : '' ).replace(/(.{2})/g, '$1 ')}
                                            </p>
                                        </div>
                                        <div className="data-opera">
                                            <div className="inner">
                                                <input type="button" value='复制' onClick={copyText.bind( this,selectedData2 ? selectedData2.packet : '')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CommonPanel>
                                <CommonPanel title='设备明文数据'>
                                    <div className="data-area">
                                        <div className="data-input">
                                            <p>{(selectedData2.data ? selectedData2.data : '' ).replace(/(.{2})/g, '$1 ')}</p>
                                        </div>
                                        <div className="data-opera">
                                            <div className="inner">
                                                <input type="button" value='复制' onClick={copyText.bind(this, selectedData2 ? selectedData2.data : '')}/>
                                            </div>
                                        </div>
                                    </div>
                                </CommonPanel>
                                <CommonPanel title='调试信息控制台'>
                                    <div className="data-area">
                                        <div className="data-input exception-text"> {this.getExceptionDom()} </div>
                                        <div className="data-opera">
                                            <div className="inner">
                                                <input type="button" value='复制' onClick={copyText.bind(this, this.state.websocketMessage.deviceDebuggerException2)} />
                                                <p>
                                                    <input type="button" value='删除' onClick={this.clearErrorMsg} />
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CommonPanel>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal className='upgradeDialog' 
                    title={upgradeDialogTip.tipconts||''} 
                    visible={upgradeDialogClosable}
                    footer={null}
                    onCancel={this.handlecancel}
                    maskClosable={false} 
                >
                    <UpdataDevice 
                        tipconts={tipconts} 
                        onCancel={this.handlecancel} 
                        deviceVersionType={deviceVersionType}
                        macList={macList}
                        mac={mac} 
                        firmwareModules={firmwareModules} 
                        firmwareVersionType={firmwareVersionType} 
                        totalVersion={totalVersion} 
                        mainVersion={mainVersion} 
                        changeFormData={this.props.changeFormData}
                        get_clearDevData2 = {this.state.get_clearDevData2}
                    />
                </Modal>
            </div>
        );
    }
}

/**
 * 特殊命令弹出框
 */
class CommandsDebugDialog extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            param: { command: this.props.code, mac: this.props.defaultMac }
        }
        this.vaild = this.vaild.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.bindParam = this.bindParam.bind(this);
    }
    onConfirm () {
        let error = this.vaild();
        if (error) {
            Notification({
                type:'error',
                description:error
            });
            
            return;
        }
        let obj = cloneDeep(this.state.param);
        obj.command = this.props.code;
        this.props.onConfirm && this.props.onConfirm(obj);
        this.setState({
            param: {},
        });
    }
    onCancel () {
        this.setState({
            param: {},
        });
        this.props.onCancel();
    }
    vaild () {
        return true;
    }
    bindParam (name, v, e) {
        let p = Object.assign({},this.state.param)
        let value = v;
        if (!v && e) {
            value = e.target.value;
        }
        p[name] = value;
        this.setState({ param: p });
        
    }
    render () {
        let _this = this;
        function getInput(code) {
            switch (code) {
                case '0102':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                    };
                    return (
                        <div className="form-group">
                            <label>设备MAC地址</label>
                            <div className="form-group-input-out">
                                <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac} onChange={_this.bindParam.bind(_this, 'mac')} />
                            </div>
                        </div>
                    );
                case '0103':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                        try {
                            JSON.parse(_this.state.param.json);
                        } catch (e) {
                            return 'json格式错误，请校验';
                        }
                    };
                    return (
                        <div>
                            <div className="form-group">
                                <label>设备MAC地址</label>
                                <div className="form-group-input-out">
                                    <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac} onChange={_this.bindParam.bind(_this, 'mac')} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>JSON</label>
                                <div className="form-group-input-out">
                                    <textarea onChange={_this.bindParam.bind(_this, 'json', null)} />
                                </div>
                            </div>
                        </div>
                    );
                case '0104':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                        if (!_this.state.param.mac) {
                            return '请输入硬件配置信息';
                        }
                        try {
                            JSON.parse(_this.state.param.json);
                        } catch (e) {
                            return 'json格式错误，请校验';
                        }
                    };
                    return (
                        <div>
                            <div className="form-group">
                                <label>设备MAC地址</label>
                                <div className="form-group-input-out">
                                    <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac} onChange={_this.bindParam.bind(_this, 'mac')} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>JSON</label>
                                <div className="form-group-input-out">
                                    <textarea onChange={_this.bindParam.bind(_this, 'json', null)} />
                                </div>
                            </div>
                        </div>
                    );
                case '0107':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                        if (!_this.state.param.json) {
                            return '请输入硬件配置信息';
                        }
                        try {
                            JSON.parse(_this.state.param.json);
                        } catch (e) {
                            return 'json格式错误，请校验';
                        }
                    };
                    return (
                        <div>
                            <div className="form-group">
                                <label>设备MAC地址</label>
                                <div className="form-group-input-out">
                                    <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac} onChange={_this.bindParam.bind(_this, 'mac')} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>硬件配置信息(json)</label>
                                <div className="form-group-input-out">
                                    <textarea onChange={_this.bindParam.bind(_this, 'json', null)} />
                                </div>
                            </div>
                        </div>
                    );
                case '0109':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                        if (!_this.state.param.ip) {
                            return '请输入服务器IP地址';
                        }
                        if (!_this.state.param.port) {
                            return '请输入服务器端口';
                        }
                    };
                    return (
                        <div>
                            <div className="form-group">
                                <label>设备MAC地址</label>
                                <div className="form-group-input-out">
                                    <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac} onChange={_this.bindParam.bind(_this, 'mac')} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>服务器IP地址</label>
                                <div className="form-group-input-out">
                                    <input type="text" value={_this.state.param.ip} onChange={_this.bindParam.bind(_this, 'ip', null)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>服务器端口</label>
                                <div className="form-group-input-out">
                                    <TypeInput ruletype="integer" type="number" maxLength="4" value={_this.state.param.port} onChange={_this.bindParam.bind(_this, 'port')} />
                                </div>
                            </div>
                        </div>
                    );
                case '010A':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                        if (!_this.state.param.uploadCycle) {
                            return '请输入上传周期';
                        }
                        if (!_this.state.param.collectCycle) {
                            return '请输入采集周期';
                        }
                        if (!_this.state.param.heatBeatCycle) {
                            return '请输入心跳周期';
                        }
                    };
                    return (
                        <div>
                            <div className="form-group">
                                <label>设备MAC地址</label>
                                <div className="form-group-input-out">
                                    <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac} onChange={_this.bindParam.bind(_this, 'mac')} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>上传周期(秒)</label>
                                <div className="form-group-input-out">
                                    <TypeInput ruletype="integer" type="number" value={_this.state.param.uploadCycle} onChange={_this.bindParam.bind(_this, 'uploadCycle')} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>采集周期(秒)</label>
                                <div className="form-group-input-out">
                                    <TypeInput ruletype="integer" type="number" value={_this.state.param.collectCycle} onChange={_this.bindParam.bind(_this, 'collectCycle')} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>心跳周期(秒)</label>
                                <div className="form-group-input-out">
                                    <TypeInput ruletype="integer" type="number" value={_this.state.param.heatBeatCycle} onChange={_this.bindParam.bind(_this, 'heatBeatCycle')} />
                                </div>
                            </div>
                        </div>
                    );
                case '010B':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                    };
                    return (
                        <div className="form-group">
                            <label>设备MAC地址</label>
                            <div className="form-group-input-out">
                                <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac} onChange={_this.bindParam.bind(_this, 'mac')} />
                            </div>
                        </div>
                    );
                case '0405':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                    };
                    return (
                        <div className="form-group">
                            <label>设备MAC地址</label>
                            <div className="form-group-input-out">
                                <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac}  onChange={_this.bindParam.bind(_this, 'mac')} />
                            </div>
                        </div>
                    );
                case '1405':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                    };
                    return (
                        <div className="form-group">
                            <label>设备MAC地址</label>
                            <div className="form-group-input-out">
                                <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac} onChange={_this.bindParam.bind(_this, 'mac')} />
                            </div>
                        </div>
                    );
                case '0404':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                    };
                    return (
                        <div className="form-group">
                            <label>设备MAC地址</label>
                            <div className="form-group-input-out">
                                <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac} onChange={_this.bindParam.bind(_this, 'mac')} />
                            </div>
                        </div>
                    );
                case '1404':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                    };
                    return (
                        <div className="form-group">
                            <label>设备MAC地址</label>
                            <div className="form-group-input-out">
                                <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac} onChange={_this.bindParam.bind(_this, 'mac')} />
                            </div>
                        </div>
                    );
                case '1403':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                    };
                    return (
                        <div className="form-group">
                            <label>设备MAC地址</label>
                            <div className="form-group-input-out">
                                <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac} onChange={_this.bindParam.bind(_this, 'mac')} />
                            </div>
                        </div>
                    );
                case '140E':
                    _this.vaild = function () {
                        if (!_this.state.param.mac) {
                            return '请输入设备的MAC地址';
                        }
                        if (!/[A-Fa-f\d]{12}/.test(_this.state.param.mac)) {
                            return '请输入正确的MAC地址';
                        }
                    };
                    return (
                        <div className="form-group">
                            <label>设备MAC地址</label>
                            <div className="form-group-input-out">
                                <TypeInput ruletype="mac" type="text" maxLength="12" value={_this.state.param.mac} onChange={_this.bindParam.bind(_this, 'mac')} />
                            </div>
                        </div>
                    );
                default:
                    return null;
            }
        }
        //
        return <div className="">
                    <div className="modal-body">{getInput(this.props.code)}</div>
                    <div className="modal-footer">
                        <Button type="primary" onClick={this.onConfirm}>确定</Button>
                        <Button className='cancel' onClick={this.onCancel}>取消</Button>
                    </div>
                </div>
    }
}

/**
 * 头部
 */
class DevTestHeader extends React.Component{
    render () {
        return <div className="dev-test-header">{this.props.children}</div>;
    }
}

/**
 * 是否接收数据按钮
 */
class DevTestBtnReceive extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            
        }
        // this.onChange = this.onChange.bind(this);
    }
    render () {
        return (
            <div className={'dev-test-item dev-test-receive ' + this.props.className}>
                <p>
                    <input id="btnReceive" type="checkbox" checked={this.props.value} onChange={this.props.onChange} />
                    <label htmlFor="btnReceive">接收报文</label>
                </p>
            </div>
        );
    }
}
/**
 * 特殊命令按钮
 */
class DevTestCommand extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            focus: false
        }
        this.selectCommand = this.selectCommand.bind(this);
        this._onFocusHandler = this._onFocusHandler.bind(this);
        this._onBlurHandler = this._onBlurHandler.bind(this);
    }
    /**
     * 获得焦点
     */
    _onFocusHandler (e) {
        e.nativeEvent.stopImmediatePropagation();
        this.setState({
            focus: !this.state.focus,
        });
    }
    /**
     *  失去焦点
     */
    _onBlurHandler () {
        this.setState({
            focus: false,
        });
    }
    /**
     * 挂载时给 document，添加点击事件，点击其他区域，收起命令面板
     */
    componentDidMount () {
        document.addEventListener('click', this._onBlurHandler, false);
    }
    componentWillUnmount () {
        document.removeEventListener('click', this._onBlurHandler, false);
    }
    /**
     * 选择一个命令时，访问父容器onSelect方法，将命令code传出
     * @param code
     * @param e
     */
    selectCommand (code, e) {
        this.props.onSelect && this.props.onSelect(code);
    }
    render () {
        return (
            <div
                className={'dev-test-item dev-test-command ' + this.props.className}
                onClick={this._onFocusHandler}
                style={{ display: this.props.activeKey == 1 ? 'block' : 'none' }}
            >
                <div className="command-select" style={{ display: this.state.focus ? 'block' : 'none' }}>
                    <ul>
                        <li onClick={this.selectCommand.bind(this, '0102')}>
                            <span className="num">0102-</span>
                            <span className="txt" title='请求加密'>请求加密</span>
                        </li>
                        <li onClick={this.selectCommand.bind(this, '0103')}>
                            <span className="num">0103-</span>
                            <span className="txt" title='非WIF实时数据'>非WIF实时数据</span>
                        </li>
                        <li onClick={this.selectCommand.bind(this, '0104')}>
                            <span className="num">0104-</span>
                            <span className="txt" title='控制数据'>控制数据</span>
                        </li>
                        <li onClick={this.selectCommand.bind(this, '0107')}>
                            <span className="num">0107-</span>
                            <span className="txt" title='硬件配置'>硬件配置</span>
                        </li>
                        <li onClick={this.selectCommand.bind(this, '0109')}>
                            <span className="num">0109-</span>
                            <span className="txt" title='切换服务器'>切换服务器</span>
                        </li>
                        <li onClick={this.selectCommand.bind(this, '010A')}>
                            <span className="num">010A-</span>
                            <span className="txt" title='更改上传周期'>更改上传周期</span>
                        </li>
                        <li onClick={this.selectCommand.bind(this, '010B')}>
                            <span className="num">010B-</span>
                            <span className="txt" title='解绑命令'>解绑命令</span>
                        </li>
                        <li onClick={this.selectCommand.bind(this, '0405')}>
                            <span className="num">0405-</span>
                            <span className="txt" title='上传运行数据'>上传运行数据</span>
                        </li>
                        <li onClick={this.selectCommand.bind(this, '1405')}>
                            <span className="num">1405-</span>
                            <span className="txt" title='上传历史运行数据'>上传历史运行数据</span>
                        </li>
                        <li onClick={this.selectCommand.bind(this, '0404')}>
                            <span className="num">0404-</span>
                            <span className="txt" title='上传控制数据'>上传控制数据</span>
                        </li>
                        <li onClick={this.selectCommand.bind(this, '1404')}>
                            <span className="num">1404-</span>
                            <span className="txt" title='上传历史控制数据'>上传历史控制数据</span>
                        </li>
                        <li onClick={this.selectCommand.bind(this, '1403')}>
                            <span className="num">1403-</span>
                            <span className="txt" title='非Wi-Fi设备数据'>非Wi-Fi设备数据</span>
                        </li>
                        <li onClick={this.selectCommand.bind(this, '140E')}>
                            <span className="num">140E-</span>
                            <span className="txt" title='上传历史故障数据'>上传历史故障数据</span>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}
/**
 * 主容器
 */
let ws; //保存websocket连接
let wsProtocol = 'wss:';
let httpProtocol = window.location.protocol;
wsProtocol = httpProtocol.replace(/https?/, 'wss');
let wsTimer; //websocket心跳连接定时器，页面销毁时，需要同时销毁定时器


const mapStateToProps = state => {
    return {
        deviceAndWs: state.getIn(['deviceDebug','deviceAndWs']).toJS(),
        websocketMessage: state.getIn(['deviceDebug','websocketMessage']).toJS(),
        dataTypeList: state.getIn(['deviceDebug','dataTypeList']).toJS(),
        propertyConfig: state.getIn(['deviceDebug','propertyConfig']).toJS(),
        deviceDebugAccountList: state.getIn(['deviceDebug','deviceDebugAccountList']).toJS(),
        deviceDebugMacList: state.getIn(['deviceDebug','deviceDebugMacList']).toJS(), 
        selectedData1: state.getIn(['deviceDebug','selectedData1']).toJS(),
        selectedData2: state.getIn(['deviceDebug','selectedData2']).toJS(),
        productBaseInfo: state.getIn(['product','productBaseInfo']).toJS(),

    }
}
const mapDispatchToProps = dispatch => {
    return {
        updateDevice: (id) => dispatch(getDeviceAndWsAction(id)),
        getwebsocketMessage: (data) => dispatch(getWebsocketMessageAction(data)),
        getToken: () => dispatch(getTokenAction()),
        resetData: () => dispatch(resetDataAction()),
        getDataTypeList: (id) => dispatch(getDataTypeListAction(id)),
        getPropertyConfig: (id) => dispatch(getPropertyConfigAction(id)),
        getDeviceDebugAccountList: (id) => dispatch(getDeviceDebugAccountListAction(id)),
        getDeviceDebugMacList: (id) => dispatch(getDeviceDebugMacList(id)),
        get_SelectedData1: (data) => dispatch(get_SelectedData1_Action(data)),
        get_SelectedData2: (data) => dispatch(get_SelectedData2_Action(data)),
        get_clearException1: ()=>dispatch(get_clearException1_Action()),//删除异常
        get_clearException2: ()=>dispatch(get_clearException2_Action()),//删除异常
        get_clearDevData1: ()=>dispatch(get_clearDevData1_Action()),//删除报文数据
        get_clearDevData2: ()=>dispatch(get_clearDevData2_Action()),//删除报文数据

        updateDeviceDebugAccountList: (data)=>dispatch(updateDeviceDebugAccountListAction(data)),
        updateDeviceDebugMacList: (data)=>dispatch( updateDeviceDebugMacListAction(data)),

        getProductBaseInfo: id => dispatch(getProductBaseInfo(id)) // 获取产品基本信息

    }
}
@connect(mapStateToProps, mapDispatchToProps)
export default class StartTest  extends Component{
    constructor(props){
        super(props);
        this.state = {
            visible: false,//调式账号弹窗 ***
            visibleExportData:false,//导出数据弹窗
            isReceive: true,//是否接受消息
            macList: [],
            command: {
                active: false,
            },
            activeKey: '1',
            selectedMac:{value:undefined},
            date:{value:undefined},
            firmwareVersionType:{value:undefined},
            mainVersion:{value:undefined},
            totalVersion:{value:undefined},
        }
        this.webSocketStatu = null; // 链接状态
        this.onCloseDialog = this.onCloseDialog.bind(this);
        this.onSendCommand = this.onSendCommand.bind(this);
        this.handleCancel = this.handleCancel.bind(this);

        this.onSelectTab = this.onSelectTab.bind(this);
        this.changeReceiveState = this.changeReceiveState.bind(this);
        this.selectCommand = this.selectCommand.bind(this);
        this.openDialog = this.openDialog.bind(this);
        this.visible = this.visible.bind(this);
        this.debugVisible = this.debugVisible.bind(this);
    }
    componentDidMount() {
        if(this.props.onRef){
            this.props.onRef(this)
        }

        /**
         * 先加载配置账号及配置设备信息
         */
        // this.props.getDeviceDebugAccountList(pid);//获取调试账号
        // this.props.getDeviceDebugMacList(pid);//获取调试MAC
        let pid = getUrlParam('productId')||this.props.productId;
        this.props.getProductBaseInfo(pid);
        let accountList = [],
            macList = [];
        post(Paths.deviceDebugAccountGetList,{productId:pid},{loading:true}).then((model) => {
            if(model.code==0){
                accountList = model.data || [];
                this.props.updateDeviceDebugAccountList(model);
                // post(Paths.deviceDebugMacGetList,{productId:pid}).then((res) => {
                post(Paths.debugSecretList,{productId:pid},{loading:true}).then((res) => {
                    if(res.code==0){
                        macList = res.data || [];
                        this.props.updateDeviceDebugMacList(res);
                        if(accountList.length>0&&macList.length>0){
                            this._mount = true;
                            this.props.updateDevice(pid);//
                            this.props.getDataTypeList(pid);//获取数据类型 // actions.DeviceDebugger.getDataTypeList({ productId: pid });
                            this.props.getPropertyConfig(pid);// actions.DeviceDebugger.getPropertyConfig({ productId: pid });
                            // setTimeout ((()=>{
                            //     this.setState({visible:false})
                            // }),5000);//延迟五秒关闭弹窗
                        }

                        if(!macList.length) {
                            this.visible()
                        }
                    }
                });
            }
        });
        // this.props.updateDevice(pid);//
        // this.props.getDataTypeList(pid);//获取数据类型 // actions.DeviceDebugger.getDataTypeList({ productId: pid });
        // this.props.getPropertyConfig(pid);// actions.DeviceDebugger.getPropertyConfig({ productId: pid });
        // this._mount = true;
    }
    componentWillUpdate (nextProps, nextState) {
            if (nextProps.deviceAndWs.wsUrl.data.ip && nextProps.deviceAndWs.wsUrl.data.ip !== this.props.deviceAndWs.wsUrl.data.ip) {
                if (!WebSocket || ws) return;
                ws = new WebSocket(wsProtocol + '//' + nextProps.deviceAndWs.wsUrl.data.ip);
                bindEvent.call(this);
            }
            //如果token发生改变就当做 需要重连了
            if (ws == null && nextState.token && nextState.token !== this.state.token) {
                ws = new WebSocket(wsProtocol + '//' + nextProps.queryServerConfig.ip);
                bindEvent.call(this);
            }
        function bindEvent() {
            //连接成功
            ws.onopen = function () {
                this.webSocketStatu = 1;
                clearInterval(wsTimer);
                wsTimer = setInterval(function () {
                    ws.send('');
                }, 5000);
                let product = this.props.deviceAndWs.productInfo.data;
                let productMsg =
                    '[' +
                    this.props.deviceAndWs.token.data +
                    '|' +
                    product.customerCode +
                    '|' +
                    product.deviceTypeId +
                    '#' +
                    product.deviceSubTypeId +
                    '#' +
                    product.productVersion +
                    ']';
                // let productMsg = "[144514545|1|11#3#1]";//测试数据
                ws.send(productMsg);
            }.bind(this);
            //接收到消息
            ws.onmessage = function (data) {
                if (this.state.isReceive) {
                    this.props.getwebsocketMessage(JSON.parse(data.data));
                }
            }.bind(this);
            //检测到断开连接
            ws.onclose = function (e) {
                this.webSocketStatu = 0;
                clearInterval(wsTimer);
                if (this._mount && e.code == '1006') {
                    //如果异常断开，会尝试重连
                    setTimeout(
                        function () {
                            // actions.DeviceDebugger.getToken();---重新获取token
                            this.props.getToken();
                        }.bind(this),
                        5000,
                    );
                }
                ws = null;
            }.bind(this);
        }
    }
    //退出后销毁websocket连接和心跳定时器，重置数据
    componentWillUnmount () {
        this.props.resetData();//初始化数据 actions.DeviceDebugger.resetData();
        ws && ws.close();
        clearInterval(wsTimer);
        ws = null;
        this._mount = false;
    }
    visible(){
        this.setState({visible:!this.state.visible});
    }
    //Tab切换
    onSelectTab (key) {
        this.setState({
            activeKey: key,
        });
    }
    //设置按钮
    selectCommand (code) {
        this.setState({
            command: {
                active: true,
                code: code,
                mac: this.props.selectedData1 ? this.props.selectedData1.macAddress : '',
            }
        });
    }
    /**
     * 下发命令
     * @param param  下发命令的参数
     */
    onSendCommand (param) {
        // console.log(1111,param);
        let sendObj = {
            command: param.command,
            macAddress: param.mac,
            parseData: {},
        };
        let parseData = null;
        for (let key in param) {
            if (key == 'mac') {
                sendObj.macAddress = param.mac;
            } else if (key == 'command') {
                sendObj.command = param.command;
            } else if (key == 'json') {//
                let json = JSON.parse(param.json);
                if(parseData === null){
                    parseData = {};
                }
                for(let k in json){
                    parseData[k] = json[k]
                }
            } else {//
                if (parseData === null) {
                    parseData = {};
                }
                parseData[key] = param[key];
            }
        }
        sendObj.parseData = parseData;
        // console.log(2222,sendObj);

        if(!ws) {
            Notification({
                description:'没有已连接的设备'
            })
            return;
        }

        this.setState({command: {active: false}},()=>ws.send(JSON.stringify(sendObj)));
    }
    onCloseDialog () {
        this.setState({command: {active: false}});
    }
    //是否接受报文
    changeReceiveState () {
        var b = this.state.isReceive;
        this.setState({
            isReceive: !b,
        });
    }
    openDialog() {
        this.refs.dialog.openDialog();
    }
    //弹框
    handleCancel(type){
        type==1?
        this.setState({visibleExportData:!this.state.visibleExportData})
        :this.setState({command:{active: !this.state.command.active}});
    }
    //产品详情，调试工具，当mac跟账号列表都为空的时候，需要展示弹窗
    debugVisible(){
        this.setState({visible:true});
    }
    changeFormData  = (changedFields)=> {
        this.setState({...changedFields});
    }
    render () {
        let {visible,visibleExportData,activeKey,selectedMac,date,firmwareVersionType,mainVersion,totalVersion} = this.state;
        let { deviceDebugAccountList, deviceDebugMacList, productBaseInfo } = this.props;
        let pid = getUrlParam('productId')||this.props.productId;
        let hardwareType = getUrlParam('hardwareType')||this.props.productBaseInfo.hardwareType;
        return (
            <div className='devDebuggingBox commonContentBox'>
                <div className="title">
                    <div className='titleName'>在线设备调试工具</div>
                    <div className='titleOperation' onClick={this.visible}>
                        <img src={debuggingImg} />
                        <span>配置调试信息</span>
                    </div>
                </div>
                <div className="msui-wrapper-devDeviceList centent">
                    <div className="dev-test-content">
                        <DevTestHeader>
                            <Tabs defaultActiveKey={activeKey} onChange={this.onSelectTab}>
                                <TabPane tab="数据设备调试" key="1"></TabPane>
                                <TabPane tab="升级调试" key="2"></TabPane>
                            </Tabs>
                            <div className={this.webSocketStatu==1?'linkState':'linkState linkError'}>{this.webSocketStatu==1?'链接成功':'链接失败'}</div>
                            <div className="dev-test-header-right">
                                <DevTestBtnReceive
                                    className={this.state.activeKey == 1 ? 'line' : ''}
                                    value={this.state.isReceive}
                                    onChange={this.changeReceiveState}
                                />
                                <DevTestCommand
                                    onSelect={this.selectCommand}
                                    activeKey={this.state.activeKey}
                                />
                            </div>
                        </DevTestHeader>
                        <div style={{ display: this.state.activeKey == 1 ? 'block' : 'none' }}>
                            <DataDebuggingPage _state={this.props} openDialog={this.handleCancel.bind(this,1)} />
                        </div>
                        <div style={{ display: this.state.activeKey == 2 ? 'block' : 'none' }}>
                            <EquipmentUpgradePage 
                                _state={this.props} 
                                productBaseInfo={productBaseInfo} 
                                hardwareType={hardwareType} 
                                firmwareVersionType={firmwareVersionType} 
                                totalVersion={totalVersion} 
                                mainVersion={mainVersion} 
                                changeFormData={this.changeFormData}
                                macList={deviceDebugMacList.data} 
                            />
                        </div>
                    </div>
                    <Modal className='commandsDebugSytle'
                        title={this.state.command.code+"命令调试"} 
                        visible={this.state.command.active}
                        maskClosable={false} 
                        onCancel={this.onCloseDialog}
                        footer={null}
                    >
                        <CommandsDebugDialog
                            code={this.state.command.code}
                            defaultMac={this.state.command.mac}
                            onConfirm={this.onSendCommand}
                            onCancel={this.onCloseDialog}
                        />
                    </Modal>
                    <textarea id="copyInput" />
                    {
                        visibleExportData &&
                        <Modal title="导出数据" visible={visibleExportData} onCancel={this.handleCancel.bind(this,1)} footer={null} maskClosable={false}>
                            <ExportStagerDataDialog 
                                macList={deviceDebugMacList.data} 
                                productId={pid} 
                                selectedMac={selectedMac} 
                                date={date} 
                                onCancel={this.handleCancel.bind(this,1)} 
                                changeFormData={this.changeFormData}
                                /> 
                        </Modal>
                    }
                </div>
                    <DebuggingInfoDialog visibleFun={this.visible} pid={pid} authorityType={this.props.productBaseInfo.authorityType} visible={visible} deviceDebugAccountList={deviceDebugAccountList} deviceDebugMacList={deviceDebugMacList} />
            </div>
        );
    }
}
