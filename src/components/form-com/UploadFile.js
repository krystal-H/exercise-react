import * as React from "react";
import { Upload, Icon } from "antd";
import { post, Paths } from '../../api';

const defaultData = {
    appId:31438,
    domainType:4
};
const timeout = 1000*30;
const url = Paths.upFileUrl;

/**
 *  onChange: (value) => any
 *  value: string | string[]      
 *  type: "multiple" | undefined  默认undefined，设置为multiple后value返回string[]
 *  
 */

class UploadFile extends React.Component {
    state = {
        value: []
    };

    // 上传图片
    handlUpload = ({file}) => {
        const { onChange, value, type } = this.props;
        post(url, {...defaultData, file}, {needFormData:true,loading:true}, {timeout}).then(res => {
            if(res.code === 0 && res.data && res.data.url){
                if(typeof onChange === "function"){
                    onChange( type === "multiple" ? [...this.state.value, res.data.url] : res.data.url)
                }
                // 受控组件不改变值
                if (typeof value !== "undefined") {
                    return;
                }
                this.setState({
                    value: type === "multiple" ? [...this.state.value, res.data.url] : [res.data.url] 
                });
            }
        })
    }

    // 图片修改
    handleChange = ({file}) => {
        if(file && file.status === "removed"){
            const { value, onChange, type } = this.props;
            const list = this.state.value.filter((item) => item !== file.url);
            if(typeof onChange === "function"){
                onChange(type === "multiple" ? list : "")
            }
            // 受控组件不改变值
            if (typeof value !== "undefined") {
                return;
            }
            this.setState({
                value: list
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        const { value } = nextProps;
        if (this.props.value !== value) {
            this.setState({
                value: Array.isArray(value) ? value : value ? [value] : []
            })
        }
    }

    render() {
        const { maxLength } = this.props;
        const { value } = this.state;
        const fileList = value.filter(Boolean).map((item, index) => {
            return {
                uid: -index + "",
                name: "image.png",
                status: "done",
                url: item
            };
        });
        const uploadBtn = !maxLength || fileList.length < maxLength ? 
                <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">上传图片</div>
                </div> : null

        return (
            <Upload
                className="upload-file"
                customRequest={this.handlUpload}
                listType="picture-card"
                fileList={fileList}
                onChange={this.handleChange}
            >
                {uploadBtn}
            </Upload>
        );
    }
}

export default UploadFile;
