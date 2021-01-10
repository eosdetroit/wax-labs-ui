import React, { useState, useEffect } from 'react';
import * as GLOBAL_VARS from '../utils/vars.js';

import {requestedAmountToFloat, getProposals, getStatBounds} from '../utils/util.js'
import useQueryString from '../utils/useQueryString';
import RenderProposalList from "./ProposalList.js";
import RenderLoadingPage from './LoadingPage.js';
import RenderFilter from './Filter.js';
import { Link } from 'react-router-dom';

import { Accordion } from 'react-bootstrap';

import './GenericProposals.scss';


export default function RenderGenericProposals(props) {
    // list of proposals that were got from the query. Supposed to update
    // whenever queryArgs changes.
    const [proposals, setProposals] = useState([]);

    // This is for pagination on RenderProposalList to know if a
    // filter was changed. It needs to change page to 1 if that happens.
    const [filterChanged, setFilterChanged] = useState(false);

    // Flags to know when to display loading page.
    const [querying, setQuerying] = useState(true);
    const [filtering, setFiltering] = useState(true);

    // Filtered proposals is supposed to contain the filtered list of proposals.
    // This is updated whenever proposals, categoriesList, filterString
    // or orderByString changes.
    const [filteredProposals, setFilteredProposals] = useState([]);

    // Hooks regarding filtering of the query. Automatically update query string
    // on set.
    const [categoriesList, setCategoriesList] = useQueryString(GLOBAL_VARS.CATEGORIES_QUERY_STRING_KEY, null);
    const [statusList, setStatusList] = useQueryString(GLOBAL_VARS.STATUS_QUERY_STRING_KEY, props.defaultStatus);
    const [filterString, setFilterString] = useQueryString(GLOBAL_VARS.SEARCH_QUERY_STRING_KEY, "");

    // Hooks regarding ordering of the list. Automatically update query string on set.
    const [orderByString, setOrderByString] = useQueryString(GLOBAL_VARS.ORDER_BY_QUERY_STRING_KEY, GLOBAL_VARS.PROPOSAL_ORDER_BY_LIST[0]);

    
    function filterByStatus(proposal){
        if(!statusList){
            return true;
        } else if (!Array.isArray(statusList)){
            return (statusList === proposal.status)
        } else if (!statusList.length){
            return true
        }else {
            return (statusList.includes(proposal.status))
        }
    }
    function filterByCategories(proposal){
        if(!categoriesList){
            return true;
        } else if (!Array.isArray(categoriesList)){
            return (categoriesList === props.categories[proposal.category])
        } else if (!categoriesList.length){
            return true
        }else {
            return (categoriesList.includes(props.categories[proposal.category]))
        }
    }

    function filterByName(proposal){
        if(!filterString){
            return true;
        } else {
            return (
                proposal.proposer.toLowerCase().includes(filterString.toLowerCase())
                || proposal.title.toLowerCase().includes(filterString.toLowerCase())
                || proposal.description.toLowerCase().includes(filterString.toLowerCase())
            )
        }
    }

    useEffect(()=>{
        setFiltering(true);
        let newFilteredProposals = []
        newFilteredProposals = proposals.slice(0).filter(filterByCategories)
        newFilteredProposals = newFilteredProposals.filter(filterByStatus)
        newFilteredProposals = newFilteredProposals.filter(filterByName)
        newFilteredProposals.sort(proposalComparison);
        setFilteredProposals(newFilteredProposals);
        setFiltering(false);
        //eslint-disable-next-line
    },[categoriesList, proposals, filterString, orderByString, statusList]);

    function proposalComparison(proposalA, proposalB) {
        let [field, mode] = orderByString.split(GLOBAL_VARS.SEPARATOR_ORDER_BY)
        if(field === GLOBAL_VARS.REQUESTED_ORDER_BY_FIELD){
            if(mode === GLOBAL_VARS.ASCENDANT_ORDER_BY_MODE){
                return(
                    requestedAmountToFloat(proposalA.total_requested_funds)
                    - requestedAmountToFloat(proposalB.total_requested_funds)
                )
            } else if(mode === GLOBAL_VARS.DESCENDANT_ORDER_BY_MODE){
                return(
                    requestedAmountToFloat(proposalB.total_requested_funds)
                    - requestedAmountToFloat(proposalA.total_requested_funds)
                )
            }
        } else if(field === GLOBAL_VARS.CREATED_ORDER_BY_FIELD){
            if(mode === GLOBAL_VARS.ASCENDANT_ORDER_BY_MODE){
                return (
                    proposalA.proposal_id - proposalB.proposal_id
                )
            } else if(mode === GLOBAL_VARS.DESCENDANT_ORDER_BY_MODE){
                return(
                    proposalB.proposal_id - proposalA.proposal_id
                )
            }
        }
    }

    useEffect(() => {
        let cancelled = false
        setQuerying(true);
        let promiseList = [];
        // by default search for all proposals
        if(!props.queryArgs){
            promiseList = [
                getProposals("BY_STAT_CAT", GLOBAL_VARS.DRAFTING_KEY, getStatBounds),
                getProposals("BY_STAT_CAT", GLOBAL_VARS.SUBMITTED_KEY, getStatBounds),
                getProposals("BY_STAT_CAT", GLOBAL_VARS.APPROVED_KEY, getStatBounds),
                getProposals("BY_STAT_CAT", GLOBAL_VARS.VOTING_KEY, getStatBounds),
                getProposals("BY_STAT_CAT", GLOBAL_VARS.PROPOSAL_INPROGRESS_KEY, getStatBounds),
                getProposals("BY_STAT_CAT", GLOBAL_VARS.FAILED_KEY, getStatBounds),
                getProposals("BY_STAT_CAT", GLOBAL_VARS.CANCELLED_KEY, getStatBounds),
                getProposals("BY_STAT_CAT", GLOBAL_VARS.COMPLETED_KEY, getStatBounds),
            ];
        } else {
            promiseList = props.queryArgs.map(queryArg => {
                return queryArg.getProposals(queryArg.queryType, queryArg.statusKey, queryArg.getBounds, queryArg.accountName, queryArg.deliverableStatusKeyList);
            });
        }

        Promise.all(promiseList)
        .then(values => {
            let proposalList = []
            values.forEach(list => {
                proposalList = [...proposalList, ...list];
            });
            if(!cancelled){
                setProposals(proposalList);
                setQuerying(false);
            }
        });

        const cleanup = () => { cancelled = true }
        return cleanup
    }, [props.queryArgs]);


    function updateStatusList (newList){
        setFilterChanged(true);
        setStatusList(newList);
    }

    function updateCategoriesList (newList){
        setFilterChanged(true);
        setCategoriesList(newList);
    }

    return (
        <div className="genericProposals">
            <h2>Proposals</h2>
            <h4>{props.subtitle}</h4>
            <div className="genericProposals__filters">
                <div className="genericProposals__search">
                    <div className="input__label">Search</div>
                    <input
                        value={filterString}
                        type="text"
                        onChange={
                            (event) => {
                                setFilterString(event.target.value);
                                setFilterChanged(true);
                            }
                        }
                        placeholder="Proposal's title, description or proposer"
                        className="input"
                    />
                </div>
                <div className="genericProposals__filter">
                    <Accordion>
                        <Accordion.Toggle eventKey="1" className="button button--secondary">
                            More filters
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="1">
                            <div>
                                {
                                    props.noStatusFilter ?
                                    ""
                                    :
                                    <RenderFilter
                                        title="Status Filters"
                                        currentList={statusList}
                                        fullList={GLOBAL_VARS.PROPOSALS_STATUS_KEYS}
                                        updateCurrentList={updateStatusList}
                                        readableNameDict={GLOBAL_VARS.READABLE_PROPOSAL_STATUS}
                                    />
                                }
                                <RenderFilter
                                    title="Category Filters"
                                    currentList={categoriesList}
                                    fullList={props.categories}
                                    updateCurrentList={updateCategoriesList}
                                />
                            </div>
                        </Accordion.Collapse>
                    </Accordion>
                </div>
            </div>
            <div className="genericProposals__actions">
                <div className="genericProposals__createProposal">
                    {
                        !props.showCreateButton ?
                        ""
                        :
                        !props.activeUser ?
                            <p>Log in to create a proposal</p>
                        :
                        !props.profile ?
                            <p>To create a proposal you need to <Link className="inlineLink" to={GLOBAL_VARS.CREATE_PROFILE_LINK}>create your profile</Link></p>
                        :
                            <Link className="button button--primary" to={GLOBAL_VARS.DRAFT_PROPOSAL_LINK}>Create proposal</Link>
                    }
                </div>
                <div className="genericProposals__orderBy">
                    <select
                        value={orderByString}
                        className="select"
                        onChange={(event)=>setOrderByString(event.target.value)}
                    >
                        {GLOBAL_VARS.PROPOSAL_ORDER_BY_LIST.map((option, index) => {
                            return(
                                <option
                                    key={index}
                                    className="select__option"
                                    value={option}
                                >
                                    {GLOBAL_VARS.PROPOSAL_ORDER_BY_OBJECT[option]}
                                </option>
                            )
                        })}
                    </select>
                </div>
            </div>
            <div className="filtered-proposals review-proposals">
                {
                    filtering || querying ?
                    <RenderLoadingPage/>
                    :
                    <RenderProposalList
                        filterChanged = {filterChanged}
                        proposalsList = {filteredProposals}
                        categories = {props.categories}
                        noProposalsMessage={props.noProposalsMessage}
                    />
                }
            </div>
        </div>
    );

    }