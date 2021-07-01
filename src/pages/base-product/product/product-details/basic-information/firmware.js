import React, { Component } from 'react';
import { withRouter } from "react-router"
import { post,Paths } from '../../../../../api';
import defaultIocn from '../../../../../assets/images/defaultIocn.png';
import {Notification} from '../../../../../components/Notification';
import { Tooltip } from 'antd';

import './info.scss';

class FirmWare extends Component {
    constructor(props){
        super(props);
        this.state = {
            publishProductInfo:{
                commerceInfo:{},
                moduleInfo:{},
                productBaseInfo:{},
            }
        }
        this.moduleDetails = this.moduleDetails.bind(this);
        this.download = this.download.bind(this);
        this.getPublishProductInfoFun = this.getPublishProductInfoFun.bind(this);
    }
    getPublishProductInfoFun(){
        post(Paths.getPublishProductInfo,{productId:this.props.productId},{loading:true}).then((model) => {
            if(model.code==0){
                this.setState({publishProductInfo:model.data});
            }
        });
    }
    componentDidMount() {
        if(this.props.productId){
            this.getPublishProductInfoFun();
        }
    }
    componentDidUpdate(prevProps){
        if(this.props.productId&&(prevProps.productId!= this.props.productId)){
            this.getPublishProductInfoFun();
        }
    }
    moduleDetails(url){
        window.open(url);
    }
    download(url){
        if(!url){
            Notification({
                description:'下载地址为空！',
            });
            return false;
        }
        window.location = url;
    }
    render() {
        let {publishProductInfo} = this.state;

        let {
            burnFileName,
            burnFileVersion,
            hetModuleTypeName,
            bindTypeName,
            netTypeName,
            supportFileTransfer,
            communicateSpeed,
            applyScope,
            originalModuleTypeName,
            readmePdf,
            modulePicture,
            burnFile,
            sourceCodeName,
            sourceCodeVersion,
            sourceCode
        } = publishProductInfo.moduleInfo;
        let moduleInfo = publishProductInfo.moduleInfo;
        let sizes = (moduleInfo.sizeHeight||'-'+' * ')+(moduleInfo.sizeThickness||'-'+' * ')+(moduleInfo.sizeWidth||'-');
        let {hardwareType,commFreq} = publishProductInfo.productBaseInfo;

        return (
            <div>
                                    <div className="product_info">
                        <div className='commonContentBox'>
                            <div className='title'>
                                硬件方案
                            </div>
                            <div className='centent'>
                                <h4>独立MCU方案</h4>
                                <p>通信模组负责与云端信息的交互，通过串口与主控板（即MCU）进行通信，需要在MCU上进行协议解析与外设控制的开发。独立MCU方案能提供更丰富的系统资源，适合复杂的智能硬件设备。</p>
                            </div>
                        </div>
                        <div className='commonContentBox'>
                            <div className='title'>通信模组</div>
                            <div className='centent'>
                                <div className='strategy'>
                                    <div className="strategy-content"  >
                                        <img className="strategy-img" src={modulePicture?modulePicture:defaultIocn}></img>
                                        <div className='moduleTypeName'>{hetModuleTypeName}</div>
                                        <div className='moduleDetails'>
                                            <span>芯片：&nbsp;</span>
                                            <span>{originalModuleTypeName?originalModuleTypeName:'--'}</span>
                                        </div>
                                        <div className='moduleDetails'>
                                            <span>尺寸：&nbsp;</span>
                                            {/* 长*宽*厚 */}
                                            <span>{sizes?sizes:'--'}</span>
                                        </div>
                                        <div className='moduleDetails single-text'>
                                            <span>适用：&nbsp;</span>
                                            <Tooltip placement="topLeft" title={applyScope?applyScope:'--'}>
                                                <span>{applyScope?applyScope:'--'}</span>
                                            </Tooltip>
                                        </div>
                                        <div className='moduleLink' onClick={this.moduleDetails.bind(this,readmePdf)}>模组详情</div>
                                    </div>
                                </div>
                                <div className='table'>
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td>支持通信技术</td>
                                                    <td>{bindTypeName?bindTypeName:'--'}</td>   
                                                </tr>
                                                <tr>
                                                    <td>支持配网方式</td>
                                                    <td>{netTypeName?netTypeName:'--'}</td>
                                                </tr>
                                                <tr>
                                                    <td>文件传输能力</td>
                                                    <td>{supportFileTransfer==null?'--':supportFileTransfer==0?'否':'是'}</td>
                                                </tr>
                                                <tr>
                                                    <td>通信通讯速率</td>
                                                    <td>{communicateSpeed?communicateSpeed:'--'}</td>
                                                </tr>
                                                <tr>
                                                    <td>数据上报频率</td>
                                                    <td>{commFreq?commFreq:'--'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className='download'>
                                        <p>您选择的模组有通用固件程序，您可以下载固件程序自行烧录。</p>
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td width='25%'>已选模组：</td>
                                                    <td width='75%'>{hetModuleTypeName}</td>
                                                </tr>
                                                <tr>
                                                    <td width='25%'>固件程序：</td>
                                                    <td width='75%'>{hardwareType==0?burnFileName:sourceCodeName}</td>
                                                    
                                                </tr>
                                                <tr>
                                                    <td width='25%'>固件版本：</td>
                                                    <td width='75%'>{hardwareType==0?burnFileVersion:sourceCodeVersion}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className='commonButBox'>
                                            <div className='commonButs' onClick={this.download.bind(this,hardwareType==0?burnFile:sourceCode)} >
                                                {hardwareType==0?'下载固件程序':'下载模组源码'}
                                            </div>
                                        </div>
                                        {/* <div className='explain'><a href="https://opendoc.clife.cn/book/content?documentId=83&identify=product_manage" target='_blank'>模组烧录指南</a></div> */}
                                    </div>
                            </div>
                        </div>
                    </div>
            </div>
        )
    }
}

export default withRouter(FirmWare)