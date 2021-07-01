import React, { useEffect, useCallback, useState } from 'react'
import Header from './components/header/Header'
import Playground from './components/playground/Playground';
import SqlAnalysis from './components/sql-analysis/SqlAnalysis'
import SqlLink from './components/sql-link/SqlLink'
import {useParams} from 'react-router-dom'
import { getUrlParam } from '../../util/util';

import './DataAnalysisi.scss'
import { get, Paths } from '../../api';

export default function DataAnalysisi() {

    const {projectId,serviceId} = useParams(),
          name = decodeURI(getUrlParam('name')),
          desc = decodeURI(getUrlParam('desc')),
          analysisiType = +decodeURI(getUrlParam('analysisiType') || 1)

    const [testEnv,setTestEnv] = useState(0)

    const getServeStatu = useCallback( () => {
        get(Paths.getServeStatu,{
            serveId:serviceId
        }).then( data => {
                if(data && data.data) {
                    setTestEnv(data.data.testEnv)
                }
            }
        )
    },[serviceId])

    // useEffect( () => {

    //     if (analysisiType === 3) {
    //         getServeStatu()
    //     }
        
    // },[analysisiType,getServeStatu])

    return (
        <section className="data-analysis-wrapper flex-column">
            <Header dataAnalysisName={name} analysisiType={analysisiType} testEnv={+testEnv}></Header>
            <section className="flex1">
                {
                    analysisiType === 3 ?//数据分析
                    <SqlAnalysis service={{name,desc,serviceId,projectId}} getServeStatu={getServeStatu}></SqlAnalysis>
                    :
                    analysisiType === 4 ?//SQL实时流
                    <SqlLink service={{name,desc,serviceId,projectId}}></SqlLink>
                    ://节点实时流
                    <Playground service={{name,desc,serviceId,projectId}}></Playground>
                }

            </section>
        </section>
    )
}
