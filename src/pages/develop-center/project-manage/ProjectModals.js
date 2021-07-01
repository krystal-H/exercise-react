import React,{useState} from 'react'
import {Modal,Table,Button,Input,Select,Form,Radio,Upload} from 'antd'
import { Notification } from '../../../components/Notification'
// import {Paths} from '../../../api'
import CommSearchMod from '../../comm-mod/searchDevice';
const {Option} = Select

export  function RelaModal({
    visible,
    okLoading,
    onOkHandle,
    onCancelHandle,
    _selectedRowKeys,
    columns,
    type = 1,
    dataInRela,
    getRelaList
}) {

    const [selectedRowKeys,setSelectedRowKeys] = useState(_selectedRowKeys || [])
    const [searchname,setSearchname] = useState("")
    const [searchLoading,setSeachLoading] = useState(false) 
    const [resetLoading,setResetLoding] = useState(false)

    const {list,pager,relatedProductList,deviceGroupList} = dataInRela
    let getSearchData =()=>{}

    const onSelectChange = rowKeys => {
        setSelectedRowKeys(rowKeys)
    }
    const searchedData = (_searchdata)=>{
        return getRelaList({..._searchdata})
    }
    const onSearch = (_index) => {
        let _data = {}
        if (type === 1) {
            searchname && (_data.name = searchname)
        } else {
            Object.assign(_data, getSearchData())
        }
        if (typeof _index === 'number') {
            _data._index = _index
        } else {
            setSeachLoading(true)
        }

        getRelaList(_data).finally( () => {
            setSeachLoading(false)
        })
    }

    const reset = () => {
        setSearchname("")
        setResetLoding(true)
        getRelaList({}).finally( () => {
            setResetLoding(false)
        })
    }

    const okHandle = () => {
        if (!selectedRowKeys.length) {
            Notification({
                message:'请至少选中一个后再进行管理'
            })
            return;
        }

        onOkHandle(selectedRowKeys)
    }
    
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    return (
        <Modal
            visible={visible}
            width={1000}
            title={`关联${['产品','设备'][type - 1]}`}
            okText="确定"
            confirmLoading={okLoading}
            onOk={okHandle}
            cancelText="取消"
            onCancel={onCancelHandle}
            centered={true}
            closable={false}
            destroyOnClose={true}
            maskClosable={false}
            >
                <div style={{ 'marginBottom': '24px' }}>
                    {
                        type === 1 && <> 
                        <Input placeholder="请输入产品查询名称"
                            style={{ width: '240px',marginRight:'12px'}}
                            value={searchname}
                            onChange={(e) => setSearchname(e.target.value)}
                            maxLength={20} 
                        />
                        <Button type="primary"
                            style={{marginRight:'12px'}}
                            onClick={onSearch}
                            loading={searchLoading}
                            icon="search"
                        >查询
                        </Button>
                        <Button type="default" loading={resetLoading} onClick={reset}>重置</Button>
                        </>
                        
                    }
                    {
                        type === 2 &&
                       
                            <CommSearchMod
                                multiple={true}
                                inputkey="param"
                                list={[relatedProductList,deviceGroupList]}
                                searchedData={searchedData}
                                onRef={(ref)=>{getSearchData = ref}}
                            ></CommSearchMod>
                    }
                   

                    
                </div>
                
                <Table  rowKey={type === 1 ? "productId" : 'deviceId'}
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={list}
                    pagination={{
                        total: pager.totalRows,
                        current: pager.pageIndex,
                        defaultCurrent: 1,
                        defaultPageSize: 10,
                        onChange: (index) => {onSearch(index)},
                        showQuickJumper: true,
                        hideOnSinglePage: true,
                        showTotal: total => <span>共 <a>{total}</a> 条</span>
                    }}>
                </Table>
        </Modal>
    )
}

// export const AddDevices =  Form.create({ name:'form-for-add-device' })(function ({
//     visible,
//     okLoading,
//     onOkHandle,
//     onCancelHandle,
//     form,
//     productList
// }) {
//     const [labelList,setLabelList] = useState([])
//     const {getFieldDecorator,getFieldValue} = form

//     const okHandle = () => {
//         form.validateFields((err, values) => {
//             let labelJson = {}

//             if (labelList.length > 0) {
//                 for (let i = 0; i < labelList.length; i++) {
//                     let {key,value} = labelList[i],
//                         _key = key.trim(),
//                         _value = value.trim();

//                     if (_key === '' || _value === '') {
//                         Notification({
//                             message:'请完善标签内容'
//                         })

//                         return;
//                     }

//                     labelJson[_key] = _value
//                 }
//             }
            
//             if (!err) {

//               console.log('Received values of form: ', values);
//                let {data,productId,type,deviceId} = values,
//                     _data = '';

//                 if (data && data.fileList && data.fileList.length) {
//                     let temp = data.fileList[0]

//                     if (temp && temp.response && temp.response.data) {
//                         _data = temp.response.data.url
//                     }
//                 }

//                 let params = {
//                     productId,
//                     type
//                 }

//                 if (type === 0) {
//                     params.deviceId = deviceId
//                 } else {
//                     params.data = _data
//                 }

//                 if (Object.keys(labelJson).length > 0) {
//                     params.labelJson = JSON.stringify(labelJson)
//                 }

//                 onOkHandle(params)
//             }
//           });
//     }

//     const formItemLayout = {
//         labelCol: {
//           xs: { span: 6 },
//           sm: { span: 6 },
//         },
//         wrapperCol: {
//           xs: { span: 18 },
//           sm: { span: 18 },
//         },
//     };

//     const addNewLabel = () => {
//         setLabelList(preData => {
//             return [
//                 ...preData,
//                 {
//                     key:'',
//                     value:''
//                 }
//             ]
//         })
//     }

//     const deleteLabel = (_index) => {
//         setLabelList(preData => {
//             return preData.filter((item,index) => index !== _index)
//         })
//     }

//     const changeParam =(_key,_index,_value) => {
//         setLabelList(preData => {
//             let _preData = [...preData]

//             _preData[_index][_key] = _value

//             return _preData
//         })
//     }


//     return (
//         <Modal
//             visible={visible}
//             width={600}
//             title={'新增设备'}
//             okText="确定"
//             confirmLoading={okLoading}
//             onOk={okHandle}
//             cancelText="取消"
//             onCancel={onCancelHandle}
//             centered={true}
//             closable={false}
//             destroyOnClose={true}
//             maskClosable={false}
//             >
//                 <div className="device-add-form-wrapper">
//                     <Form {...formItemLayout}>
//                         <Form.Item label="产品">
//                             {getFieldDecorator('productId', {
//                                 rules: [{ required: true, message: '请选择产品！' }],
//                                 initialValue:''
//                             })(
//                                 <Select>
//                                     {
//                                         productList.map(item => {
//                                             let {name,productId} = item;
            
//                                             return (<Option key={productId} value={productId}>{name}</Option>)
//                                         })
//                                     }
//                                 </Select>
//                             )}
//                         </Form.Item>
//                         <Form.Item label="导入方式">
//                             {getFieldDecorator('type', {
//                                 rules: [{ required: true, message: '请选择导入方式！' }],
//                                 initialValue: 0
//                             })(
//                                 <Radio.Group>
//                                     <Radio value={0}>单个导入</Radio>
//                                     <Radio value={1}>批量导入</Radio>
//                                 </Radio.Group>
//                             )}
//                         </Form.Item>
//                         {
//                             getFieldValue('type') === 0 ? 
//                             <Form.Item label="设备ID">
//                                 {getFieldDecorator('deviceId', {
//                                     rules: [{ required: true, message: '请输入设备ID！' }],
//                                     initialValue:''
//                                 })(
//                                     <Input
//                                         placeholder="请输入设备ID！"
//                                     />
//                                 )}
//                             </Form.Item>:
//                             <Form.Item label="批量上传文件">
//                                 {getFieldDecorator('data', {
//                                     rules: [{ required: true, message: '请上传文件！' }],
//                                     initialValue:[],
                                    
//                                 })(
//                                     <Upload
//                                         accept='.xls,.xlsx' 
//                                         action={Paths.upFileUrl}
//                                         data={{
//                                             appId: 31438,
//                                             domainType: 4,
//                                         }}>
//                                         <Button type="primary" 
//                                                 icon="upload">上传文件</Button>
//                                     </Upload>
//                                 )}
//                                 <a href="http://skintest.hetyj.com/31438/6b0b20891e06ac31d0eed37a5083cca9.xlsx">下载.asv模板</a>
//                             </Form.Item>
//                         }
//                         <Form.Item label="设备标签">
//                             <div className="add-new-label">
//                                 {
//                                     labelList.map((item,index) => {
//                                         let {key,value} = item;

//                                         return  (
                                        
//                                             <div className="new-label-item" key={index}>
//                                                 <Input
//                                                     value={key}
//                                                     style={{
//                                                         width:'40%',
//                                                         marginRight:'3%'
//                                                     }}
//                                                     onChange={e => changeParam('key',index,e.target.value)}
//                                                     placeholder="请输入标签key"
//                                                 />
//                                                 <Input
//                                                     value={value}
//                                                     style={{
//                                                         width:'40%',
//                                                         marginRight:'3%'
//                                                     }}
//                                                     onChange={e => changeParam('value',index,e.target.value)}
//                                                     placeholder="请输入标签value"
//                                                 />
//                                                 <a onClick={() => deleteLabel(index)}>删除</a>
//                                             </div>
//                                         )
//                                     })
//                                 }

//                                 <Button type="default"
//                                         onClick={addNewLabel}
//                                         size="small">新增标签</Button>
//                             </div>
//                         </Form.Item>
//                     </Form>
//                 </div>
//         </Modal>
//     )
// })
