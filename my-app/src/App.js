import './App.css';

import { Web3Storage } from 'web3.storage'
import React, { useState, useRef, useEffect  } from 'react';
import {ethers} from 'ethers'
import abi from "./contracts/contractAbi.json";

import EventLogReader from './eventReader';


// ipfs web3.storage
const apiToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQ0MzQ0NDRhNDNjQzRjMWQ3ODExOEQzOTVDOGE0MEI2NDRlZjI3MzMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTI5NzIxOTczMTgsIm5hbWUiOiJ5b3lvIn0.ynCNacPKZm7Xz0lsa1xQBdtm3wllBlohGO-hOwfu4bo";
const client = new Web3Storage({ token: apiToken });

//Adresse Smart contract
const CONTRACT_ADDRESS = '0x3BE204EC69C596D5EFBB5212D4994f7c351423c1';


let provider = new ethers.providers.Web3Provider(window.ethereum);
let contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
let signer;



function App() {
  const [files, setFiles] = useState([]);
  const [hashes, setHashes] = useState([]);
  const [hashesOnly, sethashesOnly] = useState([]);

  const [totalHash, setTotalHash] = useState(null);
  const [finalHash, setFinalHash] = useState(null);  

  const [cid, setCid] = useState(null);

  //Smart Contract .. delete
  const [response, setResponse] = useState(null);

  //logger
  // use the useState hook to manage the state of the filterString variable
  const [filterString, setFilterString] = useState(""); 
  const [showEventLogs, setShowEventLogs] = useState(false);

  useEffect(() => {
    setShowEventLogs(false);  // update the showEventLogs state to false whenever the filterString state changes
  }, [filterString]);  // only run when the filterString state changes

  const handleChange = (event) => {
    setFilterString(event.target.value);  // update the filterString state when the text field value changes
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowEventLogs(true);  // set showEventLogs to true to render the EventLogReader component
  }
//_______________________________________

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  }

  const handleHash = async () => {
    if (files.length === 0) {
      return;
    }

    const fileHashes = [];
    const onlythehashes = [];
    for (const file of files) {
      const fileContents = await file.text();
      const hash = ethers.utils.solidityKeccak256(['string'], [fileContents]);

      fileHashes.push({ file, hash });
      onlythehashes.push(hash);
    }
   
    setHashes(fileHashes);
    sethashesOnly(onlythehashes);

    console.log(fileHashes);
    console.log(hashesOnly);
  }

  const handleTotalHash = () => {

    //setTotalHash(ethers.utils.solidityKeccak256(['bytes[]'], [hashesOnly]));
    const packedHashes = ethers.utils.solidityPack(['bytes[]'], [hashesOnly]);
    setTotalHash(ethers.utils.solidityKeccak256(['bytes'], [packedHashes]));


  }

  const handleFinalHash = () => {

    setFinalHash(ethers.utils.solidityKeccak256(['string', 'bytes'], [cid, totalHash]));

  }
  


//ipfs upload mit web3storage
  const handleUpload = async () => {
    console.log(files[0]);
    console.log(files[1]);

    const rootCid = await client.put(files, {
      //name: "stuff",
      maxRetries: 3
    });

    console.log(rootCid);

    const res = await client.get(rootCid);
    const ipfsFiles = await res.files();
    console.log(ipfsFiles);
    const url = URL.createObjectURL(ipfsFiles[0]);
    console.log(url);

    // Update the CID state
    setCid(rootCid);      
  };

//load files with hash from ipfs
    const loadipfs = async () => {
 
      window.open("https://"+(cid)+".ipfs.w3s.link");  
  
    }
  
  //for testing variable contents
  const initializeContract = async () => {


    console.log(hashes);
    console.log(hashesOnly);




  }
// Add a function to call the contract's addProject function
  const handleAddProject = async () => {

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);


    if (!contract) {
      return;
    }

    console.log(hashesOnly);
    // Call addProject function

    await contract.addProject(hashesOnly, cid);

  }

  


  return (
    <div>
      <input type="file" onChange={handleFileChange} multiple />
      <button onClick={handleHash}>Hash</button>
      {
        hashes.map(({ file, hash }) => (
          <div key={file.name}>
            <p>{file.name}: {hash}</p>
          </div>
        ))
      }
      <button onClick={handleTotalHash}>Calculate total hash</button>
      {totalHash && <p>Total hash: {totalHash}</p>}

      <button onClick={handleUpload}>Upload to IPFS</button>
      {cid && <p>CID: {cid}</p>}

      <button onClick={handleFinalHash}>Calculate final hash</button>
      {finalHash && <p>Final hash: {finalHash}</p>}


      {/* getipfs with cid file open link with cid */}
      <button onClick={loadipfs}> show in ipfs </button>

      <button onClick={initializeContract}>testvariables</button>
      <button onClick={handleAddProject}>Add project</button>

   {/* log reader stuff */}
      <form onSubmit={handleSubmit}>
        <label>
          Enter filter string:
          <input type="text" value={filterString} onChange={handleChange} />
        </label>
        <button type="submit">Filter logs</button>
      </form>
      {showEventLogs && <EventLogReader filterString={filterString} />}  

    </div>
  );
}


export default App;
