import React, { Component } from 'react';
import { Input, Button, Modal, Checkbox } from 'antd';
import { Notification } from '../../../../components/Notification';
import { get, Paths, post } from '../../../../api';
import { cloneDeep} from 'lodash';
import { REQUEST_SUCCESS } from '../../../../configs/request.config';
import ProductIcon from '../../../../components/product-components/product-icon/ProductIcon';

const { Search } = Input;

export default class AddProductRelationModal extends Component {

    constructor(props) {
        super(props);
        // @lei 为了增加点击图标选择产品的功能，将checkBox.group改为受控组件 checkedValues为其Value值
        let { currentAppType, relationProductList } = this.props;
        let list = currentAppType === 1 ? relationProductList.listAndroid : relationProductList.listIos,
            checkedProductIds = list && list.map((item) => {
                return item.productId;
            });
    
        this.state = {
            checkedValues: checkedProductIds || [],
            searchValue: '',
            isFirst: true,
            listAllProductAndAccreditInfo: { list: [], pager: {} }, // 可关联的产品列表
        }
    }

    componentDidMount() {
        this.getListAllProductAndAccreditInfo()
    }

    getListAllProductAndAccreditInfo = (params) => {
        let { appId,relationedProductIds,currentAppType } = this.props,
            _relationedProductIds = (relationedProductIds && relationedProductIds[currentAppType === 1 ? 'android' : 'ios']) || [];

        get(Paths.getDevProductList, {
            // pageIndex: 1,
            // pageRows: 10000, // 写一个极大值，不分页
            version: '1.1',
            appId,
            ...params,
        }, { loading: true }).then((res) => {
            const code = res.code;
            const data = res.data || [];
            // 后台改了接口返回格式，兼容一下
            let listAllProductAndAccreditInfo = {
                list: data.filter(item => !_relationedProductIds.includes(item.productId)),
                pager: {}
            };
            if (code === REQUEST_SUCCESS) {
                this.setState(() => {
                    return { listAllProductAndAccreditInfo };
                });
            }
        });
    };

    handleSubmit = e => {
        e.preventDefault();
        let checkedValues = [...this.state.checkedValues];
        let { relationProductList, currentAppType } = this.props;
        let list = currentAppType === 1 ? relationProductList.listAndroid : relationProductList.listIos;
        let relationProductIds = list && list.map((item) => {
                return item.productId;
            });
        if (checkedValues.length === 0) {
            // if (relationProductIds.length !== 0) {
            //     checkedValues = relationProductIds;
            // } else {
                Notification({
                    description:'请选择需要关联的产品',
                    type:'warn'
                });
                return;
            // }
        }
        this.props.updateRelaProduct(checkedValues);
    };

    handleCancel = (type) => {
        const { showDialog } = this.props;
        showDialog(type);
    };

    onChange = (checkedValues) => {
        this.setState(() => {
            return { checkedValues: checkedValues };
        });
    };

    handleSearch = (value) => {
        this.setState(() => {
            return { searchValue: value,checkedValues:[] };
        }, () => {
            this.getListAllProductAndAccreditInfo({
                productName: value,
            })
        });
    };

    clickIconHandle = (e,productId) => {
        e.stopPropagation()
    
        let {checkedValues} = this.state,
        temp = cloneDeep(checkedValues),
        _index = temp.indexOf(productId);
        if (_index === -1) {
            temp.push(productId)
        } else {
            temp.splice(_index,1)
        }

        this.setState({
            checkedValues:temp
        })
    }

    render() {
        let { showAddProductRelationDialog} = this.props;
        let { listAllProductAndAccreditInfo,checkedValues } = this.state;

        return (
            <Modal
                width="63%"
                visible={showAddProductRelationDialog}
                // height="82%"
                title="添加产品关联"
                className="add-product-relation-modal"
                onCancel={() => this.handleCancel('showAddProductRelationDialog')}
                maskClosable={false}
                style={{minWidth: 900}}
                footer={[
                    <Button key="submit" type="primary" onClick={this.handleSubmit}>
                        确认
                    </Button>,
                    <Button key="cancel" onClick={() => this.handleCancel('showAddProductRelationDialog')}>
                        取消
                    </Button>
                ]}
            >
                <div className="product-relation flex-column">
                    <div className="desc">您可以添加由您创建和给予授权的硬件产品</div>
                    <div className="search-wrapper">
                        <Search
                            placeholder="请输入产品ID，产品名称搜索产品"
                            maxLength={100}
                            onSearch={value => this.handleSearch(value)}
                            style={{ width: '50%' }}
                            enterButton
                        />
                    </div>
                    <div className="mescroll-refresh flex1" style={{height:'max-content'}}>
                        <Checkbox.Group style={{ width: '100%' }} 
                                        // defaultValue={checkedProductIds}
                                        value={checkedValues}
                                        onChange={this.onChange}
                                        >
                            <div id="mescroll" className="mescroll">
                                <div id="dataList" className="data-list flex-row">
                                    {listAllProductAndAccreditInfo.list.length > 0 && listAllProductAndAccreditInfo.list.map((item, index) => {
                                        let { productId, productIcon, productName } = item;
                                        return (
                                            <div key={productId} className="list-item flex-column">
                                                <i className="product-pic">
                                                    <div style={{cursor:'pointer'}}
                                                         onClick={(e) => this.clickIconHandle(e,productId)}>
                                                                <ProductIcon icon={productIcon} />
                                                    </div>
                                                    <div className="check-box">
                                                        <Checkbox
                                                            value={productId}
                                                        />
                                                    </div>
                                                </i>
                                                <p className="product-name flex1 flex-row">
                                                    {productName}
                                                </p>
                                                <div className="product-id flex-row flex1">
                                                    {productId}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </Checkbox.Group>
                    </div>
                </div>
            </Modal>
        );
    }
}
