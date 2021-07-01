// 硬件开发-------

import React from "react";
import { Button, Tabs, notification } from "antd";
import { connect } from 'react-redux';
import DoubleBtns from "../../../../../components/double-btns/DoubleBtns";
import HardwareDetail from "./HardwareDetail";
import "./hardware.scss";
import * as actions from '../../store/ActionCreator';
import { get, Paths } from "../../../../../api";
import RouterPrompt from '../../../../../components/router-prompt/router-prompt';

let EDIT_STATUS = false;

class Hardware extends React.Component {
    // state = {
    //     disabled: false
    // }

    // 选择模组方案
    handleChose = (index) => {
        const { productId } = this.props.productBaseInfo;
        this.props.getModuleList({productId, hardwareType: index});
        this.props.switchTab(2);
    }

    // 点击下一步
    handleSave = () => {

        const { moduleItem } = this.props;
        if(moduleItem.moduleId){
            this.props.saveModule().then(res => {
                if(res){
                    EDIT_STATUS = false;
                    this.forceUpdate( () => {
                        this.props.history.push('./service/serviceselect');
                    })
                }
            });
        }else{
            this.props.history.push('./service/serviceselect');
        }
    }

    getModuleList({productId, hardwareType, commFreq, moduleId}){

        if(hardwareType === null) {
            hardwareType = 0;
        }

        this.props.getModuleList({productId, hardwareType}).then(res => {
            const list = res.reduce((x, y) => x.concat(y.moduleList), []);

            if(res){
                let module = list.find(item => item.moduleId === moduleId);
                if(!module){
                    get(Paths.getModuleInfo,{
                        productId,
                        moduleId
                    },{
                        loading:true
                    }).then(data => {
                        if (data.data) {
                            this.setState({
                                // disabled: false
                            }, () => {
                                this.props.switchTab(2);
                                this.props.setModuleItem(data.data);
                                this.props.setHardwareType(0);
                                this.props.modifyCommFreq(commFreq);
                            })
                        }
                    }).catch( error => {
                        this.props.switchTab(1);
                        this.props.setModuleItem({});
                        this.props.setHardwareType(null);
                        this.props.modifyCommFreq(10);
                    })
                    // notification.error({
                    //     message: "3.0模组匹配4.0模组未成功，请选完善4.0模组！",
                    //     duration: 3,
                    // })
                    // this.setState({
                    //     disabled: true
                    // })
                }else{
                    this.setState({
                        // disabled: false
                    }, () => {
                        this.props.switchTab(2);
                        this.props.setModuleItem(module);
                        this.props.setHardwareType(hardwareType);
                        this.props.modifyCommFreq(commFreq);
                    })
                }
            }
        })
    }

    componentWillUpdate(nextProps){
        const {moduleId, hardwareType, commFreq, productId} = nextProps.productBaseInfo;
        // 如果有moduleId获取模组信息
        if( productId && moduleId && (this.props.productBaseInfo.moduleId !== moduleId)){
            this.getModuleList({productId, moduleId, hardwareType, commFreq})
        }
    }

    componentWillUnmount(){
        // 离开时删除模组数据
        this.changeEditStatus(false)
        const { moduleItem } = this.props;
        if(!moduleItem.moduleId){
            this.props.switchTab(1);
            this.props.clearModuleList();
            this.props.setHardwareType(null);
            this.props.setMcuCodeCheck(false);
        }
    }

    changeEditStatus = bl => {
        EDIT_STATUS = bl
    }

    componentDidMount(){
        const {moduleId, hardwareType, commFreq} = this.props.productBaseInfo;
        const productId = this.props.match.params.id;
        if(productId && moduleId){
            this.getModuleList({productId, moduleId, hardwareType, commFreq})
        }else{
            this.props.switchTab(1);
            this.props.setModuleItem({});
            this.props.setHardwareType(null);
            this.props.modifyCommFreq(10);
        }
        this.props.getMcuCodeCheck(productId);
    }

    render() {
        const { tabIndex } = this.props;
        console.log(this.props, 'props11111')
        // const { disabled } = this.state;
        return (
            <div className="hardware">
                <RouterPrompt promptBoolean={EDIT_STATUS}></RouterPrompt>
                <div className="hardware-wrap">
                    <div className="title">
                        <h3>标准功能定义</h3>
                        <span className="descript">
                            如果您是从0开始构建产品，您需要解决硬件的程序开发。C-Life平台提供了很多工具帮助您更快的开发硬件。如果您的产品无需硬件开发，可直接跳过该环节。
                        </span>
                    </div>

                    <Tabs activeKey={`tab${tabIndex}`}>
                        {/* 硬件开发方案 */}
                        <Tabs.TabPane tab="tab1" key="tab1">
                            <div className="hardware-centent">
                                <div className="projectImg">
                                    <div
                                        className="img_1"
                                        style={{ backgroundSize: "contain" }}
                                    ></div>
                                    <p>
                                        <span>概述：</span>
                                        <span>
                                            通信模组负责与云端信息的交互，通过串口与主控板（即MCU）进行通信，需要在MCU上进行协议解析与外设控制的开发。
                                        </span>
                                    </p>
                                    <p>
                                        <span>特点：</span>
                                        <span>
                                            独立MCU能提供更丰富的系统资源
                                        </span>
                                    </p>
                                    <p>
                                        <span>适合：</span>
                                        <span>复杂的智能硬件设备</span>
                                    </p>
                                    {/* <Button className="btn-use" disabled={disabled} onClick={this.handleChose.bind(this, 0)}> */}
                                    <Button className="btn-use" onClick={this.handleChose.bind(this, 0)}>
                                        使用独立MCU方案
                                    </Button>
                                </div>
                                <div className="projectImg">
                                    <div
                                        className="img_2"
                                        style={{ backgroundSize: "contain" }}
                                    ></div>
                                    <p>
                                        <span>概述：</span>
                                        <span>
                                        SoC方案节省一颗MCU芯片，利用模组内部资源完成传感器操作和产品逻辑。
                                        </span>
                                    </p>
                                    <p>
                                        <span>特点：</span>
                                        <span>成本较低，但系统资源有限</span>
                                    </p>
                                    <p>
                                        <span>适合：</span>
                                        <span>功能简单的硬件设备</span>
                                    </p>
                                    {/* <Button className="btn-use" disabled={disabled} onClick={this.handleChose.bind(this, 1)}> */}
                                    <Button className="btn-use"  onClick={this.handleChose.bind(this, 1)}>
                                        使用独立SoC方案
                                    </Button>
                                </div>
                            </div>
                        </Tabs.TabPane>
                        {/* 详情 */}
                        <Tabs.TabPane tab="tab2" key="tab2">
                            <div className="centent">
                                <HardwareDetail changeEditStatus={this.changeEditStatus}/>
                            </div>
                        </Tabs.TabPane>
                    </Tabs>
                </div>
                <div className="com-footer">
                    <DoubleBtns
                        preBtn={true}
                        preHandle={() => this.props.history.push('./protocols')}
                        nextBtn={true}
                        nextHandle={this.handleSave}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        productBaseInfo: state.getIn(['product','productBaseInfo']).toJS(),
        productConfigSteps: state.getIn(['product','productConfigSteps']).toJS(),
        tabIndex: state.getIn(['product', 'tabIndex']),
        moduleItem: state.getIn(['product', 'moduleItem']).toJS(),
    }
}
const mapDispatchToProps = dispatch => {
    return {
        switchTab: (tabIndex) => dispatch(actions.switchTab(tabIndex)),
        getModuleList: (params) => dispatch(actions.getModuleList(params)),
        saveModule: (params) => dispatch(actions.saveModule(params)),
        setModuleItem: (params) => dispatch(actions.setModuleItem(params)),
        setHardwareType: (num) => dispatch(actions.setHardwareType(num)),
        modifyCommFreq: (num) => dispatch(actions.modifyCommFreq(num)),
        clearModuleList: ()  => dispatch(actions.setModuleList([])),
        getMcuCodeCheck: (id) => dispatch(actions.getMcuCodeCheck(id)),
        setMcuCodeCheck: (bl) => dispatch(actions.updateMcuCodeCheck(bl))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Hardware);
