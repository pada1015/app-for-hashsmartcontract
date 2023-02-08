import React from 'react';
import {ethers} from 'ethers';

import contractAbi from "./contracts/abi.json"
const contractAddress = '0x3BE204EC69C596D5EFBB5212D4994f7c351423c1';

const INFURA_PROVIDER_URL = 'https://goerli.infura.io/v3/5c3f1dffc3194ee6933a42b3a4358019';

class EventLogReader extends React.Component {
  state = {
    eventLogs: [],
  };

  async componentDidMount() {

    const provider = new ethers.providers.JsonRpcProvider(INFURA_PROVIDER_URL);
    const signer = provider.getSigner();


    const contract = new ethers.Contract(contractAddress, contractAbi, signer);

    // Define the event filter and poll for new event logs
    const eventFilter = {
      address: contractAddress,
      topics: ['0xb4e8f184bb41b011ad062bbb3bdb968084efa39aeb1d6ae0755af00e96e53b79'],
    };
    const eventLogs = await contract.queryFilter(eventFilter);
    this.setState({eventLogs});
  }

  render() {
    const { filterString } = this.props;

    // sort the eventLogs array in descending order by their blockNumber field
    const sortedEventLogs = this.state.eventLogs.sort((a, b) => b.blockNumber - a.blockNumber);

    // get the oldest event log by taking the first element in the sorted array
    const oldestEventLog = sortedEventLogs[0];

    return (
      <div>
        {oldestEventLog && (
          <div>
            Oldest event log:
            <pre>{JSON.stringify(oldestEventLog, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }
}

export default EventLogReader;
