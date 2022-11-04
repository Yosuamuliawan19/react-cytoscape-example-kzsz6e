import React, { useState } from 'react';
import './style.css';
import CytoscapeComponent from 'react-cytoscapejs';
import { exports } from './exports';

// {
//   id: 1,
//   env: 0,
//   importer_app_id: 99171,
//   exporter_app_id: 99172,
//   module_id: 353,
//   module_name: 'components',
//   submodule_name: 'then',
//   app_id: 99172,
//   updated_at: 1667546561260,
//   direct: true,
// },
function formatExports(exports) {
  // const submoduleIDmap = {};
  // const moduleIDmap = {};
  // const appIDmap = {};

  const appNodes = {};
  const moduleNodes = {};
  const submoduleNodes = {};

  const edges = {};
  const pushEdge = (edgeData) => {
    const {
      data: { source, target },
    } = edgeData;
    const key = `${source}.to.${target}`;
    edges[key] = edgeData;
    
  };

  exports.map((e) => {
    const submoduleId = `${e.app_id},${e.module_name},${e.submodule_name}`;
    const moduleId = `${e.app_id},${e.module_name}`;

    // submoduleIDmap[submoduleId] = e.submodule_name;
    // moduleIDmap[e.module_id] = e.module_name;

    // Create the nodes
    const importer_node = {
      data: { id: e.importer_app_id, label: e.importer_app_id, type: 'app' },
    };
    const exporter_node = {
      data: { id: e.exporter_app_id, label: e.exporter_app_id, type: 'app' },
    };
    const module_node = {
      data: { id: moduleId, label: e.module_name, type: 'module' },
    };
    const submodule_node = {
      data: { id: submoduleId, label: e.submodule_name, type: 'submodule' },
    };

    // Add the nodes if not exists
    if (!(e.importer_app_id in appNodes)) {
      appNodes[e.importer_app_id] = importer_node;
    }
    if (!(e.exporter_node in appNodes)) {
      appNodes[e.exporter_node] = exporter_node;
    }
    if (!(moduleId in moduleNodes)) {
      moduleNodes[moduleId] = module_node;
    }
    if (!(submoduleId in appNodes)) {
      submoduleNodes[submoduleId] = submodule_node;
    }

    // Add the edges
    pushEdge({
      data: { source: e.exporter_app_id, target: moduleId },
    });
    pushEdge({
      data: { source: moduleId, target: submoduleId },
    });
    pushEdge({
      data: { source: submoduleId, target: e.importer_app_id },
    });
  });
  console.log('Object.values(edges)', Object.values(edges))
  return {
    nodes: [
      ...Object.values(appNodes),
      ...Object.values(moduleNodes),
      ...Object.values(submoduleNodes),
    ],
    edges: Object.values(edges),
  };
}

export default function App() {
  const [width, setWith] = useState('100%');
  const [height, setHeight] = useState('400px');
  const newGraphData = formatExports(exports);
  const [graphData, setGraphData] = useState({
    nodes: [
      { data: { id: '1', label: 'IP 1', type: 'ip' } },
      { data: { id: '2', label: 'Device 1', type: 'device' } },
      { data: { id: '3', label: 'IP 2', type: 'ip' } },
      { data: { id: '4', label: 'Device 2', type: 'device' } },
      { data: { id: '5', label: 'Device 3', type: 'device' } },
      { data: { id: '6', label: 'IP 3', type: 'ip' } },
      { data: { id: '7', label: 'Device 5', type: 'device' } },
      { data: { id: '8', label: 'Device 6', type: 'device' } },
      { data: { id: '9', label: 'Device 7', type: 'device' } },
      { data: { id: '10', label: 'Device 8', type: 'device' } },
      { data: { id: '11', label: 'Device 9', type: 'device' } },
      { data: { id: '12', label: 'IP 3', type: 'ip' } },
      { data: { id: '13', label: 'Device 10', type: 'device' } },
    ],
    edges: [
      {
        data: { source: '1', target: '2', label: 'Node2' },
      },
      {
        data: { source: '3', target: '4', label: 'Node4' },
      },
      {
        data: { source: '3', target: '5', label: 'Node5' },
      },
      {
        data: { source: '6', target: '5', label: ' 6 -> 5' },
      },
      {
        data: { source: '6', target: '7', label: ' 6 -> 7' },
      },
      {
        data: { source: '6', target: '8', label: ' 6 -> 8' },
      },
      {
        data: { source: '6', target: '9', label: ' 6 -> 9' },
      },
      {
        data: { source: '3', target: '13', label: ' 3 -> 13' },
      },
    ],
  });

  const layout = {
    name: 'breadthfirst',
    fit: true,
    // circle: true,
    directed: true,
    padding: 50,
    // spacingFactor: 1.5,
    animate: true,
    animationDuration: 1000,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: false,
  };

  const styleSheet = [
    {
      selector: 'node',
      style: {
        backgroundColor: '#4a56a6',
        width: 30,
        height: 30,
        label: 'data(label)',

        // "width": "mapData(score, 0, 0.006769776522008331, 20, 60)",
        // "height": "mapData(score, 0, 0.006769776522008331, 20, 60)",
        // "text-valign": "center",
        // "text-halign": "center",
        'overlay-padding': '6px',
        'z-index': '10',
        //text props
        'text-outline-color': '#4a56a6',
        'text-outline-width': '2px',
        color: 'white',
        fontSize: 20,
      },
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': '6px',
        'border-color': '#AAD8FF',
        'border-opacity': '0.5',
        'background-color': '#77828C',
        width: 50,
        height: 50,
        //text props
        'text-outline-color': '#77828C',
        'text-outline-width': 8,
      },
    },
    {
      selector: "node[type='device']",
      style: {
        shape: 'rectangle',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 3,
        // "line-color": "#6774cb",
        'line-color': '#AAD8FF',
        'target-arrow-color': '#6774cb',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
      },
    },
    {
      selector: 'edge',
      style: {
        label: 'data(label)', // maps to data.label
        color: 'white',
        fontSize: 20,
        'text-outline-color': '#4a56a6',
        'text-outline-width': '2px',
      },
    },
  ];

  let myCyRef;

  return (
    <>
      <div>
        <h1>Cytoscape example</h1>
        <div
          style={{
            border: '1px solid',
            backgroundColor: '#f5f6fe',
          }}
        >
          <CytoscapeComponent
            elements={CytoscapeComponent.normalizeElements(newGraphData)}
            // pan={{ x: 200, y: 200 }}
            style={{ width: width, height: height }}
            zoomingEnabled={true}
            maxZoom={3}
            minZoom={0.1}
            autounselectify={false}
            boxSelectionEnabled={true}
            layout={layout}
            stylesheet={styleSheet}
            cy={(cy) => {
              myCyRef = cy;

              console.log('EVT', cy);

              cy.on('tap', 'node', (evt) => {
                var node = evt.target;
                console.log('EVT', evt);
                console.log('TARGET', node.data());
                console.log('TARGET TYPE', typeof node[0]);
              });
            }}
            abc={console.log('myCyRef', myCyRef)}
          />
        </div>
      </div>
    </>
  );
}
