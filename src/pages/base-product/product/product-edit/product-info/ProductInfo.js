// 产品-开发中-基础信息

import * as React from "react";
import { Form, Input, Icon } from "antd";
import { connect } from "react-redux";
import "./ProductInfo.scss";
import LabelTip from "../../../../../components/form-com/LabelTip";
import DoubleBtns from "../../../../../components/double-btns/DoubleBtns";
import LabelVisible from "../../../../../components/form-com/LabelVisible";
import { updateInfo } from "../../store/ActionCreator";
import AloneSection from "../../../../../components/alone-section/AloneSection";
import { withRouter } from 'react-router-dom';
import { UploadFileClass } from '../../../../../components/upload-file';
import RouterPrompt from '../../../../../components/router-prompt/router-prompt';

import DefaultIcon from '../../../../../assets/images/defaultIocn.png'
import TopicList from '../../product-details/topic-list/TopicList'
const FormItem = Form.Item;

let EDIT_STATUS = false;

class ProductInfo extends React.Component {
    // 点击下一步
    handleNext = () => {
        const { form } = this.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            const productBaseInfo = this.props.productBaseInfo;
            const productIcon = this.productIcon.getFileListUrl();
            this.props.updateInfo({
                ...values,
                productId: productBaseInfo.productId,
                productIcon: productIcon && productIcon.length ? productIcon[0] : ''

            }).then( () => {
                EDIT_STATUS = false;
                this.forceUpdate( () => {
                    this.props.history.push("./protocols");
                })
            })
        });
    };

    passwordInputFocusHandel = () => {
        this.passwordRef.input.removeAttribute('readonly')
        this.ssidRef.input.removeAttribute('readonly')
    }

    componentDidUpdate = () => {
        this.setIcon()
    }

    componentDidMount(){
        setTimeout( () => {
            this.setIcon()
        })
    }

    componentWillUnmount () {
        EDIT_STATUS = false
    }

    setIcon () {
        let {productIcon = ''} = this.props.productBaseInfo;
        if ( (this.setedIcon !== productIcon) && this.productIcon) {
            this.setedIcon = productIcon;
            
            this.productIcon.setState({
                fileList: productIcon ? 
                            [
                                {
                                    uid:  1000 * Math.random(),
                                    name: '',
                                    status: 'done',
                                    url: productIcon,
                                }
                            ]:
                            []
            })
        }

    }

    render() {
        console.log('渲染基本信息', this.props)
        const { form,canOperate=true} = this.props;
        const { getFieldDecorator } = form;
        const formLayout = {
            labelCol: {
                span: 3
            },
            wrapperCol: {
                span: 10
            }
        };

        const {
            productId,
            productName,
            productCode,
            allCategoryName,
            accessModeName,
            productClassName,
            bindTypeName,
            protocolFormatName,
            netTypeName,
            deviceKey,
            productIdHex,
            ssid,
            ssidPassword,
            radiocastName,
            productClassId,
            gatewayCommType,
            isRelatedGateway,
            accessModeId,
            authorityType,
            bindType,
            netTypeId,
            productIcon
        } = this.props.productBaseInfo;

        //本来一个正则搞定，结果为了兼容老数据 accessModeId 为null的情况，就得用if了
        let authorityText = "";
        if (accessModeId === 0) {
            authorityText =
                authorityType === 2
                    ? "高级认证"
                    : authorityType === 1
                    ? "中级认证"
                    : "初级认证";
        } else if (accessModeId === 1) {
            authorityText = authorityType === 0 ? "无认证" : "有认证";
        } else {
            authorityText = "初级认证";
        }

        // 技术方案， ssid与广播名
        const showRadiocastName =
            (bindType === 1 && netTypeId === 3) || bindType === 2; // 通信技术为WIFI，但是配网为蓝牙配网时；通信技术为蓝牙时   需要展示 广播名字段
        const showSSID = netTypeId === 1; // 配网方式为AP配网时，需要展示 ssid及密码 字段

        return (
            <Form className="product-info-module">
                <RouterPrompt promptBoolean={EDIT_STATUS}></RouterPrompt>
                <AloneSection title="基础信息">
                    <div className="product-info-item-content">
                        <FormItem label="产品ID" {...formLayout}>
                            <span>{productId}</span>
                            <span className="small-size">
                                由系统自动分配的产品唯一标示码
                            </span>
                        </FormItem>
                        {
                            canOperate ? 
                            <FormItem label="产品名称" {...formLayout}>
                                {getFieldDecorator("productName", {
                                    initialValue: productName || '',
                                    rules: [
                                        {
                                            required: true,
                                            message: "产品名称不能为空"
                                        }
                                    ]
                                })(
                                    <Input
                                    placeholder="请输入产品名称"
                                    maxLength={20}
                                    style={{ width: 468 }}
                                    />
                                    )}
                            </FormItem>
                            :
                            <FormItem label="产品名称" {...formLayout}>
                                <span>{productName || ''}</span>
                            </FormItem>
                        }
                        {
                            canOperate ? 
                            <FormItem label="产品型号" {...formLayout}>
                                {getFieldDecorator("productCode", {
                                    initialValue: productCode || ''
                                })(
                                    <Input
                                        placeholder="请输入产品型号"
                                        maxLength={20}
                                        style={{ width: 468 }}
                                    />
                                )}
                            </FormItem>
                            :<FormItem label="产品型号" {...formLayout}>
                                 <span>{productCode || ''}</span>
                            </FormItem>
                        }
                        <FormItem label="所属分类" {...formLayout}>
                            <span>{allCategoryName}</span>
                        </FormItem>
                        <FormItem
                            label="产品图标"
                            {...formLayout}
                            className="clearfix"
                        >
                            {/* {getFieldDecorator("productIcon", {
                                initialValue: productIcon || ""
                            })(<UploadFile listType="file"/>)}
                            <span>
                                推荐尺寸信息64*64。支持gif、jpeg、jpg、png格式，不超过500KB。
                            </span> */}
                            
                            {/* 使用的是类组件Class，子组件传递给父组件的onRef方法 */}
                            {
                                canOperate ? 
                                <UploadFileClass onRef={el => this.productIcon = el} 
                                    maxCount={1} 
                                    preferSize={'64*64'} 
                                    format='.gif,.jpeg,.jpg,.png' 
                                    maxSize={0.5} />
                                :
                                <div className="icon-wrapper-in-detail">
                                    <img src={productIcon || DefaultIcon} alt=""/>
                                </div>
                            }
                        </FormItem>
                        <FormItem label="接入方式" {...formLayout}>
                            <span>{accessModeName}</span>
                            <span className="small-size">
                                {accessModeId === 0
                                    ? "设备直连C-Life平台"
                                    : "产品不直连C-Life云，已接入的云平台与C-Life云对接"}
                            </span>
                        </FormItem>
                        <FormItem label="产品类型" {...formLayout}>
                            <span>{productClassName}</span>
                        </FormItem>
                        {/* 网关设备才有此属性 */}
                        {productClassId === 1 && (
                            <FormItem label="网关通信方案" {...formLayout}>
                                <span>{gatewayCommType}</span>
                            </FormItem>
                        )}
                    </div>
                </AloneSection>
                <AloneSection title="技术信息">
                    <div className="product-info-item-content">
                        <FormItem label="通信方式" {...formLayout}>
                            <span>{bindTypeName}</span>
                        </FormItem>
                        <FormItem label="协议格式" {...formLayout}>
                            <span>{protocolFormatName}</span>
                        </FormItem>
                        <FormItem label="配网方式" {...formLayout}>
                            <span>{netTypeName}</span>
                        </FormItem>
                        <FormItem label="产品密钥" {...formLayout}>
                            <LabelVisible
                                label={deviceKey}
                                copy={true}
                                tip="点击复制"
                            />
                            <span className="small-size">
                                由系统自动分配的密码
                            </span>
                        </FormItem>
                        <FormItem label="产品编码" {...formLayout}>
                            <span>{productIdHex}</span>
                            <span className="small-size">
                                由系统自动分配的设备唯一编码
                            </span>
                        </FormItem>
                        <FormItem label="安全认证级别" {...formLayout}>
                            <span>{authorityText}</span>
                        </FormItem>
                        {/* 非网关设备才有此属性 */}
                        {productClassId === 0 && (
                            <FormItem label="关联网关" {...formLayout}>
                                <span>
                                    {isRelatedGateway === 1 ? "是" : "否"}
                                </span>
                            </FormItem>
                        )}
                    </div>
                </AloneSection>

                {showRadiocastName || showSSID ? (
                    <AloneSection title="技术方案">
                        <div className="product-info-item-content">
                            {showSSID ? (
                                <div>
                                    {canOperate ? 
                                    <FormItem
                                        label={
                                            <LabelTip
                                            label="AP-SSID"
                                            tip={
                                                <span>
                                                            AP配网时的密码{" "}
                                                            <a>使用指南</a>
                                                        </span>
                                                    }
                                                    />
                                                }
                                                {...formLayout}
                                                >
                                            {getFieldDecorator("ssid", {
                                                initialValue: ssid || "",
                                                rules: [
                                                    {
                                                        pattern: /^\w{1,20}$/,
                                                        message:
                                                        "1-20个英文字母或数字"
                                                    }
                                                ]
                                            })(
                                                <Input
                                                maxLength={20}
                                                placeholder="选填1-20个英文字母或数字"
                                                ref={ref => this.ssidRef = ref}
                                                onFocus={this.passwordInputFocusHandel} 
                                                readOnly 
                                                />
                                                )}
                                        </FormItem>
                                    :<FormItem
                                        label={
                                            <LabelTip
                                            label="AP-SSID"
                                            tip={
                                                <span>
                                                            AP配网时的密码{" "}
                                                            <a>使用指南</a>
                                                        </span>
                                                    }
                                                    />
                                                }
                                                {...formLayout}
                                                >
                                                <span>{ssid || ""}</span>
                                        </FormItem>
                                    }
                                    {
                                        canOperate ?
                                        <FormItem label={"AP-密码"} {...formLayout}>
                                            {getFieldDecorator("ssidPassword", {
                                                initialValue: ssidPassword || "",
                                                rules: [
                                                    {
                                                        pattern: /^\w{8,20}$/,
                                                        message:
                                                            "8-20个英文字母或数字"
                                                    }
                                                ]
                                            })(
                                                <Input.Password
                                                    maxLength={20}
                                                    placeholder="选填仅8-20个英文字母或数字"
                                                    ref={ref => this.passwordRef = ref}
                                                    onFocus={this.passwordInputFocusHandel} 
                                                    readOnly 
                                                />
                                            )}
                                            <span className="explain-text">
                                                配网时AP的SSID和密码
                                            </span>
                                        </FormItem>
                                        :
                                        <FormItem label={"AP-密码"} {...formLayout}>
                                            <span>{ssidPassword || ""}</span>
                                            <span className="explain-text">
                                                配网时AP的SSID和密码
                                            </span>
                                        </FormItem>
                                    }
                                </div>
                            ) : null}
                            {showRadiocastName ? (
                                canOperate ?
                                <FormItem label={"广播名"} {...formLayout}>
                                    {getFieldDecorator("radiocastName", {
                                        initialValue: radiocastName || ''
                                    })(
                                        <Input
                                            placeholder="请输入广播名"
                                            maxLength={20}
                                            style={{ width: 468 }}
                                        />
                                    )}
                                </FormItem>
                                :
                                <FormItem label={"广播名"} {...formLayout}>
                                    <span>{radiocastName || ''}</span>
                                </FormItem>
                            ) : null}
                        </div>
                    </AloneSection>
                ) : null}
                <TopicList productIdHex={productIdHex || "${YourProductKey}"} type={0} />
                {
                    canOperate &&
                    <div className="com-footer">
                        <DoubleBtns preBtn={false} nextHandle={this.handleNext} />
                    </div>
                }
            </Form>
        );
    }
}

const mapStateToProps = state => ({
    productBaseInfo: state.getIn(["product", "productBaseInfo"]).toJS()
});

const mapDispatchToProps = dispatch => ({
    updateInfo: params => dispatch(updateInfo(params))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Form.create({
    onValuesChange:() => {
        console.log(11111)
        EDIT_STATUS = true
    }
})(withRouter(ProductInfo)));
