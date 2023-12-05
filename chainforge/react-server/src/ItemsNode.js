import React, { useState, useEffect, useCallback } from 'react';
import { Text } from '@mantine/core';
import useStore from './store';
import NodeLabel from './NodeLabelComponent'
import { IconForms } from '@tabler/icons-react';
import { Handle } from 'reactflow';
import BaseNode from './BaseNode';
import { processCSV } from "./backend/utils"

const ItemsNode = ({ data, id }) => {
    const setDataPropsForNode = useStore((state) => state.setDataPropsForNode);
    const pingOutputNodes = useStore((state) => state.pingOutputNodes);
    const [contentDiv, setContentDiv] = useState(null);
    const [isEditing, setIsEditing] = useState(true);
    const [csvInput, setCsvInput] = useState(null);
    const [countText, setCountText] = useState(null);

    // initializing
    useEffect(() => {
        if (!data.fields) {
            setDataPropsForNode(id, { text: '', fields: [] });
        }
    }, []);

    // Handle a change in a text fields' input.
    const handleInputChange = useCallback((event) => {
        // Update the data for this text fields' id.
        let new_data = { 'text': event.target.value, 'fields': processCSV(event.target.value) };
        setDataPropsForNode(id, new_data);
        pingOutputNodes(id);
    }, [id, pingOutputNodes, setDataPropsForNode]);

    const handKeyDown = useCallback((event) => {
        if (event.key === 'Enter' && data.text && data.text.trim().length > 0) {
            setIsEditing(false);
            setCsvInput(null);
        }
    }, []);

    // handling Div Click
    const handleDivOnClick = useCallback((event) => {
        setIsEditing(true);
    }, []);

    const handleOnBlur = useCallback((event) => {
        if (data.text && data.text.trim().length > 0)
            setIsEditing(false);
    }, [data.text]);

    // render csv div
    const renderCsvDiv = useCallback(() => {
        // Take the data.text as csv (only 1 row), and get individual elements
        const elements = data.fields || [];

        // generate a HTML code that highlights the elements
        const html = [];
        elements.forEach((e, idx) => {
            // html.push(<Badge color="orange" size="lg" radius="sm">{e}</Badge>)
            html.push(<span key={idx} className="csv-element">{e}</span>);
            if (idx < elements.length - 1) {
                html.push(<span key={idx + 'comma'} className="csv-comma">,</span>);
            }
        });

        setContentDiv(
            <div className='csv-div nowheel' onClick={handleDivOnClick}>
                {html}
            </div>
        );
        setCountText(
            <Text size="xs" style={{ marginTop: '5px' }} color='gray' align='right'>{elements.length} elements</Text>
        );
    }, [data.text, handleDivOnClick]);

    // When isEditing changes, add input
    useEffect(() => {
        if (!isEditing && data.text && data.text.trim().length > 0) {
            setCsvInput(null);
            renderCsvDiv();
            return;
        }

        var text_val = data.text || '';
        setCsvInput(
            <div className="input-field" key={id}>
                <textarea id={id} name={id} className="text-field-fixed nodrag csv-input" 
                rows="2" cols="40" 
                defaultValue={text_val} 
                placeholder='Put your comma-separated list here' 
                onKeyDown={handKeyDown} 
                onChange={handleInputChange} 
                onBlur={handleOnBlur} 
                autoFocus={true}/>
            </div>
        );
        setContentDiv(null);
        setCountText(null);
    }, [isEditing, handleInputChange, handleOnBlur, handKeyDown]);

    // when data.text changes, update the content div
    useEffect(() => {
        // When in editing mode, don't update the content div
        if (isEditing || !data.text) return;

        renderCsvDiv();

    }, [id, data.text]);

    return (
    <BaseNode classNames="text-fields-node" nodeId={id}>
        <NodeLabel title={data.title || 'Items Node'} nodeId={id} icon={<IconForms size="16px" />} />
        {csvInput}
        {contentDiv}
        {countText ? countText : <></>}
        <Handle
            type="source"
            position="right"
            id="output"
            className="grouped-handle"
            style={{ top: "50%" }}
        />
    </BaseNode>);
};

export default ItemsNode;