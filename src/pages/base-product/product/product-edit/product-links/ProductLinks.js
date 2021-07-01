import React from 'react'
import { NavLink } from 'react-router-dom';
import {Icon} from 'antd';
import {cloneDeep} from 'lodash';
// import DescWrapper from '../../../../../components/desc-wrapper/DescWrapper';

import './ProductLinks.scss'

import protocolImg from '../../../../../assets/images/product/product-add-protocol.png';
import firmwareImg from '../../../../../assets/images/product/product-add-firmware.png';
import serviceImg from '../../../../../assets/images/product/product-add-service.png';
import publishImg from '../../../../../assets/images/product/product-add-publish.png';
import infoImg from '../../../../../assets/images/product/product-add-info.png';

const Links = [
    {
        img: infoImg,
        text: '基础信息',
        path: '/open/base/product/edit/:id/info',
        desc: '功能定义是描述硬件产品的功能属性，包含标准功能，自定义功能和云功能。C-Life云基于在智能家电产品领域多年的经验积累，为该品类制定的一套较通用，较全面的功能合集，方便开发者快速创建产品， 请尽量使用标准功能。'
    },
    {
        img: protocolImg,
        text: '功能定义',
        path: '/open/base/product/edit/:id/protocols',
        desc: '功能定义是描述硬件产品的功能属性，包含标准功能，自定义功能和云功能。C-Life云基于在智能家电产品领域多年的经验积累，为该品类制定的一套较通用，较全面的功能合集，方便开发者快速创建产品， 请尽量使用标准功能。'
    },
    {
        img: firmwareImg,
        text: '硬件开发',
        path: '/open/base/product/edit/:id/projectSelect',
        desc: '如果您是从零开始构建产品，您需要解决硬件的程序开发。C- Life平台提供了很多工具帮助您更快的开发硬件。如果您的产品无需硬件开发，可直接跳过该环节。'
    },
    {
        img: serviceImg,
        text: '服务配置',
        path: '/open/base/product/edit/:id/service/serviceselect',
        desc:'C-Life平台为您提供了各方面的拓展服务，为您的产品赋能，提升产品价值和竞争力。所有服务可选择性启用，部分服务需要审核。'
    },
    {
        img: publishImg,
        text: '商业发布',
        path: '/open/base/product/edit/:id/commercialInfo',
        desc:'开发完成的产品经过商业发布才可以正式投入市场，给用户使用。产品发布需要经过平台审核，请您认真填写商业发布信息。'
    }
]



export default function ProtocolLinks({productId = 0}) {
    let hash = window.location.hash,
        _Links = cloneDeep(Links),
        _link = Links.filter(link => {
            let temp = cloneDeep(link);
            // eslint-disable-next-line no-useless-escape
            let reg = new RegExp(temp.path.replace(':id','\\d+'));
            return reg.test(hash);
        }),
        desc = _link[0] && _link[0].desc;


    return (
        <div className="links-and-desc">
            <div className="links-wrapper">
                {
                    _Links.map((item, index) => {
                        let path = item.path.replace(':id',productId);
                        return (
                            <NavLink
                                className="link-item flex-row"
                                key={index}
                                activeClassName="active"
                                to={path}>
                                <img src={item.img} alt="" />
                                <span>
                                    {`${index + 1}.${item.text}`}
                                </span>
                            </NavLink>
                        )
                    })
                }
            </div>
            {/* <DescWrapper
                desc={[desc]}
            ></DescWrapper> */}
        </div>
    )
}
