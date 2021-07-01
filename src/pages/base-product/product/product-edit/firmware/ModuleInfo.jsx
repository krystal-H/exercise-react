import React from 'react';
import { Button, Input, Icon, Modal,Tooltip } from 'antd';
import { connect } from 'react-redux';
import * as actions from '../../store/ActionCreator';
import {post, Paths} from '../../../../../api';
import defaultIocn from '../../../../../assets/images/defaultIocn.png';
import DebuggingInfoDialog from '../../deviceDebugging/deviceDebuggerTest/DebuggingInfoDialog';
import LabelTip from '../../../../../components/form-com/LabelTip';
import { withRouter } from 'react-router-dom';
import {
    updateDeviceDebugAccountListAction,//更新账号列表
    updateDeviceDebugMacListAction,//更新mac列表
} from '../../store/ActionCreator_debug.js';

class ModuleInfo extends React.Component{
    state = {
        visible: false,
        visibleDebugger: false,
    }

    // 下载SDK
    download = () => {
        const { hardwareType, moduleItem, productBaseInfo,mcuCodeCheck } = this.props;
        const { libraryFile } = moduleItem;
        const { productId } = productBaseInfo;

        if(hardwareType === 0){
            if (mcuCodeCheck) {
                let urls = window.location.origin+'/v1/web/open/protoManage/mcuCodeExport?productId='+productId+'&checkProductId='+productId;
                window.open(urls);
            }

        }else{
            window.open(libraryFile);
        }
    }



    // 下载固件程序
    downloadFile = () => {
        const { hardwareType, moduleItem } = this.props;
        const { burnFile, sourceCode } = moduleItem;
        let url = hardwareType === 1 ? sourceCode : burnFile;
        window.open(url);
    }

    // 打开调试窗口
    triggerDebugger = (type) => {
        const { productBaseInfo } = this.props;
        const { productId } = productBaseInfo;
        if(type === 1){
            this.setState({
                visibleDebugger: true
            }, () => {
                post(Paths.deviceDebugAccountGetList,{productId}, {loading: true}).then((model) => {
                    if(model.code === 0){
                        post(Paths.debugSecretList,{productId}, {loading: true}).then((res) => {
                            if(res.code === 0){
                                this.props.updateDeviceDebugAccountList(model);
                                this.props.updateDeviceDebugMacList(res);
                                // 暂时不知道state中存的deviceDebugMacList有什么用
                                this.setState({
                                    deviceDebugMacList:res,
                                    deviceDebugAccountList:model
                                });
                            }
                        });
                    }
                });
            })
            
        }else{
            this.setState({visibleDebugger:!this.state.visibleDebugger});
        }
    }

    // 跳转调试工具
    handleDebugger = () => {
        const { hardwareType, productBaseInfo } = this.props;
        const { productId } = productBaseInfo;
        this.props.history.push(`/open/base/product/deviceDebugging?productId=${productId}&hardwareType=${hardwareType}`)
    }

    // 打开电路图
    triggerVisible = () => {
        const visible = this.state.visible;
        this.setState({
            visible: !visible
        });
    }

    // 上报频率修改
    handleCommFreq = (e) => {
        let val = e.target.value;
        if(val !== ''){
            val = parseInt(val.replace(/[^\d]/g, ''), 10);
            val = val < 1 ? 1 : val;
            val = val > 15 ? 15 : val;
            this.props.modifyCommFreq(val);
        }
        this.props.changeEditStatus(true)
        this.props.modifyCommFreq(val);
    }

    // 上报频率
    handleBlur = (e) => {
        const { value } = e.target;
        console.log(value);
        if(value === ''){
            this.props.modifyCommFreq(10);
        }
    }

    render(){
        const {hetModuleTypeName,
            modulePicture,
            applyScope,
            originalModuleTypeName,
            sizeWidth,
            sizeHeight,
            sizeThickness,
            bindTypeName,
            netTypeName,
            supportFileTransfer,
            communicateSpeed,
            referenceCircuitDiagram, 
            referenceCircuitDiagramName, 
            burnFileVersion, 
            burnFile,
            libraryFileVersion,
            burnFileName,
            sourceCode,
            sourceCodeName,
            sourceCodeVersion,
            readmePdf,
            libraryFile
        } = this.props.moduleItem;
        const { hardwareType, productBaseInfo,  deviceDebugAccountList, deviceDebugMacList, commFreq,mcuCodeCheck } = this.props;
        const { authorityType, productId } = productBaseInfo;
        const { visible, visibleDebugger } = this.state;

        return (
            <div className="module-content">
                    <div className="module-communicate">
                        <h3>通信模组</h3>
                        <div className="module-communicate-content">
                            <p>
                                <span className="module-name">{`已选模组：${hetModuleTypeName}`}</span>
                                <Button type="normal" className="btn-change" onClick={this.props.changeModule}>更改模组</Button>
                            </p>
                            <div className="module-communicate-detail">
                                <img src={modulePicture || defaultIocn} alt="" className="module-img"/>
                                <div className="module-detail-item">
                                    <p><span>芯片：</span><span>{originalModuleTypeName}</span></p>
                                    <p><span>尺寸：</span><span>{`${sizeHeight}×${sizeWidth}×${sizeThickness}mm`}</span></p>
                                    <p><span>适用：</span><span>{applyScope}</span></p>
                                    <a href={readmePdf} target="_blank">模板详情&gt;&gt;</a>
                                </div>
                                <ul className="module-detail-item">
                                    <li><p>{`• 支持${bindTypeName || '--'}通信技术`}</p></li>
                                    <li><p>{`• 支持${netTypeName || '--'}配网方式`}</p></li>
                                    {
                                        supportFileTransfer ? <li><p>{`• 支持文件传输`}</p></li> : null
                                    }
                                    <li><p>{`• 通信通讯速率为${communicateSpeed || '--'}bps`}</p></li>
                                </ul>
                                <div className="curcuit">
                                    <img src={referenceCircuitDiagram || defaultIocn} alt="" className="curcuit-img" onClick={referenceCircuitDiagram ? this.triggerVisible : null}/>
                                    <p>{referenceCircuitDiagramName || "电路图缺失"}</p>
                                </div>
                            </div>
                            <p className="report-frequency">
                                <span>数据上报频率<LabelTip tip="设备主动上报数据的时间间隔"></LabelTip>：</span>
                                <Input value={commFreq} 
                                       onChange={this.handleCommFreq} 
                                       type={"number"} 
                                       onBlur={this.handleBlur}/>
                                <span style={{marginLeft:'12px'}}>秒</span>
                            </p>
                            {
                                hardwareType === 0 ? 
                                <p className="tip">{burnFile ? '您选择的模组有通用固件程序，您可以下载固件程序自行烧录。' : '您选择的模组暂无通用固件程序，请自行开发模组固件。'}</p>
                                :
                                <p className="tip">{sourceCode ? '您选择的模组有通用的模组源码，您可以下载模组源码。' : '您选择的模组暂无模组源码，请自行开发模组源码。'}</p>
                            }
                            {
                                ((hardwareType === 0 && burnFile) || (hardwareType === 1 && sourceCode)) &&
                                <div className="firmware">
                                    <p>
                                        <span>{hardwareType === 0 ? '固件程序：' : '模组源码：'}</span>
                                        <span>{hardwareType === 0 ? burnFileName : sourceCodeName}</span>
                                    </p>
                                    <p>
                                        <span>{hardwareType === 0 ?'固件版本：' : '源码版本：'}</span>
                                        <span>{hardwareType === 0 ? burnFileVersion : sourceCodeVersion}</span>
                                    </p>
                                    <div>
                                        <Button onClick={this.downloadFile}>{hardwareType === 0 ? '下载固件程序' : '下载模组源码'}</Button>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="module-embed">
                        <h3>嵌入式程序</h3>
                        <div className="module-embed-content">
                            <div className="module-embed-item">
                                <h4>{hardwareType ===0 ? 'MCU开发' : '模组开发'}</h4>
                                <p>{`根据您产品的基本信息和功能定义生成对应的${ hardwareType === 0 ? 'MCU' : '模组' }代码。若您的产品信息和功能定义发生变化，请重新生成SDK。`}</p>
                                {
                                    (hardwareType ===0 ? mcuCodeCheck : !!libraryFile) ? 
                                    <Button type="normal" onClick={this.download}>
                                        { hardwareType === 0 ? '生成并下载MCU SDK' : '生成并下载模组库文件'}
                                    </Button> :
                                    <div className='tip-wrapper-center'>
                                        <Tooltip title={hardwareType === 0 ? '该模组暂无 MCU SDK，请自行开发':'该模组暂无库文件，请自行开发'}>
                                            <Button type="normal" disabled={true}>
                                                { hardwareType === 0 ? '生成并下载MCU SDK' : '生成并下载模组库文件'}
                                            </Button>
                                        </Tooltip>
                                    </div>                                    
                                }

                                {
                                    (hardwareType ===0 ? (mcuCodeCheck && burnFileVersion) : (!!libraryFile && libraryFileVersion)) &&
                                    <p><span>版本：{hardwareType === 0 ? burnFileVersion : libraryFileVersion}</span></p>
                                }
                                {/* <span className="link">使用指南</span> */}
                            </div>
                            <Icon type="arrow-right" className="icon-right"/>
                            <div className="module-embed-item">
                                <h4>功能测试</h4>
                                <p>将模组与PCB链接后,可通过C-Life平台提供的在线调试工具,对MCU进行功能点详细测试。</p>
                                <Button type="normal" onClick={this.triggerDebugger.bind(this, 1)}>调试信息配置</Button>
                                <Button type="normal" onClick={this.handleDebugger}>进入调试工具</Button>
                                {/* <p><span className="link center">调试工具使用帮助</span></p> */}
                            </div>
                            <Icon type="arrow-right" className="icon-right"/>
                            <div className="module-embed-item">
                                <h4>{hardwareType === 0 ? 'MCU开发' : '模组开发'}</h4>
                                <p>您可以下载C家APP，将设备进行联网测试，从使用用户角度进行全链路全场景验证。</p>
                                <img src={require('../../../../../assets/images/c_app.png')} alt="扫码下载C家APP" /> 
                                <p className="download-tip">扫码下载C家APP</p>
                                {/*<p><span className="link center">调试工具使用帮助</span></p>*/}
                            </div>
                        </div>
                    </div>
                    <DebuggingInfoDialog authorityType={authorityType} visibleFun={this.triggerDebugger.bind(this,0)}
                         pid={productId} visible={visibleDebugger} deviceDebugAccountList={deviceDebugAccountList} deviceDebugMacList={deviceDebugMacList} />
                    <Modal visible={visible} footer={null} onCancel={this.triggerVisible}  maskClosable={false}>
                        <img alt="example" style={{ width: '100%',backgroundColor:'#e9e9e9'}} src={referenceCircuitDiagram || defaultIocn} />
                    </Modal>
                </div>
        )
    }
}

const mapStateToProps = (state) => ({
    moduleItem: state.getIn(['product', 'moduleItem']).toJS(),
    hardwareType: state.getIn(['product', 'hardwareType']),
    productBaseInfo: state.getIn(['product', 'productBaseInfo']).toJS(),
    deviceDebugAccountList: state.getIn(['deviceDebug','deviceDebugAccountList']).toJS(),
    deviceDebugMacList: state.getIn(['deviceDebug','deviceDebugMacList']).toJS(), 
    commFreq: state.getIn(['product', 'commFreq']),
    mcuCodeCheck: state.getIn(['product','mcuCodeCheck'])
});

const mapDispatchToProps = (dispatch) => ({
    changeModule: () => dispatch(actions.changeModule()),
    updateDeviceDebugAccountList: (data)=>dispatch(updateDeviceDebugAccountListAction(data)),
    updateDeviceDebugMacList: (data)=>dispatch(updateDeviceDebugMacListAction(data)),
    modifyCommFreq: (num) => dispatch(actions.modifyCommFreq(num))
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ModuleInfo));