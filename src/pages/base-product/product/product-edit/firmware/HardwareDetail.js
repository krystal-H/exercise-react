import React from 'react';
import { Button, Select } from 'antd';
import * as actions from '../../store/ActionCreator';
import { connect } from 'react-redux';
import ModuleSelect from './ModuleSelect';
import ModuleInfo from './ModuleInfo';


class HardwareDetail extends React.Component{

    render(){
        const { moduleItem, hardwareType } = this.props;
        // console.log(99999,this.props);

        return (
            <div className="hardware-detail">
                <div className="hardware-type-card">
                    <p>
                        <span className="hardware-type-name">{hardwareType === 1 ? 'SoC方案' : '独立MCU方案'}</span>
                        <Button type="normal" className="hardware-type-change" onClick={this.props.switchTab.bind(this, 1)}>{'更改方案'}</Button>
                    </p>
                    <p><span className="label">概述：</span>
                        {
                            hardwareType === 1 ?  
                            <span>{`SoC方案节省一颗MCU芯片，利用模组内部资源完成传感器操作和产品逻辑。`}</span>
                            :
                            <span>{`通信模组负责与云端信息的交互，通过串口与主控板（即MCU）进行通信，需要在MCU上进行协议解析与外设控制的开发。`}</span>
                        }
                        
                    </p>
                    <p><span className="label">特点：</span>
                        {
                            hardwareType === 1 ?
                            <span>{`成本较低，但系统资源有限`}</span>
                            :
                            <span>{`独立MCU能提供更丰富的系统资源`}</span>
                        }
                    </p>
                    <p><span className="label">适合：</span>
                        {
                            hardwareType === 1 ?
                            <span>{`功能简单的硬件设备`}</span>
                            :
                            <span>{`复杂的智能硬件设备`}</span>
                        }
                    </p>
                </div>
                {
                   moduleItem && moduleItem.moduleId ? <ModuleInfo changeEditStatus={this.props.changeEditStatus}/> : <ModuleSelect />
                }
            </div>
        )
    }
}

export const mapStateToProps = (state) => ({
    productBaseInfo: state.getIn(['product', 'productBaseInfo']).toJS(),
    moduleItem: state.getIn(['product', 'moduleItem']).toJS(),
    hardwareType: state.getIn(['product', 'hardwareType']),

});

export const mapDispatchToProps = (dispatch) => ({
    switchTab: (tabIndex) => dispatch(actions.switchTab(tabIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HardwareDetail);