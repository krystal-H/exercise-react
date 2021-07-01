import React from 'react'
import {Form} from 'antd'
import {NODE_TYPES} from '../nodes-container/configs'

import DataInput from './forms/dataInput'
import DataFilter from './forms/datafilter'
import DataCacl from './forms/datacacl'
import ErrorCheck from './forms/errorcheck'
import DataRelated from './forms/datarelated'
import DataOutPut from './forms/dataoutput'


export default function FormFactory({
 ...props
}) {
    const {nodeType} = props;

    switch (nodeType) {
        case NODE_TYPES.DATA_INPUT:
            return <DataInputForm  {...props}></DataInputForm>    
        case NODE_TYPES.DATA_FILTER:
            return <DataFilterForm {...props}></DataFilterForm>    
        case NODE_TYPES.DATA_CACL:
            return <DataCaclForm {...props}></DataCaclForm>   
        case NODE_TYPES.ERROR_CHECK:
            return <ErrorCheckForm {...props}></ErrorCheckForm>   
        case NODE_TYPES.TABLE_RELATED:
            return <DataRelatedForm {...props}></DataRelatedForm>   
        case NODE_TYPES.DATA_OUTPUT:
            return <DataOutPutForm {...props}></DataOutPutForm>   
        default:
            return <span>未识别节点</span>
    }
}


const commonWrapper = function(formName,FormComponent) {

    return Form.create({ 
        name: formName,
        onFieldsChange: (props, changedFields, allFields) => {
            const {changeNodeDataByIds,id,input} = props,
                  {name,value,errors,dirty} = Object.values(changedFields)[0]
            
            changeNodeDataByIds([id],[{
                input:{
                    [name]:value
                }
            }])
        }
    })(
        FormComponent
    )
} 

const DataInputForm = commonWrapper('form_for_dataInput',
    DataInput
)

const DataFilterForm = commonWrapper('form_for_dataFilter',
    DataFilter
)

const DataCaclForm = commonWrapper('form_for_datacacl',
    DataCacl
)

const ErrorCheckForm = commonWrapper('form_for_errorcheck',
    ErrorCheck
)

const DataRelatedForm = commonWrapper('form_for_datarelated',
    DataRelated
)
const DataOutPutForm = commonWrapper('form_for_dataoutput',
    DataOutPut
)