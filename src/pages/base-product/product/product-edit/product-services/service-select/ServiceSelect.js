import React ,{useState}from 'react';
import { Modal } from 'antd';

import './ServiceSelect.scss';

import controlImg from '../../../../../../assets/images/product/product-service-01.png';
import timeImg from '../../../../../../assets/images/product/product-service-02.png';
import voiceImg from '../../../../../../assets/images/product/product-service-03.png';
import InteractionImg from '../../../../../../assets/images/product/product-service-04-active.png';

import DoubleBtns from '../../../../../../components/double-btns/DoubleBtns';
import AloneSection from '../../../../../../components/alone-section/AloneSection';
import ServiceItem from './ServiceItem';
import ServiceGuide from '../../../../../../components/product-components/service-guide/ServiceGuide';

const Detail_Madal_Width = 1000;

const serviceLists = [
    {
        title: 'APP控制服务',
        type:'app',
        img: controlImg,
        desc: '您可以给您的产品添加APP控制页面，以便于您的用户可以通过APP对产品进行操作控制；',
        control: '进行配置',
        isActive: true,
        path:'/open/base/product/edit/:id/service/appcontrol'
    },
    {
        title: '云端定时服务',
        type:'cloud',
        img: timeImg,
        desc: '您可以订阅产品下配置的所有消息。平台将接收到的消息通过HTTP和终端SDK的消息队列推送；',
        control: '进行配置',
        isActive: true,
        path:'/open/base/product/edit/:id/service/cloudtime'
    },
    {
        title: '设备联动服务',
        type:'scene',
        img: InteractionImg,
        desc: '您可以给产品配置自动化联动的条件动作，以便于您的产品可以加入到场景中，跟其他设备联动控制；',
        control: '进行配置',
        isActive: true,
        path:'/open/base/product/edit/:id/service/scenelink'
    },
    {
        title: '语音服务',
        img: voiceImg,
        desc: '您可以给产品增加语音控制的能力，可以使用clife的语音服务或第三方的语音服务；',
        control: '即将推出',
        isActive: false
    }
]

export default function ServiceSelect({productId,history}) {
    let [detailVisiable,setDetailVisiable] = useState(false),
        [detailType,setDetailType] = useState(null);
    
    const activeItem = serviceLists.filter(item => item.type === detailType)[0];
    
    const goToService = () => {
        if(activeItem) {
            history.push(activeItem.path.replace(':id',productId))
        }
    }

    return (
        <React.Fragment>
            <AloneSection title="请选择服务">
                <section className="product-edit-service-wrapper section-bg">
                    <div className="services-list-area">
                        {
                            serviceLists.map((item, index) => (
                                    <ServiceItem  key={index} 
                                                  itemData={item}
                                                  setDetailType={setDetailType}
                                                  setDetailVisiable={setDetailVisiable} 
                                                  productId={productId}></ServiceItem>
                                )
                            )
                        }
                    </div>
                </section>
            </AloneSection>
            <div className="com-footer">
                <DoubleBtns
                    preHandle={() => history.push({pathname: `/open/base/product/edit/${productId}/projectSelect`})}
                    nextHandle={() => history.push({pathname: `/open/base/product/edit/${productId}/commercialInfo`})}
                    ></DoubleBtns>
            </div>
            {
                detailVisiable && 
                <Modal
                    visible={detailVisiable}
                    width={Detail_Madal_Width}
                    title={activeItem.title}
                    okText="开始配置"
                    className="self-modal"
                    onOk={goToService}
                    cancelText="以后再说"
                    onCancel={() => setDetailVisiable(false)}
                    centered={true}
                    closable={true}
                    maskClosable={false}
                    destroyOnClose
                >
                    <ServiceGuide type={activeItem.type}>

                    </ServiceGuide>
                </Modal>
            }
        </React.Fragment>
    )
}
