import React from 'react';
import FlowChart from '../../flow-chart/FlowChart';
import DescWrapper from '../../desc-wrapper/DescWrapper';

import './ServiceGuide.scss';

const appGuideLists = {
    app : [
        {
            title: '配置产品帮助',
            desc: '您可以给您的产品添加APP控制页面，以便于您的用户可以通过APP对产品进行操作控制；'
        },
        {
            title: '创建H5页面',
            desc: '通过在线自助工具或自主开发的方式创建产品H5页面。'
        },
        {
            title: '调试验证',
            desc: '通过调试工具验证H5页面面的控制功能和状态显示是否正常。'
        },
        {
            title: '发布H5页面',
            desc: '发布H5页面到具体的APP上，APP可以绑定并进入H5页面控制产品。'
        }
    ],
    cloud : [
        {
            title: '创建定时功能',
            desc: '配置该产品的需要支持哪些定时功能，关联控制协议数据。'
        },
        {
            title: '发布功能',
            desc: '验证无误的功能可以发布，发布后在APP上可以查看到这些功能。'
        },
        {
            title: 'APP配置定时任务',
            desc: '使用C家或其他APP时，可以创建定时任务，配置任务的触发时间。'
        },
        {
            title: '满足条件自动控制',
            desc: '定时任务同步到云端，满足触发条件后，自动发送控制指令控制设备。'
        }
    ],
    scene : [
        {
            title: '自动化配置',
            desc: '配置产品可支持的自动化条件和动作，供用户和场景专家配置智能场景。'
        },
        {
            title: '寄送样品 ',
            desc: '寄送设备供C-Life验证，以保证联动的质量与体验。'
        },
        {
            title: '全链路验证',
            desc: '模拟真实使用场景，从端到端进行全链路，全功能的验证。'
        },
        {
            title: '开通设备联动服务',
            desc: '开通实现设备联动控制功能。'
        }
    ]
}

const titles = {
    app : '您可以给产品设计在APP上使用的H5控制页面，用户可以通过APP上的控制页面对产品进行远程控制。您可以发布到您独有的APP，也可以发布到C-Life的官方APP-C家。',
    cloud : '通过云端定时服务，您的用户可以在APP上设置定时任务，对该产品进行定时控制和操作。云端定时的时间计算不依赖设备，由C-Life云端完成。',
    scene : '完成自动化联动配置是产品开通智能设备联动服务的前置条件，目的是配置产品可支持的自动化条件和动作，供用户配置智能场景。',
}

const tips = {
    app : 'APP控制服务是可选的，您可以根据实际需求使用服务。如果您发布H5页面到自己创建的APP上，您可以通过APP或C家扫码体验页面效果。如果您希望发布H5页面到C家APP，平台将进行审查，确保C家的用户体验。',
    cloud : '云端定时服务是可选的，您可以根据实际需求使用服务。',
    scene : '设备联动服务是可选的，您可以根据实际需求使用服务。'
}

const btns = {
    app : '启用服务并进入APP控制配置',
    cloud : '启用服务并进入云端定时配置',
    scene : '启用服务并进入场景功能配置',
}

function ServiceGuide({type = 'app',clickHander = null}) {
    return (
        <section className="app-guide-wrapper section-bg">
            <p>{titles[type]}</p>
            <DescWrapper desc={['温馨提示:',tips[type]]}></DescWrapper>
            <div className="use-flow-wrapper">
                <FlowChart flowLists={appGuideLists[type]}></FlowChart>
            </div>
        </section>
    )
}

export default React.memo(ServiceGuide)
