import React from 'react';
import Header from '../../open/header/Header';
import './FullScreenFlexWrapper.scss';
import OutsideWrapper from '../../../components/outside-wrapper/OutsideWrapper'

export default function FullScreenFlexWrapper({children,needHeader = true,isInPage=false}) {
    let className = "gray-bg content-wrapper content-flex-column f-s-wrapper" + (isInPage ? ' in-page' : '');

    return (
        <OutsideWrapper limitWidthAndHeight={false}>
            {
                needHeader && <Header onlyLogo={true}></Header>
            }
            <div className={className}>
                <div className="section-bg f-s-content-wrapper">
                    {
                        children
                    }
                </div>
            </div>
        </OutsideWrapper>
    )
}
