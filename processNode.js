import React, { Component } from 'react';
import { View, Text } from 'react-native';

import styles from './styles';

const BLOCK_ELEMENTS = ['blockquote', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'ol', 'p', 'pre', 'ul', 'li'];
const INLINE_ELEMENTS = ['b', 'i', 'em', 'strong', 'a', 'br', 'q', 'span', 'sub', 'sup'];

function styleForTag(tagName) {
    return styles[tagName] ? styles[tagName] : styles['default'];
}

function isText(node) {
    return node && node.nodeName === '#text';
}

function isBlockElement(node) {
    return node && BLOCK_ELEMENTS.includes(node.nodeName);
}

function isInlineElement(node) {
    return node && INLINE_ELEMENTS.includes(node.nodeName);
}

function processTextNode(node, parentKey, style) {
    const key = `${parentKey}_text`;
    return <Text key={key} style={style}>{node.value}</Text>;
}

function processInlineNode(node, parentKey, style) {
    const key = `${parentKey}_${node.nodeName}`;
    const children = node.childNodes
        .filter((node) => isInlineElement(node) || isText(node))
        .map((node, index) => processNode(node, `${key}_${index}`, style));

    return <Text key={key} style={[styleForTag(node.nodeName), style]}>{children}</Text>;
}

function processBlockNode(node, parentKey, style) {
    const key = `${parentKey}_${node.nodeName}`;
    const children = [];
    let lastInlineNodes = [];

    node.childNodes.forEach((childNode, index) => {
        const child = processNode(childNode, `${key}_${index}`, style);

        if (isInlineElement(childNode) || isText(childNode)) {
            lastInlineNodes.push(child);
        } else if (isBlockElement(childNode)) {
            if (lastInlineNodes.length > 0) {
                children.push(lastInlineNodes);
                lastInlineNodes = [];
            }

            children.push(child);
        }
    });

    if (lastInlineNodes.length > 0) {
        children.push(lastInlineNodes);
    }

    return <Text key={key} style={[styleForTag(node.nodeName), style]}>{children}</Text>;
}

function processNode(node, parentKey, style) {
    if (isText(node)) {
        return processTextNode(node, parentKey, style);
    }

    if (isInlineElement(node)) {
        return processInlineNode(node, parentKey, style);
    }

    if (isBlockElement(node)) {
        return processBlockNode(node, parentKey, style);
    }

    return null;
}

export default processNode;
