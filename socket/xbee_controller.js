const { FRAME_TYPE } = require('xbee-api').constants;
const Topics = require('./topics');

function isXbeeAuthorized(remote64, authorizedXbees) {
  return authorizedXbees.hasOwnProperty(remote64);
}

function discoverXbeeNodes(xbeeAPI) {
  const frameObj = {
    type: FRAME_TYPE.AT_COMMAND,
    command: 'ND',
    commandParameter: []
  };
  xbeeAPI.builder.write(frameObj);
}

function handleIncomingData(frame, authorizedXbees, mqttController) {
  switch (frame.type) {
    case FRAME_TYPE.ZIGBEE_RECEIVE_PACKET:
      processZigbeeReceivePacket(frame);
      break;
    case FRAME_TYPE.NODE_IDENTIFICATION:
      handleNodeIdentification(frame, authorizedXbees);
      break;
    case FRAME_TYPE.AT_COMMAND_RESPONSE:
      processAtCommandResponse(frame, authorizedXbees);
      break;
    case FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX:
      processIoDataSample(frame, authorizedXbees, mqttController);
      break;
  }
}

function processZigbeeReceivePacket(frame) {
  console.log('C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET');
  const dataReceived = String.fromCharCode.apply(null, frame.data);
  console.log('>> ZIGBEE_RECEIVE_PACKET >', dataReceived);
}

function handleNodeIdentification(frame, authorizedXbees) {
  const remote64 = frame.nodeIdentification.remote64.toString('hex');
  const nodeIdentifier = frame.nodeIdentification.nodeIdentifier;

  if (!isXbeeAuthorized(remote64, authorizedXbees)) {
    const topic = determineTopicByIdentifier(nodeIdentifier);
    if (topic) {
      authorizedXbees[remote64] = topic;
      console.log(`XBee Discovered: ${remote64} - ${nodeIdentifier}`);
    }
  }
}

function determineTopicByIdentifier(nodeIdentifier) {
  const nodeTopics = {
    'Laser 1': Topics.PHOTO_RES1,
    'Laser 2': Topics.PHOTO_RES0,
    'Laser 3': Topics.PHOTO_RES2,
    'Plaque Pression': Topics.PRESSURE
  };
  return nodeTopics[nodeIdentifier] || '';
}

function processAtCommandResponse(frame, authorizedXbees) {
  if (frame.command === 'ND' && frame.nodeIdentification) {
    handleNodeIdentification(frame, authorizedXbees);
  }
}

function processIoDataSample(frame, authorizedXbees, mqttController) {
  if (isXbeeAuthorized(frame.remote64, authorizedXbees)) {
    const dataToSend = `${frame.remote64},${frame.analogSamples.AD0}`;
    console.log("DataToSending", authorizedXbees[frame.remote64], frame.analogSamples.AD0);
    mqttController.mqttSendData(authorizedXbees[frame.remote64], dataToSend);
  }
}

module.exports = {
  isXbeeAuthorized,
  discoverXbeeNodes,
  handleIncomingData
};
