import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

// AWS Service Icons (using simple colored boxes with labels for now)
const AWSServiceNode = ({ data }) => {
  const getServiceColor = (type) => {
    const colors = {
      'VPC': '#FF9900',
      'Subnet': '#87CEEB',
      'EC2': '#FF9900',
      'RDS': '#3F48CC',
      'SecurityGroup': '#90EE90',
      'APIGateway': '#8C4FFF',
      'Region': '#FF6B6B'
    };
    return colors[type] || '#666';
  };

  const getServiceIcon = (type) => {
    const icons = {
      'VPC': '🏗️',
      'Subnet': '🔗',
      'EC2': '💻',
      'RDS': '🗄️',
      'SecurityGroup': '🛡️',
      'APIGateway': '🚪',
      'Region': '🌍'
    };
    return icons[type] || '📦';
  };

  return (
    <div
      style={{
        background: getServiceColor(data.type),
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        minWidth: '140px',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        border: '2px solid #fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'relative'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <div style={{ marginBottom: '6px', fontSize: '16px' }}>{getServiceIcon(data.type)}</div>
      <div style={{ marginBottom: '4px' }}>{data.type}</div>
      <div style={{ fontSize: '10px', opacity: 0.9, wordBreak: 'break-word' }}>
        {data.label}
      </div>
      {data.details && (
        <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '4px' }}>
          {data.details}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

const nodeTypes = {
  awsService: AWSServiceNode,
};

const AWSInfraDiagram = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [configInput, setConfigInput] = useState('');

  // Your actual AWS config
  const actualConfig = {
    "Version": "1.0",
    "Regions": {
      "us-east-1": {
        "VPCs": [
          {
            "VpcId": "vpc-0123abcd",
            "CidrBlock": "10.0.0.0/16",
            "Subnets": [
              {
                "SubnetId": "subnet-01a2bc34",
                "CidrBlock": "10.0.1.0/24",
                "AvailabilityZone": "us-east-1a"
              },
              {
                "SubnetId": "subnet-02b3cd45",
                "CidrBlock": "10.0.2.0/24",
                "AvailabilityZone": "us-east-1b"
              }
            ],
            "SecurityGroups": [
              {
                "GroupId": "sg-1234abcd",
                "GroupName": "PaloAltoFirewallSG",
                "IngressRules": [
                  {
                    "Protocol": "TCP",
                    "PortRange": "80",
                    "Source": "0.0.0.0/0"
                  },
                  {
                    "Protocol": "TCP",
                    "PortRange": "443",
                    "Source": "0.0.0.0/0"
                  }
                ],
                "EgressRules": [
                  {
                    "Protocol": "All",
                    "PortRange": "All",
                    "Destination": "0.0.0.0/0"
                  }
                ]
              }
            ]
          }
        ],
        "Instances": [
          {
            "InstanceId": "i-0a1b2c3d4e",
            "InstanceType": "c5.large",
            "AMI": "ami-06f7a63d7481d0ded",
            "Tags": {
              "Name": "PaloAltoFirewall",
              "Role": "Firewall"
            },
            "PrivateIpAddress": "10.0.1.10"
          },
          {
            "InstanceId": "i-1234abcd5678",
            "InstanceType": "t2.micro",
            "AMI": "ami-06f7a63d7481d0ded",
            "Tags": {
              "Name": "ApacheWebServer",
              "Role": "WebServer"
            },
            "PrivateIpAddress": "10.0.2.10"
          }
        ],
        "APIGateway": {
          "Id": "api-1234abcd",
          "Name": "CustomerAPI",
          "Endpoints": [
            {
              "Type": "REST",
              "Stage": "prod",
              "Url": "https://api.example.com/prod"
            }
          ]
        }
      },
      "us-west-2": {
        "VPCs": [
          {
            "VpcId": "vpc-0987abcd",
            "CidrBlock": "192.168.0.0/16",
            "Subnets": [
              {
                "SubnetId": "subnet-03c4de56",
                "CidrBlock": "192.168.1.0/24",
                "AvailabilityZone": "us-west-2a"
              },
              {
                "SubnetId": "subnet-04d5ef67",
                "CidrBlock": "192.168.2.0/24",
                "AvailabilityZone": "us-west-2b"
              }
            ],
            "SecurityGroups": [
              {
                "GroupId": "sg-5678efgh",
                "GroupName": "AppServerSG",
                "IngressRules": [
                  {
                    "Protocol": "TCP",
                    "PortRange": "22",
                    "Source": "192.168.0.0/16"
                  },
                  {
                    "Protocol": "TCP",
                    "PortRange": "3306",
                    "Source": "192.168.0.0/16"
                  }
                ],
                "EgressRules": [
                  {
                    "Protocol": "All",
                    "PortRange": "All",
                    "Destination": "0.0.0.0/0"
                  }
                ]
              }
            ]
          }
        ],
        "Instances": [
          {
            "InstanceId": "i-0987c6d5e4",
            "InstanceType": "m5.large",
            "AMI": "ami-06f7a63d7481d0ded",
            "Tags": {
              "Name": "AppServer",
              "Role": "Application"
            },
            "PrivateIpAddress": "192.168.1.10"
          }
        ],
        "RDS": {
          "DBInstanceId": "db-1234abcd",
          "DBInstanceClass": "db.t3.medium",
          "Engine": "MySQL",
          "Endpoint": "db.example.us-west-2.rds.amazonaws.com",
          "Port": 3306
        }
      }
    }
  };

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  // Function to parse the complex AWS config and create nodes/edges
  const parseAWSConfig = useCallback((config) => {
    const nodes = [];
    const edges = [];
    let nodeIndex = 0;

    // Helper function to create positions in a grid
    const getPosition = (index, offsetX = 0, offsetY = 0) => ({
      x: (index % 3) * 200 + offsetX,
      y: Math.floor(index / 3) * 180 + offsetY
    });

    Object.entries(config.Regions || {}).forEach(([regionName, regionData], regionIndex) => {
      // Create region node
      const regionNodeId = `region-${regionName}`;
      nodes.push({
        id: regionNodeId,
        type: 'awsService',
        position: getPosition(regionIndex, regionIndex * 800, 50),
        data: {
          type: 'Region',
          label: regionName,
          details: `AWS Region`
        }
      });

      let currentY = 250 + (regionIndex * 600);

      // Process VPCs
      regionData.VPCs?.forEach((vpc, vpcIndex) => {
        const vpcNodeId = `vpc-${vpc.VpcId}`;
        nodes.push({
          id: vpcNodeId,
          type: 'awsService',
          position: { x: regionIndex * 800 + 50, y: currentY },
          data: {
            type: 'VPC',
            label: vpc.VpcId,
            details: vpc.CidrBlock
          }
        });

        // Connect region to VPC
        edges.push({
          id: `edge-${regionNodeId}-${vpcNodeId}`,
          source: regionNodeId,
          target: vpcNodeId,
          type: 'smoothstep',
          style: { stroke: '#666', strokeWidth: 2 }
        });

        // Process Subnets
        vpc.Subnets?.forEach((subnet, subnetIndex) => {
          const subnetNodeId = `subnet-${subnet.SubnetId}`;
          nodes.push({
            id: subnetNodeId,
            type: 'awsService',
            position: { 
              x: regionIndex * 800 + 250 + (subnetIndex * 180), 
              y: currentY 
            },
            data: {
              type: 'Subnet',
              label: subnet.SubnetId,
              details: `${subnet.CidrBlock} (${subnet.AvailabilityZone})`
            }
          });

          // Connect VPC to Subnet
          edges.push({
            id: `edge-${vpcNodeId}-${subnetNodeId}`,
            source: vpcNodeId,
            target: subnetNodeId,
            type: 'smoothstep',
            style: { stroke: '#87CEEB', strokeWidth: 1 }
          });
        });

        // Process Security Groups
        vpc.SecurityGroups?.forEach((sg, sgIndex) => {
          const sgNodeId = `sg-${sg.GroupId}`;
          nodes.push({
            id: sgNodeId,
            type: 'awsService',
            position: { 
              x: regionIndex * 800 + 50 + (sgIndex * 180), 
              y: currentY + 150 
            },
            data: {
              type: 'SecurityGroup',
              label: sg.GroupName,
              details: `${sg.IngressRules?.length || 0} ingress, ${sg.EgressRules?.length || 0} egress`
            }
          });

          // Connect VPC to Security Group
          edges.push({
            id: `edge-${vpcNodeId}-${sgNodeId}`,
            source: vpcNodeId,
            target: sgNodeId,
            type: 'smoothstep',
            style: { stroke: '#90EE90', strokeWidth: 1 }
          });
        });

        currentY += 300;
      });

      // Process EC2 Instances
      regionData.Instances?.forEach((instance, instanceIndex) => {
        const instanceNodeId = `instance-${instance.InstanceId}`;
        nodes.push({
          id: instanceNodeId,
          type: 'awsService',
          position: { 
            x: regionIndex * 800 + 400 + (instanceIndex * 180), 
            y: currentY 
          },
          data: {
            type: 'EC2',
            label: instance.Tags?.Name || instance.InstanceId,
            details: `${instance.InstanceType} (${instance.PrivateIpAddress})`
          }
        });

        // Connect to region
        edges.push({
          id: `edge-${regionNodeId}-${instanceNodeId}`,
          source: regionNodeId,
          target: instanceNodeId,
          type: 'smoothstep',
          style: { stroke: '#FF9900', strokeWidth: 2 }
        });
      });

      // Process RDS
      if (regionData.RDS) {
        const rdsNodeId = `rds-${regionData.RDS.DBInstanceId}`;
        nodes.push({
          id: rdsNodeId,
          type: 'awsService',
          position: { x: regionIndex * 800 + 100, y: currentY + 150 },
          data: {
            type: 'RDS',
            label: regionData.RDS.DBInstanceId,
            details: `${regionData.RDS.Engine} ${regionData.RDS.DBInstanceClass}`
          }
        });

        // Connect to region
        edges.push({
          id: `edge-${regionNodeId}-${rdsNodeId}`,
          source: regionNodeId,
          target: rdsNodeId,
          type: 'smoothstep',
          style: { stroke: '#3F48CC', strokeWidth: 2 }
        });
      }

      // Process API Gateway
      if (regionData.APIGateway) {
        const apiNodeId = `api-${regionData.APIGateway.Id}`;
        nodes.push({
          id: apiNodeId,
          type: 'awsService',
          position: { x: regionIndex * 800 + 300, y: currentY + 150 },
          data: {
            type: 'APIGateway',
            label: regionData.APIGateway.Name,
            details: `${regionData.APIGateway.Endpoints?.length || 0} endpoints`
          }
        });

        // Connect to region
        edges.push({
          id: `edge-${regionNodeId}-${apiNodeId}`,
          source: regionNodeId,
          target: apiNodeId,
          type: 'smoothstep',
          style: { stroke: '#8C4FFF', strokeWidth: 2 }
        });
      }
    });

    return { nodes, edges };
  }, []);

  // Function to generate diagram from config
  const generateDiagram = useCallback((config) => {
    if (!config || !config.Regions) {
      alert('Invalid config format. Expected AWS config with Regions.');
      return;
    }

    const { nodes: newNodes, edges: newEdges } = parseAWSConfig(config);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [parseAWSConfig, setNodes, setEdges]);

  const handleGenerateDiagram = () => {
    try {
      if (configInput.trim()) {
        const config = JSON.parse(configInput);
        generateDiagram(config);
      } else {
        // Use your actual config if no input provided
        generateDiagram(actualConfig);
      }
    } catch (error) {
      alert('Invalid JSON config. Please check your input.');
      console.error('Config parsing error:', error);
    }
  };

  const loadActualConfig = () => {
    setConfigInput(JSON.stringify(actualConfig, null, 2));
  };

  const clearDiagram = () => {
    setNodes([]);
    setEdges([]);
    setConfigInput('');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* Config Input Panel */}
      <div style={{ 
        width: '400px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRight: '1px solid #ddd',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>AWS Config Input</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={loadActualConfig}
            style={{
              padding: '10px 15px',
              marginRight: '8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            Load Your Config
          </button>
          <button 
            onClick={handleGenerateDiagram}
            style={{
              padding: '10px 15px',
              marginRight: '8px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            Generate Diagram
          </button>
          <button 
            onClick={clearDiagram}
            style={{
              padding: '10px 15px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            Clear
          </button>
        </div>

        <textarea
          value={configInput}
          onChange={(e) => setConfigInput(e.target.value)}
          placeholder="Paste your AWS config JSON here..."
          style={{
            width: '100%',
            height: '500px',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'Consolas, Monaco, monospace',
            resize: 'vertical',
            lineHeight: '1.4'
          }}
        />

        <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
          <h4 style={{ marginBottom: '8px' }}>Supported AWS Resources:</h4>
          <div style={{ 
            background: '#fff', 
            padding: '12px', 
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            <div>🌍 Regions</div>
            <div>🏗️ VPCs</div>
            <div>🔗 Subnets</div>
            <div>💻 EC2 Instances</div>
            <div>🗄️ RDS Databases</div>
            <div>🛡️ Security Groups</div>
            <div>🚪 API Gateway</div>
          </div>
        </div>
      </div>

      {/* Diagram Panel */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          style={{ background: '#fafafa' }}
          fitViewOptions={{ padding: 0.1 }}
        >
          <Controls />
          <MiniMap 
            style={{
              height: 120,
              width: 200,
              backgroundColor: '#f8f9fa'
            }}
          />
          <Background variant="dots" gap={15} size={1} color="#e1e5e9" />
        </ReactFlow>
        
        {nodes.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#666',
            fontSize: '18px',
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏗️</div>
            <div>AWS Infrastructure Diagram Generator</div>
            <div style={{ fontSize: '14px', marginTop: '12px', color: '#888' }}>
              Click "Load Your Config" to visualize your AWS infrastructure
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AWSInfraDiagram;