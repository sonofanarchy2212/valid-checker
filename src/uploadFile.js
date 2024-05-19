import React, { useState } from 'react';
import { Upload, Button, Input, message } from 'antd';
import { UploadOutlined, CheckCircleOutlined, CloseCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import './UploadFile.css'; // Import file CSS

const { TextArea } = Input;

const UploadFile = () => {
  const [fileContent, setFileContent] = useState('');
  const [validBins, setValidBins] = useState('');
  const [invalidBins, setInvalidBins] = useState('');
  const [processing, setProcessing] = useState(false);
  const [totalChecked, setTotalChecked] = useState(0);
  const [totalLines, setTotalLines] = useState(0);

  const handleFileUpload = (info) => {
    const file = info.file.originFileObj;
    if (file) {
      // Set a temporary value for fileContent to enable the Check button
      setFileContent('Loading file content...');
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        setTotalLines(lines.length); // Update total lines
        // Update fileContent with the actual file content
        setFileContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleProcessFile = async () => {
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);

    setProcessing(true);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      try {
        const response = await fetch(`https://api.shuniji.io/api/bincheck?bin=${line}`);
        const result = await response.json();

        if (result.total_bins <= 2) {
          setValidBins(prev => prev +`${result.bins_data[0].BIN} | BANK NAME: ${result.bins_data[0].Bank} | ${result.bins_data[0].Country} | ${result.bins_data[0].Vendor} | Total bin: ${result.total_bins}\n`);
        } else {
          setInvalidBins(prev => prev +`${result.bins_data[0].BIN} | BANK NAME: ${result.bins_data[0].Bank} | ${result.bins_data[0].Country} | ${result.bins_data[0].Vendor} | Total bin: ${result.total_bins}\n`);
        }
      } catch (error) {
        message.error(`Error checking BIN: ${line}`);
      }
      setTotalChecked(i + 1); // Update total checked lines
    }
    setProcessing(false);
  };

  return (
    <div className="upload-container">
      <Upload onChange={handleFileUpload} maxCount={1}>
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
      <h3>Total: {totalChecked}/{totalLines} <ThunderboltOutlined /></h3>
      <div className="textarea-container">
        <div className="textarea-wrapper valid-bin">
          <h3><CheckCircleOutlined /> Valid bin</h3>
          <TextArea 
            value={validBins} 
            disabled 
            className="file-content" 
            rows={35}
            style={{ color: 'green', fontWeight: 'bold' }}
          />
        </div>
        <div className="textarea-wrapper invalid-bin">
          <h3><CloseCircleOutlined /> Invalid bin</h3>
          <TextArea 
            value={invalidBins} 
            disabled 
            className="file-content" 
            rows={35}
            style={{ color: 'red', fontWeight: 'bold' }}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
