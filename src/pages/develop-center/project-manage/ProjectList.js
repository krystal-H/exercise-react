import React,{useState,useEffect,useCallback} from 'react'
import {Modal,Form,Input} from 'antd'
import PageTitle from '../../../components/page-title/PageTitle'
import NoSourceWarn from '../../../components/no-source-warn/NoSourceWarn'
import AloneSection from '../../../components/alone-section/AloneSection'
import ActionConfirmModal from '../../../components/action-confirm-modal/ActionConfirmModal'
import { Paths, get, post } from '../../../api'
import {Link} from 'react-router-dom'
import { DateTool } from '../../../util/util'

const PATTERN = /^[\w\u4E00-\u9FA5]{1,30}$/
const PLACEHOLDER = '中英文、数字、下划线，长度不超过30'

function ProjectList({form,history}) {
    const [projectList,setProjectList] = useState([])
    const [addVisible,setAddVisible] = useState(false)
    const [deleteVisible,setDeleteVisible] = useState(false)
    const [curRecord,setCurRecord]=useState(null)

    const {getFieldDecorator} = form
    const { TextArea } = Input;

    const getProjectList = useCallback(
        () => {
            get(Paths.getProjectList,{loading:true}).then(
                data => {
                    data && data.data && setProjectList(data.data)
                }
            )
        },
        [],
    )

    useEffect(() => {
        getProjectList()
    },[getProjectList])

    const addOrEditProject = (record) => {

        if(curRecord) {
            setCurRecord(record)
        }

        setAddVisible(true)
    }

    const handleSubmit = () => {
        form.validateFields((err, values) => {
            if (!err) {
                let _path  = Paths.addProject,
                    _data = {...values};
                if (curRecord) {
                    _path = Paths.updateProject
                    _data.projectId = curRecord.projectId
                }

                post(_path,_data,{loading:true}).then(
                    data => {     
                        setAddVisible(false)
                        if(curRecord) {
                            setCurRecord(null)
                        }
                        getProjectList()
                    }
                )
            }
        })
    }
    const deleteCant = (curitem = curRecord)=>{
        let {serveCount,deviceCount,proCount} = curitem;
        let candesc = '';
        if(serveCount>0 || deviceCount>0 || proCount>0){
            candesc = '项目下仍有服务未删除，或有产品/设备未解除关联关系，请进入项目内删除对应内容'
        }
        return candesc
    }
    const clickDel = (delitem)=>{
        let {serveCount,deviceCount,projectId} = delitem;

        if(serveCount>0 || deviceCount>0){//如果关联设备和服务已经能判断该项目不可以被直接删除，则不需要再看是否有关联的产品
            setCurRecord(delitem);
            setDeleteVisible(true);
            return
        }
        get(Paths.getProductInProject,{projectId},{loading:true}).then(
            data => {
                const list  = (data && data.data && data.data.list ) || [];
                delitem.proCount = list.length;
                setCurRecord(delitem);
                setDeleteVisible(true)
            }
        )   
    }

    const deleteOkHandle = () => {
        let {projectId} = curRecord;
        if(deleteCant()){
            setDeleteVisible(false)
            setCurRecord(null)
            return
        }
        get(Paths.deleteProject,{id:projectId},{loading:true}).then(data => {
            setDeleteVisible(false)
            setCurRecord(null)
            getProjectList()
        })
    }

    return (
        <React.Fragment>
            <PageTitle noback={true} 
                       title="项目管理" 
                       needBtn={true} 
                       btnText="新建项目"
                       btnClickHandle={addOrEditProject} 
                       btnIcon="plus"></PageTitle>
            <AloneSection style={{minHeight:'calc(100% - 102px)'}}>
                {
                    projectList.length > 0 ? (
                        <div className="project-wrapper">
                            {
                                projectList.map((item,index) => {
                                    const {name,deviceCount,serveCount,createTime,projectId} = item;
                                    return (
                                        <div className="project-item" key={index+index}>
                                            <Link to={{
                                                            pathname:`/open/developCenter/projectManage/detail/${projectId}`,
                                                            search:`?name=${name}`
                                                        }}
                                               className="title">{name}</Link>
                                            <span className="time">{`创建于：${DateTool.utcToDev(+createTime)}`}</span>
                                            <div className="content">
                                                <div className="item">
                                                    <span>关联设备</span>
                                                    <h2>{deviceCount}</h2>
                                                </div>
                                                <div className="item">
                                                    <span>服务</span>
                                                    <h2>{serveCount}</h2>
                                                </div>
                                            </div>
                                            <div className="btns">
                                                <span onClick={() => {setCurRecord({...item});setAddVisible(true)}}>编辑</span>
                                                {/* <span onClick={() => {setCurRecord({...item}); setDeleteVisible(true)}}>删除</span> */}
                                                <span onClick={() => {clickDel({...item})}}>删除</span>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    ) : 
                    <NoSourceWarn tipText="没有项目，请添加"></NoSourceWarn>
                }

            </AloneSection>
            {
                addVisible && 
                <Modal
                    visible={addVisible}
                    width={600}
                    title="新增项目"
                    centered={true}
                    closable={false}
                    onCancel={() => {setCurRecord(null);setAddVisible(false)}}
                    onOk={handleSubmit}
                    destroyOnClose={true}
                    maskClosable={false}
                >
                    <Form {...{ labelCol: { span: 4 }, wrapperCol: { span: 20 } }}
                            labelAlign="left">
                        <Form.Item label="项目名称">
                            {getFieldDecorator('name', {
                                rules: [{ required: true, message: '请输入项目名称' },
                                        { pattern: PATTERN, message: PLACEHOLDER }],
                                initialValue: curRecord ? curRecord.name : ''
                            })(<Input placeholder={PLACEHOLDER} />)
                            }
                        </Form.Item>
                        <Form.Item label="项目描述">
                            {getFieldDecorator('desc', {
                                rules: [{ required: true, message: '请输入项目描述' },
                                        { pattern: PATTERN, message: PLACEHOLDER }],
                                initialValue: curRecord ? curRecord.desc : ''
                            })(<TextArea placeholder={PLACEHOLDER} rows={3}/>)
                            }
                        </Form.Item>
                    </Form>
                </Modal>
            }
            {
                deleteVisible &&
                <ActionConfirmModal visible={deleteVisible}
                                    title={'删除项目'}
                                    needWarnIcon={true}
                                    descText={'即将删除的项目'}
                                    targetName={curRecord.name}
                                    tipText={deleteCant()}
                                    modalCancelHandle={() => {setDeleteVisible(false);setCurRecord(null)}}
                                    modalOKHandle={deleteOkHandle}>

                </ActionConfirmModal>
            }
        </React.Fragment>
    )
}


export default Form.create({ name: 'form_in_modal-project-add' })(ProjectList)