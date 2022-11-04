import React, { useState } from 'react';
import './style.css';
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import { exports, app_dictionary } from './exports';
import klay from 'cytoscape-klay';
import { Input, Button } from 'antd';

Cytoscape.use(klay);

function formatExports(exports, app_dictionary) {
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

    // Create the nodes
    const importer_node = {
      data: {
        id: e.importer_app_id,
        label: app_dictionary[e.importer_app_id],
        type: 'app',
      },
    };
    const exporter_node = {
      data: {
        id: e.exporter_app_id,
        label: app_dictionary[e.exporter_app_id],
        type: 'app',
      },
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
  console.log('Object.values(edges)', Object.values(edges));
  return {
    nodes: [
      ...Object.values(appNodes),
      ...Object.values(moduleNodes),
      ...Object.values(submoduleNodes),
    ],
    edges: Object.values(edges),
  };
}

function filterGraphData(graphData, keyword) {
  const existingNode = new Set();
  const nodes = graphData.nodes
    .map((node) => {
      if (
        node.data.type === 'app' ||
        node.data.type === 'module' ||
        node.data.label?.includes(keyword)
      ) {
        existingNode.add(node.data.id);
        return node;
      }
      return null;
    })
    .filter(Boolean);
  const edges = graphData.edges
    .map((edge) => {
      if (
        existingNode.has(edge.data.source) &&
        existingNode.has(edge.data.target)
      ) {
        return edge;
      }
      return null;
    })
    .filter(Boolean);

  return {
    nodes: nodes,
    edges: edges,
  };
}

export default function App() {
  const [width, setWith] = useState('100%');
  const [height, setHeight] = useState('400px');
  const [key, setKey] = useState(0);
  const newGraphData = React.useMemo(
    () => formatExports(exports, app_dictionary),
    []
  );
  const [searchText, setSearchText] = useState('');

  const [graphData, setGraphData] = useState({
    nodes: [],
    edges: [],
  });

  const layout = {
    name: 'klay',
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
      selector: "node[type='app']",
      style: {
        shape: 'rectangle',
        'background-color': 'orange',
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

  React.useEffect(() => {
    setGraphData(filterGraphData(newGraphData, 'User'));
    setKey(key + 1);
  }, []);

  console.log(searchText, graphData);
  return (
    <>
      <div>
        <h1>Remote module explorer example</h1>
        <input
          placeholder="Type submodule name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <button
          onClick={() => {
            setGraphData(filterGraphData(newGraphData, searchText));
            setKey(key + 1);
          }}
        >
          search
        </button>
        <div
          key={key}
          style={{
            border: '1px solid',
            backgroundColor: '#f5f6fe',
          }}
        >
          <CytoscapeComponent
            elements={CytoscapeComponent.normalizeElements(graphData)}
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
