import React, { useState } from 'react';
import { Upload, Button, Input, message } from 'antd';
import { UploadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import './UploadFile.css'; // Import file CSS

const { TextArea } = Input;

const UploadFile = () => {
  const [fileContent, setFileContent] = useState('');
  const [validBins, setValidBins] = useState('');
  const [invalidBins, setInvalidBins] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = (info) => {
    const file = info.file.originFileObj;
    if (file) {
      // Set a temporary value for fileContent to enable the Check button
      setFileContent('Loading file content...');
  
      const reader = new FileReader();
      reader.onload = (e) => {
        // Update fileContent with the actual file content
        setFileContent(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleProcessFile = async () => {
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);

    let validResults = [];
    let invalidResults = [];

    setProcessing(true);
    for (const line of lines) {
      try {
        const response = await fetch(`https://api.shuniji.io/api/bincheck?bin=${line}`);
        const result = await response.json();

        if (result.total_bins <= 2) {
          validResults.push(`${result.bins_data[0].BIN} | BANK NAME: ${result.bins_data[0].Bank} | ${result.bins_data[0].Country} | ${result.bins_data[0].Vendor} | Total bin: ${result.total_bins}`);
        } else {
          invalidResults.push(`${result.bins_data[0].BIN} | BANK NAME: ${result.bins_data[0].Bank} | ${result.bins_data[0].Country} | ${result.bins_data[0].Vendor} | Total bin: ${result.total_bins}`);
        }
      } catch (error) {
        message.error(`Error checking BIN: ${line}`);
      }
    }
    setProcessing(false);
    setValidBins(validResults.join('\n'));
    setInvalidBins(invalidResults.join('\n'));
  };

  return (
    <div className="upload-container">
      <Upload onChange={handleFileUpload}>
        <Button icon={<UploadOutlined />}>Choose File</Button>
      </Upload>
      <Button 
        type="primary" 
        onClick={handleProcessFile} 
        disabled={!fileContent || processing}
        loading={processing}
        style={{ marginTop: 20 }}
      >
        Check
      </Button>
      <div className="textarea-container">
        <div className="textarea-wrapper valid-bin">
          <h3><CheckCircleOutlined /> Valid bin</h3>
          <TextArea 
            value={validBins} 
            disabled 
            className="file-content" 
            rows={35}
          />
        </div>
        <div className="textarea-wrapper invalid-bin">
          <h3><CloseCircleOutlined /> Invalid bin</h3>
          <TextArea 
            value={invalidBins} 
            disabled 
            className="file-content" 
            rows={35}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
