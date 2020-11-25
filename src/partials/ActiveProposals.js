import React, { useState, useEffect } from 'react';
import * as waxjs from "@waxio/waxjs/dist";

import RenderProposalGrid from "./ProposalGridSingle.js";
import RenderProposalFilter from "./ProposalFilter.js";

const wax = new waxjs.WaxJS(process.env.REACT_APP_WAX_RPC, null, null, false);
export default function RenderActiveProposals(props) {
    const [proposals, setProposals ] = useState();

    
    useEffect(() => {
        let proposalsArray = []
        async function getActiveProposals() {
        try {
            let votingResp = await wax.rpc.get_table_rows({             
                  code: 'labs',
                  scope: 'labs',
                  table: 'proposals',
                  json: true,
                  index_position: 'fourth', //status
                  lower_bound: 'voting',
                  upper_bound: 'voting',
                  key_type: 'name'
              });
            
            if (votingResp.rows.length) {
                votingResp.rows.forEach(function (element) {
                    proposalsArray = [...proposalsArray, element];
                    setProposals(proposalsArray);
                    });
            }
            
            let inprogResp = await wax.rpc.get_table_rows({             
                code: 'labs',
                scope: 'labs',
                table: 'proposals',
                json: true,
                index_position: 'fourth', //status
                lower_bound: 'inprogress',
                upper_bound: 'inprogress',
                key_type: 'name'
            });

            if (inprogResp.rows.length) {
                inprogResp.rows.forEach(function (element) {
                    proposalsArray = [...proposalsArray, element];
                    setProposals(proposalsArray);
                    });
            }
            
            } catch(e) {
              console.log(e);
            }
        }
        getActiveProposals();
        }, []);

    if (!proposals){
        return (
            <div className="proposals-body">
                <h2>Proposals</h2>
                <RenderProposalFilter activeUser={props.activeUser} status="active" isAdmin={props.isAdmin} />
                <div className="filtered-proposals active">
                    <h3>Active Proposals</h3>
                    <p>There are currently no active proposals.</p>
                </div>
            </div>
        );
    } else {
        return (
            <div className="proposals-body">
                <h2>Proposals</h2>
                <RenderProposalFilter activeUser={props.activeUser} status="active" isAdmin={props.isAdmin} />
                <div className="filtered-proposals active">
                    <h3>Active Proposals</h3>
                    {proposals.map((proposal) =>
                    <RenderProposalGrid proposal={proposal} key={proposal.proposal_id} />)}
                </div>
            </div>
            );
        }
    }