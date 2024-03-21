
const vue_x_gap = 50;
const vue_y_gap = 20;
let vue_flow_init_props = {};
let vue_flow_root = "";
const getVueFlowNodeVirtualHeight = (parentNodeId, getNode) => {
    let childrenHeight = 0;
    let lastIndex = vue_flow_init_props[parentNodeId].childrenNode.length - 1;
    let vue_y_gapsHeight = lastIndex * vue_y_gap;
    let firstNode = 0;
    let lastNode = 0;
    vue_flow_init_props[parentNodeId].childrenNode.forEach((nodeId, index) => {
        const node = getNode.value(nodeId);
        if (vue_flow_init_props[nodeId]) {
            getVueFlowNodeVirtualHeight(nodeId, getNode);
            childrenHeight +=
                vue_flow_init_props[nodeId].virtualHeight > node.dimensions.height
                    ? vue_flow_init_props[nodeId].virtualHeight
                    : node.dimensions.height;
        } else {
            childrenHeight += node.dimensions.height;
        }

        if (index == 0) {
            if (vue_flow_init_props[nodeId]) {
                firstNode = vue_flow_init_props[nodeId].movingDistance;
            } else {
                firstNode = node.dimensions.height / 2;
            }
        }

        if (lastIndex == index) {
            if (vue_flow_init_props[nodeId]) {
                lastNode =
                    vue_flow_init_props[nodeId].virtualHeight - vue_flow_init_props[nodeId].movingDistance;
            } else {
                lastNode = node.dimensions.height / 2;
            }
        }
    });
    childrenHeight += vue_y_gapsHeight;
    const parentNode = getNode.value(parentNodeId);
    vue_flow_init_props[parentNodeId].virtualHeight = childrenHeight;
    if (childrenHeight > parentNode.dimensions.height) {
        vue_flow_init_props[parentNodeId].movingDistance =
            firstNode + (childrenHeight - firstNode - lastNode) / 2;
    } else {
        vue_flow_init_props[parentNodeId].movingDistance = parentNode.dimensions.height / 2;
        vue_flow_init_props[parentNodeId].virtualMovingDistance =
            firstNode + (childrenHeight - firstNode - lastNode) / 2;
    }
};

const setVueFlowNodeFitView = (parentNodeId, x, y, getNode) => {
    const node = getNode.value(parentNodeId);
    let innerY = y;
    let innerX = x + node.dimensions.width + vue_x_gap;
    if (vue_flow_init_props[parentNodeId]) {
        if (vue_flow_init_props[parentNodeId].virtualHeight <= node.dimensions.height) {
            innerY +=
                node.dimensions.height / 2 -
                vue_flow_init_props[parentNodeId].virtualMovingDistance;
        }
        vue_flow_init_props[parentNodeId].childrenNode.forEach((nodeId) => {
            const innerNode = getNode.value(nodeId);
            if (vue_flow_init_props[nodeId]) {
                const movingDistance =
                    vue_flow_init_props[nodeId].movingDistance - innerNode.dimensions.height / 2;
                if (movingDistance < 0) {
                    innerY += Math.abs(movingDistance);
                }
            }
            setVueFlowNodeFitView(nodeId, innerX, innerY, getNode);
            if (vue_flow_init_props[nodeId]) {
                innerY +=
                    (vue_flow_init_props[nodeId].virtualHeight > innerNode.dimensions.height
                        ? vue_flow_init_props[nodeId].virtualHeight
                        : innerNode.dimensions.height) + vue_y_gap;
            } else {
                innerY += innerNode.dimensions.height + vue_y_gap;
            }
        });
        node.position.y =
            y + vue_flow_init_props[parentNodeId].movingDistance - node.dimensions.height / 2;
    } else {
        node.position.y = y;
    }
    node.position.x = x;
};

export function vueFlowSetRoot(root) {
    vue_flow_root = root;
    vue_flow_init_props = {};
}

export function vueFlowInit(
    getNode,
    getNodes,
    addNodes,
    addEdges,
    nodes,
    edges,
    onPaneReady,
    setViewport) {
    edges.value.forEach((edge) => {
        const source = vue_flow_init_props[edge.source];
        if (source) {
            source.childrenNode.push(edge.target);
        } else {
            vue_flow_init_props[edge.source] = {};
            vue_flow_init_props[edge.source]["virtualHeight"] = 0;
            vue_flow_init_props[edge.source]["movingDistance"] = 0;
            vue_flow_init_props[edge.source]["virtualMovingDistance"] = 0;
            vue_flow_init_props[edge.source]["childrenNode"] = [edge.target];
        }
    });

    nodes.value.forEach((node) => {

        if (node.id == vue_flow_root) {
            node.type = "input";
        }
        if (!vue_flow_init_props[node.id]) {
            node.type = "output";
        }
    });

    onPaneReady(() => {
        getVueFlowNodeVirtualHeight(vue_flow_root, getNode);
        setVueFlowNodeFitView(vue_flow_root, 0, 0, getNode);
        setViewport({ x: 0, y: 0, zoom: 1 });
    });
}
