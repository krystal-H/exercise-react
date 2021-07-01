
import React, { useState } from "react";
import { Input,Row,Col,Modal } from "antd";
import DoubleBtns from '@src/components/double-btns/DoubleBtns';
import { DateTool } from "../../../../util/util";
import { get,Paths } from "../../../../api";
import { Notification } from '../../../../components/Notification';

export default props=>{
    const {warningInof,closeDetailMod,delwithWarn} = props;
    const {alarmTime,warningTitle,state,warningWay,ruleName,warningDetail,deviceIds,dealDetail,id} = warningInof;

    const [textval, setTextval] = useState("");
    const [_deviceIds, set_deviceIds] = useState("");
    
    const _delwithWarn = ()=>{
        if(textval){
            delwithWarn({id,dealDetail:textval})
        }else{
            Notification({
                description: "请填写处理记录",
                type:'warn'
            });
        }
    }
    const refresh = ()=>{
        get(Paths.getWarningInfo, {warningId:id}, { loading: true }).then(res => {
            set_deviceIds(res.data.deviceIds);
        });
    }
    let footerdom = state==1 && 
    <DoubleBtns style={{"padding":"0"}} preText="取消" nextText="提交"
            preHandle={closeDetailMod}
            nextHandle={_delwithWarn}
    /> ||  <DoubleBtns style={{"padding":"0"}} nextBtn={false} preText="关闭" preHandle={closeDetailMod} />;
    
    const gutterspace = [12,24];
    return <Modal
            className="warningdetail-page"
            title={warningTitle}
            visible={!!warningTitle}
            width={700}
            onCancel={closeDetailMod}
            footer={footerdom}
        >
            <Row gutter={gutterspace}>
                <Col span={5} className="detail-label">告警时间：</Col>
                <Col span={18}>
                    {DateTool.utcToDev(alarmTime) ||"--"}
                </Col>
            </Row>
            <Row gutter={gutterspace}>
                <Col span={5} className="detail-label">告警消息类型：</Col>
                <Col span={18}>
                    {{"0":"站内","1": "站内+邮件"}[warningWay]}
                </Col>
            </Row>
            <Row gutter={gutterspace}>
                <Col span={5} className="detail-label">关联的告警规则：</Col>
                <Col span={18}>
                    {ruleName||"--"}
                </Col>
            </Row>
            <Row gutter={gutterspace}>
                <Col span={5} className="detail-label">告警内容：</Col>
                <Col span={18}>
                   <div className="border-texarea">{warningDetail||"--"}</div>
                </Col>
            </Row>
            <Row gutter={gutterspace}>
                <Col span={5} className="detail-label">告警设备ID：</Col>
                <Col span={16}>
                    <div className="border-texarea">{_deviceIds || deviceIds || ""}</div>
                </Col>
                <Col span={2} >
                    <a href="javascript:" onClick={refresh} >刷新</a>
                </Col>
            </Row>
            <Row gutter={gutterspace}>
                <Col span={5} className="detail-label">处理记录：</Col>
                <Col span={18}>
                {
                    state==1 && <Input.TextArea 
                        rows={3}
                        value={textval||dealDetail|| ""}
                        placeholder={"处理记录"}
                        onChange={(e)=>{setTextval(e.target.value)}}
                    /> || <div className="border-texarea">{textval||dealDetail|| ""}</div>
                } 
                </Col>
            </Row>
        </Modal>
    
}


