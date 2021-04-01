import React from 'react'

const Loading = (props) => {
    if (props.loading) {
        return (
            <div id="load" className="rvt-flex rvt-justify-center">
                <div className="rvt-loader rvt-loader--lg" aria-label="Content loading"></div><span className="rvt-ts-md rvt-m-left-sm">Loading...</span>
            </div>
        )
    } else {
        return null;
    }
}

export default Loading