// 产品列表

import React, { PureComponent } from 'react'
import { Input, Pagination, Icon } from 'antd';
import { Notification} from '../../../../components/Notification'
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import NoSourceWarn from '../../../../components/no-source-warn/NoSourceWarn';
import { getProductListAction } from '../store/ActionCreator';
import ProductCard from './product-card/ProductCard';
import { post, Paths } from '../../../../api';
import ActionConfirmModal from '../../../../components/action-confirm-modal/ActionConfirmModal';
import PageTitle from '../../../../components/page-title/PageTitle';
import './List.scss';

const { Search } = Input;

// 将store中的state绑定到当前组件
const mapStateToProps = state => {
    return {
        productList: state.getIn(['product', 'productList']).toJS()
    }
}
// 将store中的方法挂载到当前组件
const mapDispatchToProps = dispatch => {
    return {
        getProductList: data => dispatch(getProductListAction(data)),
    }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class List extends PureComponent {
    constructor(props) {
        super(props);
        this.modalWidth = 460;
        this.defaultListParams = { // 产品列表相关默认请求参数
            pageIndex: 1,
            pageRows: 6,
            productName: ''
        }
        this.state = {
            curAllItem: 1, //产品列表item个数，会影响到样式
            copyModalVisible: false, // 复制弹框 状态控制
            copyInputValue: '', // 复制弹框中输入的新产品名称
            copyLoading: false,
            deleteModalVisible: false, // 参数弹框 状态控制
            deleteLoading: false,
            deleteInputValue: '', // 删除弹框中输入的产品名称确认
            selectedItem: null, // 当前正在操作（复制/删除）的产品
            listParams: cloneDeep(this.defaultListParams) // 获取产品列表相关请求参数
        }
        // this.clickProductInfo = this.clickProductInfo.bind(this); 多余的
    }
    componentDidMount() {
        console.log(this.props, 'this.props')
        /**
         *  getProductList: ƒ getProductList(data)
            history: {length: 3, action: "POP", location: {…}, createHref: ƒ, push: ƒ, …} //--- 默认props存在的字段
            location: {pathname: "/open/base/product/list", search: "", hash: "", state: undefined} //--- 默认props存在的字段
            match: {path: "/open/base/product/list", url: "/open/base/product/list", isExact: true, params: {…}} //--- 默认props存在的字段
            productList: {list: Array(0), pager: {…}}
            staticContext: null //--- 默认props存在的字段
         */
        this.getProductList()
    }
    componentDidUpdate() {
        this.setItemLenth()
    }
    setItemLenth() {
        let list = this.props.productList.list || [],
            curAllItem = list.length + 1;
        if (curAllItem !== this.state.curAllItem) {
            this.setState({
                curAllItem
            })
        }
    }
    // 获取产品列表-------
    getProductList() {
        let { listParams } = this.state;
        // 通过mapDispatchToProps绑定store中的方法到当前组件
        this.props.getProductList(listParams);
    }
    // 搜索产品-------
    searchProduct = (value = '') => {
        value = value.trim();
        // 拷贝获取列表默认参数
        let listParams = cloneDeep(this.state.listParams);
        // 扩展+请求参数
        listParams.productName = value;
        listParams.pageIndex = 1;
        this.setState({
            listParams
        }, this.getProductList)
    }
    // 列表翻页-------
    changePage(pageIndex) {
        let listParams = cloneDeep(this.state.listParams);
        listParams.pageIndex = pageIndex;
        this.setState({
            listParams
        }, this.getProductList)
    }
    openCopyModal(e, item) {
        console.log(item, 'item.....')
        let {mode} = item;
        if (mode == '2') {
            return false;
        }
        this.setState({
            copyModalVisible: true,
            selectedItem: item
        })
    }
    // 复制 OK确定-------
    copyModalOKHandle = () => {
        let { copyInputValue, selectedItem } = this.state;
        let _value = copyInputValue.trim(),
            {productId} =  selectedItem ;
        if (!_value) {
            Notification({
                type:'warn',
                message: '异常操作',
                description: '请输入产品名称！'
            })
            return false;
        }
        this.setState({
            copyLoading: true
        }, () => {
            post(Paths.copyProduct, {
                productId,
                productName:_value
            },{
                needVersion:1.1
            }).then(data => {
                if(data.code === 0){
    				Notification({type:'success',description:'复制成功！'});
                }
                this.setState({ // 清空查询参数，重新请求列表
                    listParams: cloneDeep(this.defaultListParams),
                    copyModalVisible:false
                },this.getProductList)
            }).finally(
                () => {
                    this.setState({
                        copyLoading: false
                    })
                }
            )
        })
    }
    // 删除框取消操作-------
    modalCancelHandle = (type = 'copyModalVisible') => {
        this.setState({
            [type]: false,
            deleteInputValue:''
        })
    }
    // 打开删除弹框-------
    openDeleteModal(item) {
        let {mode} = item;
        if (mode === '2') {
            return false;
        }
        this.setState({
            deleteModalVisible: true,
            selectedItem: item
        })
    }
    // 删除框确认操作-------
    deleteModalOKHandle = () => {
        let { deleteInputValue, selectedItem } = this.state;
        let _value = deleteInputValue.trim(),
            {productId} = selectedItem ;
            if (!_value || _value !== 'delete') {
                Notification({
                    type:'warn',
                    message: '异常操作',
                    description: '请输入"delete"来确认删除!'
                })
                return false;
            }
        this.setState({
            deleteLoading: true
        }, () => {
            post(Paths.delectProduct, {
                productId
            },{
                needVersion:1.1
            }).then(data => { // 删除后不需要重置查询参数
                if(data.code === 0){
                    Notification({type:'success',description:'删除成功！'});
                }
                this.setState({
                    deleteModalVisible:false,
                    deleteInputValue:''
                })
              this.getProductList()
            }).finally(
                () => {
                    this.setState({
                        deleteLoading: false
                    })
                }
                
            )
        })
    }
    // 输入框输入-------
    inputOnChangeHandle = (type, event) => {
        // react16或者更早使用
        // 如果在react中想异步访问事件属性（如在setTimeout内），
        // 应该在是处理事件时调用event.persist()
        event.persist();
        let value = event.target.value;
        this.setState({
            [type]: value
        })
    }
    //点击查看产品详情    产品状态 mode：（0-开发中，1-已发布，2-审核中）
    clickProductInfo(mode,productId){
        let pathroute = 'details';
        if(mode !== 1){
            pathroute = 'edit';
        }
        this.props.history.push({
            pathname: `/open/base/product/${pathroute}/${productId}`
        });
        // window.open(`#/open/base/product/${pathroute}/${productId}`);
        // if(mode !== 1){
        //     this.props.history.push({
        //         pathname: `/open/base/product/edit/${productId}/info`
        //     });
        // }else{
        //     window.open(`#/open/base/product/details/${productId}`);
        // }
    }
    // 新建产品
    goToAddNewProduct = () => {
        // 下边一段无用start
        // let {history,productList} = this.props,
        //     {maxProductNum,productNum} = productList;
        // if(productNum >= maxProductNum - 10) {
        //     return Notification({ message:'无法添加', description:'已超出产品个数上限！' })
        // }
        // 无用end
        this.history.push({ pathname:'/open/base/product/add' })
    }
    render() {
        // console.log(this.props, 'this.props') 为啥执行五六遍？？？？？
        let { curAllItem, listParams, copyModalVisible, deleteModalVisible, selectedItem, copyInputValue, copyLoading, deleteInputValue, deleteLoading } = this.state,
            { productList } = this.props,
            { list, pager } = productList,
            listWrapperClassName = curAllItem <= 6 ? "lists-wrapper flex-row flex1" : "lists-wrapper flex-row flex1 six-item";
            return (
                <section className="page-main-wrapper flex-column">
                    {/* 头部信息 */}
                    <PageTitle noback={true} title="产品" needBtn={true} btnText="新建产品" btnIcon="plus" btnClickHandle={this.goToAddNewProduct}></PageTitle>
                    {/* 搜索 */}
                    <header className="page-content-header">
                        <div className='searchBox'>
                            <Search placeholder="请输入产品ID，名称，型号搜索产品项目" maxLength={20} onSearch={value => this.searchProduct(value)} enterButton />
                        </div>
                    </header>
                    {/* 产品内容card列表 */}
                    <div className="bg-wrapper flex1 flex-column">
                        <div className="page-main-content-wrapper flex-column flex1">
                            {
                                (list && list.length > 0) ? 
                                <section className={listWrapperClassName}>
                                    { 
                                        list.map((item, index) => {
                                            /**
                                             * ------
                                             * 为了确保this指向，事件还可以有如下方式
                                             * copyFunction={(e) => this.openCopyModal(e, item)}
                                             */
                                            return (
                                                <div className="list-item" key={`x-${index}`} >
                                                    <ProductCard
                                                        Info={item}
                                                        copyFunction={this.openCopyModal.bind(this, item)}
                                                        deleteFunction={this.openDeleteModal.bind(this, item)}
                                                        productInfo={this.clickProductInfo.bind(this,item.mode,item.productId)}>
                                                    </ProductCard>
                                                </div>
                                            )
                                        })
                                    }
                                </section> :
                                <NoSourceWarn style={{marginTop:'100px'}} tipText="暂无产品数据"></NoSourceWarn>
                            }
                            <footer className="list-pagination">
                                {
                                    pager && pager.totalRows>0?
                                    <Pagination className="self-pa"
                                        total={pager.totalRows}
                                        current={listParams.pageIndex}
                                        defaultCurrent={1}
                                        defaultPageSize={listParams.pageRows}
                                        onChange={(page) => this.changePage(page)}
                                        showTotal={total => <span>共 <a>{total}</a> 条</span>}
                                        showQuickJumper
                                        hideOnSinglePage
                                    />
                                    :null
                                }
                            </footer>
                        </div>
                    </div>
                    {/* 复制产品弹框 */}
                    {
                        selectedItem && copyModalVisible &&
                        <ActionConfirmModal
                            visible={copyModalVisible}
                            modalOKHandle={this.copyModalOKHandle}
                            modalCancelHandle={this.modalCancelHandle.bind(this, 'copyModalVisible')}
                            targetName={selectedItem.productName}
                            confirmLoading={copyLoading}
                            title={'复制产品'}
                            descText={'即将复制的产品'}
                            tipText={'创建与原产品的功能和服务配置一样的新产品'}>
                                <Input className="modal-content-input"
                                    onChange={e => { this.inputOnChangeHandle('copyInputValue', e) }}
                                    onPressEnter={this.copyModalOKHandle}
                                    value={copyInputValue}
                                    maxLength={20}
                                    placeholder="新产品名称" />
                        </ActionConfirmModal>
                    }
                    {/* 删除产品弹框 */}
                    {
                        selectedItem && deleteModalVisible &&
                        <ActionConfirmModal
                            visible={deleteModalVisible}
                            modalOKHandle={this.deleteModalOKHandle}
                            modalCancelHandle={this.modalCancelHandle.bind(this, 'deleteModalVisible')}
                            targetName={selectedItem.productName}
                            confirmLoading={deleteLoading}
                            title={'删除产品'}
                            needWarnIcon={true}
                            descText={'即将删除的产品'}
                            tipText={'产品的所有信息将完全被删除，无法找回，请谨慎操作'}>
                                <Input className="modal-content-input"
                                    onChange={e => { this.inputOnChangeHandle('deleteInputValue', e) }}
                                    onPressEnter={this.deleteModalOKHandle}
                                    placeholder="请输入“delete”确认删除该产品"
                                    maxLength={20}
                                    value={deleteInputValue}
                                />
                        </ActionConfirmModal>
                    }
                </section>
        )
    }
}


