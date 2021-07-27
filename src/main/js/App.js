import React from 'react'
import styled from 'styled-components'
import axios from 'axios'

import ApplyTemplate from 'components/coursetemplating/ApplyTemplate'
import TemplatingTabContent from 'components/coursetemplating/TemplatingTabContent'
import SyllabusSupplementTabContent from 'components/syllabus/SyllabusSupplementTabContent'
import SyllabusPreviewTabContent from 'components/syllabus/SyllabusPreviewTabContent'
import {CircleArrow as ScrollUpButton} from 'react-scroll-up-button';
import {Alert, Tabs, Tab} from "rivet-react"
import 'rivet-uits/css/rivet.min.css'

class App extends React.Component {
  /**
    * Initialization stuff
    */
  constructor() {
    super()
    // Set the x-auth-token head for all requests
    // The customId value got ijected in to the react.html file and is a global variable
    axios.defaults.headers.common['X-Auth-Token'] = customId;

    this.state = {
        hierarchy: [],
        notification: {display: false, text: ""}
    }
  }

  /**
   * Call off to the REST endpoints to load data
   * Also set a listener for cleaning up the modal after close
   */
  componentDidMount(){
  var self = this;
    axios.all([getHierarchy()])
        .then(axios.spread(function (hierarchy) {
            self.setState({
                hierarchy: hierarchy.data
            });
        }))
        .catch(error => {
            alert(error);
        });
  }

  /**
   * Render
   */
  render() {
    var title = "";
    var content = null;
    if (courseId) {
        title = "Apply Course Template";
        content = <ApplyTemplate notificationHandler={this.handleNotifications.bind(this)} />
    } else {
        title = "Canvas Node Manager";
        content = <NodeManager hierarchy={this.state.hierarchy} notificationHandler={this.handleNotifications.bind(this)} />
    }
    return (
        <div>
            <div className="rvt-container" id="main-container" role="main">
                <h1 className="rvt-ts-36 rvt-p-top-sm rvt-m-bottom-md">{title}</h1>

                <Alert variant="success" title="Success!" isOpen={this.state.notification.display} className="rvt-m-bottom-md"
                    onDismiss={() => this.setState({notification: {display: false}})}>
                      {this.state.notification.text}
                </Alert>

                {content}
            </div>
            <ScrollUpButton />
        </div>
    );
  }

  handleNotifications(notificationState) {
    this.setState({notification: notificationState});
  }

}

function NodeManager(props) {
    return (
        <Tabs variant="fitted">
            <Tab id="tab-templates" title="Course Templating">
                <TemplatingTabContent hierarchy={props.hierarchy} notificationHandler={props.notificationHandler} />
            </Tab>
            <Tab id="tab-supplements" title="Syllabus Supplements">
                <SyllabusSupplementTabContent hierarchy={props.hierarchy} notificationHandler={props.notificationHandler}/>
            </Tab>
            <Tab id="tab-preview" title="Preview Supplements">
                <SyllabusPreviewTabContent />
            </Tab>
        </Tabs>
    )
}

  function getHierarchy() {
    return axios.get(`app/tool/hierarchy`);
  }

export default App
