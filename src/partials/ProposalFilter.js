import React from 'react';
import {
Link
} from 'react-router-dom';

export default function RenderProposalFilter(props) {
    return (
    <div className="proposals-menu">
        {props.activeUser ?
        <Link to="/proposals/new">New Proposal</Link>
        :
        <></>
        }
        <ul>
        {props.activeUser ?
        <>    
            <li><Link to="/proposals/my-proposals">My Proposals</Link></li>
            <li><Link to="/proposals/my-drafts">My Draft Proposals</Link></li>
        </>
        :
        <></>
        }
        {props.activeUser && props.isAdmin ?
        <>
            <li><Link to="/proposals/in-review">In Review Proposals</Link></li>
        </>
        :
        <></>
        }
        </ul>
        <h3>Active Proposals</h3>
        <ul>
            <li><Link to="/proposals">All Active Proposals</Link></li>
            <li><Link to="/proposals/vote">In Vote Proposals</Link></li>
            <li><Link to="/proposals/in-progress">In Progress Proposals</Link></li>
        </ul>
        <h3>Archived Proposals</h3>
        <ul>
            <li><Link to="/proposals/archived">All Archived Proposals</Link></li>
            <li><Link to="/proposals/archived/completed">Completed Proposals</Link></li>
            <li><Link to="/proposals/archived/rejected">Rejected Proposals</Link></li>
        </ul>
    </div>
    );
}