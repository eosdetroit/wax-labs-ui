import React, {useState} from 'react';
import {
Link
} from 'react-router-dom';

import * as globals from "../utils/vars"

export default function RenderProposalGrid(props){    
    const [imgError, setImgError] = useState(false);
    
    const proposal = props.proposal;
    const readableAmount = proposal.total_requested_funds.slice(0,-13) + ' WAX';

    return (
        <Link to={'/proposals/' + proposal.proposal_id} className="proposal-grid-single">
            <div className="image">
                <img onError={()=>{setImgError(true); console.log("error")}} src={imgError ? globals.DEFAULT_PROPOSAL_IMAGE_URL : proposal.image_url} alt="Cover" />
            </div>
            <div className="body">
                <div className="title">
                    <h3>{proposal.title} <span className="proposal-id">(#{proposal.proposal_id})</span></h3>
                    <div className="description"><em>{proposal.description}</em></div>
                </div>
                <div className="row">
                    <div className="cell"><strong>Status:</strong> {globals.READABLE_PROPOSAL_STATUS[proposal.status]}</div>
                    <div className="cell"><strong>Category:</strong> <span>{proposal.category}</span></div>
                </div>
                <div className="row">
                    <div className="cell"><strong>Proposer:</strong> {proposal.proposer}</div>
                    <div className="cell"><strong>Requested Amount:</strong> {readableAmount}</div>
                </div>
                <div className="row">
                    <div className="cell"><strong>Deliverables:</strong> {proposal.deliverables}</div>
                </div>
            </div>
        </Link>
    );
}