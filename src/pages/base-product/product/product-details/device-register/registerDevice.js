import React, { useRef } from 'react';
import { Button, Row, Col, Modal } from 'antd';
import { UploadFileHooks } from "../../../../../components/upload-file";
import { Notification } from '../../../../../components/Notification';

export default function DeviceRegister({ showDialog, registerImport, productBaseInfo, registerDialog }) {

    const uploadRef = useRef(); // {current:''}

    const handleCancel = (type) => {
        showDialog(type);
    };

    const handleRegisterImport = () => {
        let url = uploadRef.current.getFileListUrl()[0];
        if (!url) {
            Notification({
                description:`请选择文件`,
            });
            return false;
        }
        registerImport(url);
    }

    const _getTips = () => {
        let { accessModeId } = productBaseInfo;
        // 接入方式（0-设备直连接入,1-云对云接入）
        let tipsHTML = '';
        if (accessModeId === 0) {
            tipsHTML = (
                <div className="tips">
                    <div>您已选择“初级认证”安全机制； </div>
                    <div>可选择“指定数据生成”机制，从本地导入数据，例如设备的物理地址、SN号、序列号、MAC列表；<a href="http://skintest.hetyj.com/31438/6b0b20891e06ac31d0eed37a5083cca9.xlsx">导入模版</a></div>
                    <div>平台将生成12位的设备ID，总量最多生成2万条数据；</div>
                </div>
            )
        } else {
            tipsHTML = (
                <div className="tips">
                    <div>您的产品选择了云对云接入，需要从本地导入数据，例如设备的物理地址、SN号、序列号、MAC列表。<a
                        href="http://skintest.hetyj.com/31438/6b0b20891e06ac31d0eed37a5083cca9.xlsx">导入模版</a></div>
                    <div> 平台将根据设备物理地址生成12位设备ID， 本次最多可以注册2万台设备。</div>
                </div>
            )
        }
        return tipsHTML;
    }
    return (
        <Modal
            width="50%"
            visible={registerDialog}
            centered={true}
            title={'注册设备'}
            className="register-device-modal"
            onCancel={() => handleCancel('registerDialog')}
            maskClosable={false}
            footer={[
                <Button key="submit" type="primary"
                        onClick={handleRegisterImport}
                >
                    确认
                </Button>,
                <Button key="cancel"
                        onClick={() => handleCancel('registerDialog')}
                >
                    取消
                </Button>
            ]}
        >
            <div className="register-device-form-wrapper">
                {_getTips()}
                <div className="register-file">
                    <Row gutter={8} align="middle">
                        <Col span={3}><span className="address">地址附件：</span></Col>
                        <Col span={21}>
                            <UploadFileHooks
                                ref={uploadRef}
                                maxSize={10}
                                format='.xls,.xlsx'
                                isNotImg={true}
                            />
                        </Col>
                    </Row>
                </div>
            </div>
        </Modal>
    );
}
