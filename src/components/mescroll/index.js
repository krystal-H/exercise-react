import React from 'react';
import MeScroll from 'mescroll.js'
import 'mescroll.js/mescroll.min.css'
import ProductIcon from '../../components/product-components/product-icon/ProductIcon';
import { Checkbox } from 'antd';


import { get, Paths, post } from '../../api';
import { REQUEST_SUCCESS } from '../../configs/request.config';

const pager = {
    pageIndex: 1,
    pageRows: 10,
};

let mescroll = null;

class MescrollRefresh extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataList: [],
            isSearch: false,
        }
    }

    componentDidMount() {
        this.props.onRef(this);
        this.initMescroll("mescroll", "dataList");
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const { listAllProductAndAccreditInfo } = nextProps;
        if (prevState.isSearch) {
            return {
                dataList: listAllProductAndAccreditInfo.list,
            };
        }
        // 否则，对于state不进行任何操作
        return null;
    }

    /* 创建MeScroll对象 */
    initMescroll = (mescrollId, clearEmptyId) => {
        mescroll = new MeScroll(mescrollId, {
            // 上拉加载的配置项
            up: {
                callback: this.getListData, // 上拉回调,此处可简写; 相当于 callback: function (page) { getListData(page); }
                isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                noMoreSize: 4, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
                empty: {
                    icon: "http://www.mescroll.com/demo/res/img/mescroll-empty.png", //图标,默认null
                    tip: "暂无相关数据~", //提示
                    btntext: "去逛逛 >", //按钮,默认""
                    btnClick: function () {//点击按钮的回调,默认null
                        alert("点击了按钮,具体逻辑自行实现");
                    }
                },
                clearEmptyId: clearEmptyId, //相当于同时设置了clearId和empty.warpId; 简化写法;默认null; 注意vue中不能配置此项
                toTop: { //配置回到顶部按钮
                    src: "http://www.mescroll.com/demo/res/img/mescroll-totop.png", //默认滚动到1000px显示,可配置offset修改
                    //offset : 1000
                },
                lazyLoad: {
                    use: true // 是否开启懒加载,默认false
                },
                page: {
                    num: 0, // 当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                    size: 10000 //每页数据条数,默认10 /* 先写死一个很大值，不分页 */
                },
            }
        });
        return mescroll;
    };

    /* 联网加载列表数据  page = {num:1, size:10}; num:当前页 从1开始, size:每页数据条数 */
    getListData = (page) => {
        let { url, params, searchValue } = this.props;
        let pageNum = page.num; // 页码, 默认从1开始 如何修改从0开始 ?
        let pageSize = page.size; // 页长, 默认每页10条
        this.setState(() => {
            return {
                isSearch: false,
            }
        }, () => {
            get(Paths[url], {
                pageIndex: pageNum,
                pageRows: pageSize,
                ...params,
                productName: searchValue,
            }, { loading: true }).then((res) => {
                const code = res.code;
                const data = res.data;
                if (code === REQUEST_SUCCESS) {
                    console.log('111', data);
                    let list = data.list; // 接口返回的分页数据
                    let pager = data.pager; // 接口返回的分页数据
                    // let totalPages = pager.totalPages; // 接口返回的总页数 (比如列表有26个数据,每页10条,共3页; 则totalPage值为3)
                    console.log("page.num=" + page.num + ", page.size=" + page.size + ", pageData.length=" + list.length);
                    // let listData = [];
                    //全部 (模拟分页数据)
                    // for (let i = (pageNum - 1) * pageSize; i < pageNum * pageSize; i++) {
                    //     if (i === data.length) break;
                    //     listData.push(data[i]);
                    // }

                    //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
                    //mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空,显示empty配置的内容;
                    //列表如果无下一页数据,则提示无更多数据,(注意noMoreSize的配置)

                    // 方法一(推荐): 后台接口有返回列表的总页数 totalPage
                    // 必传参数(当前页的数据个数, 总页数)
                    mescroll.endByPage(list.length);

                    //方法二(推荐): 后台接口有返回列表的总数据量 totalSize
                    //必传参数(当前页的数据个数, 总数据量)
                    // mescroll.endBySize(curPageData.length, totalSize);

                    //方法三(推荐): 您有其他方式知道是否有下一页 hasNext
                    //必传参数(当前页的数据个数, 是否有下一页true/false)
                    //mescroll.endSuccess(curPageData.length, hasNext);

                    //方法四 (不推荐),会存在一个小问题:比如列表共有20条数据,每页加载10条,共2页.
                    //如果只根据当前页的数据个数判断,则需翻到第三页才会知道无更多数据
                    //如果传了hasNext,则翻到第二页即可显示无更多数据.
                    //mescroll.endSuccess(curPageData.length);

                    //结束下拉刷新的 mescroll.endSuccess()无参.
                    //结束上拉加载 curPageData.length必传的原因:
                    // 1.使配置的noMoreSize 和 empty生效
                    // 2.判断是否有下一页的首要依据: 当传的值小于page.size时,则一定会认为无更多数据.
                    //     比传入的totalPage, totalSize, hasNext具有更高的判断优先级
                    // 3.当传的值等于page.size时,才会取totalPage, totalSize, hasNext判断是否有下一页
                    // 传totalPage, totalSize, hasNext主要目的是避免方法四描述的小问题

                    //设置列表数据
                    this.setState((preState) => {
                        return { dataList: preState.dataList.concat(list) };
                    });
                }
            });
        });
    };

    onChange = (checkedValues) => {
        console.log('checkedValues', checkedValues);
        this.props.onChange(checkedValues);
    };

    render() {
        let { dataList } = this.state;
        let { currentAppType, relationProductList, checkedValues } = this.props;
        let list = currentAppType === 1 ? relationProductList.listAndroid : relationProductList.listIos;
        let checkedProductIds = list && list.map((item) => {
                return item.productId;
            });
        console.log('checkedProductIds',checkedProductIds);
        return (
            <div className="mescroll-refresh flex1">
                <Checkbox.Group defaultValue={checkedProductIds} onChange={this.onChange}>
                    <div id="mescroll" className="mescroll">
                        <div id="dataList" className="data-list flex-row">
                            {dataList.length > 0 && dataList.map((item, index) => {
                                let { productId, productIcon, productName } = item;
                                return (
                                    <div key={index} className="list-item flex-column">
                                        <i className="product-pic">
                                            <ProductIcon icon={productIcon} />
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
        );
    }
}

export default MescrollRefresh;
