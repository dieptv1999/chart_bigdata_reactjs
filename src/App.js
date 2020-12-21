import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import AnalysisChart from './AnalysisChart';
import TagChart from './TagChart';


function App() {

  return (
    <Tabs>
      <TabList>
        <Tab>Tag</Tab>
        <Tab>Title 2</Tab>
      </TabList>

      <TabPanel>
        <TagChart />
      </TabPanel>
      <TabPanel>
        <AnalysisChart />
      </TabPanel>
    </Tabs>
  );
}

export default App;