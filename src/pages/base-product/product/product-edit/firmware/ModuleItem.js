import React, {useState} from "react";
import { Button, Modal } from "antd";
import { connect } from 'react-redux';
import * as actions from '../../store/ActionCreator';
import defaultIocn from '../../../../../assets/images/defaultIocn.png';

const ModuleItem = ({moduleItem, ...props}) => {
    const { hetModuleTypeName,
        modulePicture,
        applyScope,
        originalModuleTypeName,
        sizeWidth,
        sizeHeight,
        sizeThickness,
        readmePdf,
        bindTypeName,
        netTypeName,
        supportFileTransfer,
        communicateSpeed,
        referenceCircuitDiagram } = moduleItem;
    const [visible, setVisible] = useState(false);

    const _setModuleItem = (moduleItem) => {
        props.setModuleItem(moduleItem)
        props.saveModule({
            moduleId:moduleItem.moduleId,
            commFreq:10
        })
    }

    return (
        <div className="module-slider">
            <div className="slider-head">
                <img src={modulePicture || defaultIocn} alt="" />
                <p>{hetModuleTypeName}</p>
            </div>
            <div className="module-info">
                <p>
                    <span>芯片：</span>
                    <span>{originalModuleTypeName}</span>
                </p>
                <p>
                    <span>尺寸：</span>
                    <span>{`${sizeHeight}x${sizeWidth}x${sizeThickness}mm`}</span>
                </p>
                <p>
                    <span>适用：</span>
                    <span>{applyScope}</span>
                </p>
            </div>
            <ul className="surport">
                <li>{`• 支持${bindTypeName || '--'}通信技术`}</li>
                <li>{`• 支持${netTypeName || '--'}配网方式`}</li>
                {
                    supportFileTransfer ? <li>{`• 支持文件传输`}</li> : null
                }
                <li>{`• 通信通讯速率为${communicateSpeed || '--'}bps`}</li>
            </ul>
            <p className="module-action">
                <span className={!referenceCircuitDiagram ? 'no-source' : ''} onClick={referenceCircuitDiagram ? () => setVisible(true) : null}>查看电路图</span>
                <a href={readmePdf || null} className={!readmePdf ? 'no-source' : ''} target="_blank">模组详情</a>
            </p>
            <Button className="btn-use" onClick={() => _setModuleItem(moduleItem)}>使用该模组</Button>

            <Modal visible={visible} footer={null} onCancel={() => setVisible(false)}>
                <img alt="example" style={{ width: '100%',backgroundColor:'#e9e9e9'}} src={referenceCircuitDiagram} />
            </Modal>
        </div>
    );
};

const mapDispatchToProps = (dispatch) => ({
    setModuleItem: (moduleItem) => dispatch(actions.setModuleItem(moduleItem)),
    saveModule: (params) => dispatch(actions.saveModule(params)),
});

export default connect(null, mapDispatchToProps)(ModuleItem)