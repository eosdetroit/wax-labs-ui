import React from 'react';
import {
Link
} from 'react-router-dom';
import * as waxjs from "@waxio/waxjs/dist";

import RenderProposalGridSingle from "./ProposalGridSingle.js";

const wax = new waxjs.WaxJS(process.env.REACT_APP_WAX_RPC, null, null, false);

class RenderInProgressProposals extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div className="filtered-proposals in-progress">
                <h2>Active Proposals: In Progress</h2>
            </div>
        );
    }

}

export default RenderInProgressProposals;