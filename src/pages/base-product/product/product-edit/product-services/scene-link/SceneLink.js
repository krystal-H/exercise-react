import React from 'react';
import { connect} from 'react-redux';
import {getConfigSteps,getProtocolLists} from '../../../store/ActionCreator';
import ServiceGuide from '../../../../../../components/product-components/service-guide/ServiceGuide';
import './SceneLink.scss';
import { post,Paths } from '../../../../../../api';
import { parseConfigSteps } from '../../../../../../util/util';
import PageTitle from '../../../../../../components/page-title/PageTitle';
import SceneManage from './scene-manage/SceneManage';

const mapStateToProps = state => {    
    return {
        productBaseInfo: state.getIn(['product','productBaseInfo']).toJS(),
        productConfigSteps: state.getIn(['product','productConfigSteps']).toJS(),
        productProtocolLists: state.getIn(['product','productProtocolLists']).toJS(),
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getConfigSteps: id => dispatch(getConfigSteps(id)), // 获取产品页面步骤配置
        getProtocolLists: id => dispatch(getProtocolLists(id)) // 获取产品页面步骤配置
    }
}

@connect(mapStateToProps,mapDispatchToProps)
export default class SceneLink extends React.Component {
    constructor(props) {
        super(props)
        this.getProductStepsAndProtocols()
    }
    getProductStepsAndProtocols(){
        let {productId,getConfigSteps,getProtocolLists} = this.props;

        if (productId) {
            getConfigSteps(productId);
            getProtocolLists(productId);
        }
    }
    componentDidUpdate(prevProps, prevState){
        let {productId} = this.props;
        if(prevProps.productId !== productId) {
            this.getProductStepsAndProtocols()
        }
    }
    getConfigSteps = () => {
        let {productConfigSteps} = this.props,
            configs = parseConfigSteps(productConfigSteps,3);

        if (configs) {
            this.configs = configs;
        }
        return configs;
    }
    componentDidMount() {

        setTimeout( () => {
            if (!this.getConfigSteps()){
                this.enableScene()
            }
        },10 * 1000)
    }
    enableScene = () => {
        let {productId,getConfigSteps} = this.props,
            oldConfigInfo = {},
            _data = {
                productId,
                type:3
            };

        if (this.configs) {
            oldConfigInfo = this.configs.configInfo;
            _data.stepId = this.configs.stepId;
        }

        _data.configInfo = JSON.stringify({
            ...oldConfigInfo,
            enableScene:true
        })

        post(Paths.saveConfigSteps,_data).then(
            res => getConfigSteps(productId)
        )
    }
    goBackServiceSelect  = () => {
        let {history}  = this.props;
        history.goBack();
    }
    getConfigSteps = () => {
        let {productConfigSteps} = this.props,
            configs = parseConfigSteps(productConfigSteps,3);
        if (configs) {
            this.configs = configs;
        }
        return configs;
    }
    render() {
        let {noNeedTitle,productProtocolLists,productId,canOperate} = this.props,
            configs = this.getConfigSteps(),
            isShowSceneManage = configs && configs.configInfo &&  configs.configInfo.enableScene;
            
        return (
            <div className="app-control">
                {
                    !noNeedTitle &&
                    <PageTitle backHandle={this.goBackServiceSelect} title="场景联动配置"></PageTitle>
                }
                {/* {
                    !isShowSceneManage &&
                    <ServiceGuide canOperate={canOperate} type="scene" clickHander={this.enableScene}></ServiceGuide>
                } */}
                {/* {
                    isShowSceneManage &&  */}
                    <SceneManage canOperate={canOperate}  productId={productId} productProtocolLists={productProtocolLists}></SceneManage>
                {/* } */}
            </div>
        )
    }
}
